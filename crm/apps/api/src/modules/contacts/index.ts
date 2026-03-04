import { Hono } from 'hono'
import { z } from 'zod'
import { zValidator } from '@hono/zod-validator'
import { AppError, errCode } from '../../lib/errors'
import { prisma } from '../../lib/db'
import { buildPagination } from '../../lib/pagination'
import { successResponse } from '../../lib/response'
import type { AuthUser } from '../../lib/middleware/auth'
import { calculateLeadScore, scoreToGrade } from '../../lib/leadScore'
import { recalcAndSaveLeadScore } from '../../lib/contactLeadScore'

const toContactOrder = {
  name: 'name',
  company: 'company',
  leadScore: 'leadScore',
  createdAt: 'createdAt',
} as const

const listSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
  q: z.string().max(100).optional(),
  grade: z.string().optional(),
  sortBy: z.enum(['name', 'company', 'leadScore', 'createdAt']).default('createdAt'),
  order: z.enum(['asc', 'desc']).default('desc'),
})

const tagsSchema = z.union([
  z.array(z.string().max(50)).max(10),
  z.string().transform((s) => (s ? s.split(',').map((t) => t.trim()).filter(Boolean).slice(0, 10) : [])),
])

const createSchema = z.object({
  name: z.string().min(1).max(100),
  email: z.string().email().optional(),
  phone: z.string().optional(),
  company: z.string().max(200).optional(),
  jobTitle: z.string().max(100).optional(),
  source: z.enum(['website', 'referral', 'ad', 'manual', 'other']).optional(),
  tags: tagsSchema.optional(),
  memo: z.string().max(5000).optional(),
})

const patchSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  email: z.string().email().optional(),
  phone: z.string().optional(),
  company: z.string().max(200).optional(),
  jobTitle: z.string().max(100).optional(),
  source: z.string().max(50).optional(),
  tags: tagsSchema.optional(),
  memo: z.string().max(5000).optional(),
})

const router = new Hono()

router.get('/', zValidator('query', listSchema), async (c) => {
  const query = c.req.valid('query')
  const user = c.get('user') as AuthUser
  const isAdmin = user.role === 'ADMIN'

  const where: any = {
    deletedAt: null,
  }

  if (!isAdmin) {
    where.ownerId = user.sub
  }

  if (query.q) {
    where.OR = [
      { name: { contains: query.q, mode: 'insensitive' } },
      { company: { contains: query.q, mode: 'insensitive' } },
      { email: { contains: query.q, mode: 'insensitive' } },
    ]
  }

  if (query.grade) {
    where.leadGrade = query.grade
  }

  const skip = (query.page - 1) * query.pageSize
  const [rows, total] = await Promise.all([
    prisma.contact.findMany({
      where,
      skip,
      take: query.pageSize,
      orderBy: { [toContactOrder[query.sortBy]]: query.order },
    }),
    prisma.contact.count({ where }),
  ])

  return c.json(
    successResponse(
      rows,
      buildPagination(query.page, query.pageSize, total),
    ),
  )
})

router.post('/', zValidator('json', createSchema), async (c) => {
  const user = c.get('user') as AuthUser
  const body = c.req.valid('json')

  const CONTACT_LIMIT_FREE = 100
  const count = await prisma.contact.count({
    where: { ownerId: user.sub, deletedAt: null },
  })
  if (count >= CONTACT_LIMIT_FREE) {
    throw new AppError(422, errCode.badRequest, '무료 고객 등록 한도를 초과했습니다. (최대 100명)')
  }

  if (body.email) {
    const dupEmail = await prisma.contact.findFirst({
      where: { ownerId: user.sub, email: body.email, deletedAt: null },
    })
    if (dupEmail) {
      throw new AppError(409, errCode.conflict, '이미 등록된 이메일입니다.')
    }
  }
  if (body.phone) {
    const dupPhone = await prisma.contact.findFirst({
      where: { ownerId: user.sub, phone: body.phone, deletedAt: null },
    })
    if (dupPhone) {
      throw new AppError(409, errCode.conflict, '이미 등록된 전화번호입니다.')
    }
  }

  const tags = Array.isArray(body.tags) ? body.tags : (body.tags ? [body.tags] : [])
  const created = await prisma.contact.create({
    data: {
      ownerId: user.sub,
      name: body.name,
      email: body.email,
      phone: body.phone,
      company: body.company,
      jobTitle: body.jobTitle,
      source: body.source,
      tags: tags.length ? tags : undefined,
      memo: body.memo,
    },
  })

  const score = calculateLeadScore({
    activityCount: 0,
    wonDealsCount: 0,
    openTasksCount: 0,
    hasEmail: !!body.email,
    hasPhone: !!body.phone,
    hasCompany: !!body.company,
    source: body.source,
  })
  const grade = scoreToGrade(score)

  await prisma.contact.update({
    where: { id: created.id },
    data: { leadScore: score, leadGrade: grade },
  })

  await prisma.leadScore.create({
    data: {
      contactId: created.id,
      userId: user.sub,
      score,
      grade,
      summary: '신규 등록',
    },
  })

  await prisma.activity.create({
    data: {
      ownerId: user.sub,
      contactId: created.id,
      type: 'NOTE',
      title: '연락처 등록',
      note: '시스템에 연락처가 등록되었습니다.',
      performedAt: new Date(),
    },
  })

  const result = await prisma.contact.findUnique({
    where: { id: created.id },
  })

  return c.json(successResponse(result), 201)
})

router.post('/import', async (c) => {
  const user = c.get('user') as AuthUser
  const ct = (c.req.header('content-type') || '').toLowerCase()
  if (ct.includes('text/csv') || ct.includes('text/plain') || ct.includes('application/octet-stream')) {
    const body = await c.req.text()
    const lines = body.trim().split(/\r?\n/)
    const header = lines[0]?.split(',').map((s) => s.trim()) || []
    const nameIdx = header.findIndex((h) => /name|이름|성함/i.test(h))
    const emailIdx = header.findIndex((h) => /email|이메일|메일/i.test(h))
    const phoneIdx = header.findIndex((h) => /phone|전화|휴대폰/i.test(h))
    const companyIdx = header.findIndex((h) => /company|회사|company/i.test(h))

    if (nameIdx < 0) {
      throw new AppError(400, errCode.badRequest, 'CSV에 name(이름) 컬럼이 필요합니다.')
    }

    const CONTACT_LIMIT_FREE = 100
    const created: string[] = []
    const failed: { row: number; reason: string }[] = []

    for (let i = 1; i < lines.length; i++) {
      const currentCount = await prisma.contact.count({
        where: { ownerId: user.sub, deletedAt: null },
      })
      if (currentCount >= CONTACT_LIMIT_FREE) {
        failed.push({ row: i + 1, reason: '고객 수 한도 초과 (100명)' })
        continue
      }

      const cols = lines[i].split(',').map((s) => s.trim())
      const name = cols[nameIdx] || ''
      if (!name) {
        failed.push({ row: i + 1, reason: '이름 누락' })
        continue
      }
      const email = emailIdx >= 0 ? cols[emailIdx] : undefined
      const phone = phoneIdx >= 0 ? cols[phoneIdx] : undefined
      const company = companyIdx >= 0 ? cols[companyIdx] : undefined

      if (email) {
        const dup = await prisma.contact.findFirst({
          where: { ownerId: user.sub, email, deletedAt: null },
        })
        if (dup) {
          failed.push({ row: i + 1, reason: '이메일 중복' })
          continue
        }
      }

      const contact = await prisma.contact.create({
        data: {
          ownerId: user.sub,
          name,
          email: email || null,
          phone: phone || null,
          company: company || null,
        },
      })

      const score = calculateLeadScore({
        activityCount: 0,
        wonDealsCount: 0,
        openTasksCount: 0,
        hasEmail: !!email,
        hasPhone: !!phone,
        hasCompany: !!company,
        source: undefined,
      })

      await prisma.contact.update({
        where: { id: contact.id },
        data: { leadScore: score, leadGrade: scoreToGrade(score) },
      })

      await prisma.leadScore.create({
        data: { contactId: contact.id, userId: user.sub, score, grade: scoreToGrade(score), summary: 'CSV import' },
      })

      await prisma.activity.create({
        data: {
          ownerId: user.sub,
          contactId: contact.id,
          type: 'NOTE',
          title: 'CSV 일괄 등록',
          note: '시스템에 연락처가 등록되었습니다.',
          performedAt: new Date(),
        },
      })

      created.push(contact.id)
    }

    return c.json(
      successResponse({
        created: created.length,
        failed: failed.length,
        total: lines.length - 1,
        failedRows: failed.length > 0 ? failed.slice(0, 10) : undefined,
      }),
    )
  }

  throw new AppError(400, errCode.badRequest, 'Content-Type: text/csv 또는 text/plain으로 CSV 텍스트를 전송해주세요.')
})

router.get('/:id', async (c) => {
  const user = c.get('user') as AuthUser
  const id = c.req.param('id')
  const contact = await prisma.contact.findUnique({
    where: { id },
    include: { owner: { select: { id: true, name: true, email: true } }, deals: true, activities: true },
  })

  if (!contact || contact.deletedAt) {
    throw new AppError(404, errCode.notFound, '연락처를 찾을 수 없습니다.')
  }

  if (user.role !== 'ADMIN' && contact.ownerId !== user.sub) {
    throw new AppError(403, errCode.forbidden, '접근 권한이 없습니다.')
  }

  return c.json(successResponse(contact))
})

router.patch('/:id', zValidator('json', patchSchema), async (c) => {
  const user = c.get('user') as AuthUser
  const id = c.req.param('id')
  const body = c.req.valid('json')

  const target = await prisma.contact.findUnique({ where: { id } })
  if (!target || target.deletedAt) {
    throw new AppError(404, errCode.notFound, '연락처를 찾을 수 없습니다.')
  }

  if (user.role !== 'ADMIN' && target.ownerId !== user.sub) {
    throw new AppError(403, errCode.forbidden, '접근 권한이 없습니다.')
  }

  if (body.email && body.email !== target.email) {
    const dup = await prisma.contact.findFirst({
      where: { ownerId: target.ownerId, email: body.email, deletedAt: null, id: { not: id } },
    })
    if (dup) throw new AppError(409, errCode.conflict, '이미 등록된 이메일입니다.')
  }
  if (body.phone && body.phone !== target.phone) {
    const dup = await prisma.contact.findFirst({
      where: { ownerId: target.ownerId, phone: body.phone, deletedAt: null, id: { not: id } },
    })
    if (dup) throw new AppError(409, errCode.conflict, '이미 등록된 전화번호입니다.')
  }

  const tags: string[] | undefined =
    body.tags === undefined
      ? undefined
      : Array.isArray(body.tags)
        ? body.tags
        : [String(body.tags)].flatMap((s) => s.split(',').map((t) => t.trim()).filter(Boolean))

  const updated = await prisma.contact.update({
    where: { id },
    data: {
      ...(body.name != null && { name: body.name }),
      ...(body.email !== undefined && { email: body.email || null }),
      ...(body.phone !== undefined && { phone: body.phone || null }),
      ...(body.company !== undefined && { company: body.company || null }),
      ...(body.jobTitle !== undefined && { jobTitle: body.jobTitle || null }),
      ...(body.source !== undefined && { source: body.source || null }),
      ...(tags !== undefined && { tags }),
      ...(body.memo !== undefined && { memo: body.memo || null }),
    },
  })

  await recalcAndSaveLeadScore(prisma, id, target.ownerId)

  const result = await prisma.contact.findUnique({ where: { id } })
  return c.json(successResponse(result))
})

router.delete('/:id', async (c) => {
  const user = c.get('user') as AuthUser
  const id = c.req.param('id')
  const target = await prisma.contact.findUnique({ where: { id } })

  if (!target || target.deletedAt) {
    throw new AppError(404, errCode.notFound, '연락처를 찾을 수 없습니다.')
  }

  if (user.role !== 'ADMIN' && target.ownerId !== user.sub) {
    throw new AppError(403, errCode.forbidden, '접근 권한이 없습니다.')
  }

  await prisma.contact.update({ where: { id }, data: { deletedAt: new Date() } })
  return c.json(successResponse({ ok: true }))
})

router.post('/:id/restore', async (c) => {
  const user = c.get('user') as AuthUser
  const id = c.req.param('id')
  const target = await prisma.contact.findUnique({ where: { id } })

  if (!target || !target.deletedAt) {
    throw new AppError(404, errCode.notFound, '복구할 연락처를 찾을 수 없습니다.')
  }

  if (user.role !== 'ADMIN' && target.ownerId !== user.sub) {
    throw new AppError(403, errCode.forbidden, '접근 권한이 없습니다.')
  }

  await prisma.contact.update({ where: { id }, data: { deletedAt: null } })
  const restored = await prisma.contact.findUnique({ where: { id } })
  return c.json(successResponse(restored))
})

router.get('/:id/activities', async (c) => {
  const user = c.get('user') as AuthUser
  const id = c.req.param('id')
  const ownerFilter = user.role === 'ADMIN' ? {} : { ownerId: user.sub }

  const contact = await prisma.contact.findUnique({
    where: { id, ...ownerFilter },
  })
  if (!contact || contact.deletedAt) {
    throw new AppError(404, errCode.notFound, '연락처를 찾을 수 없습니다.')
  }

  const activities = await prisma.activity.findMany({
    where: { contactId: id, deletedAt: null },
    orderBy: { createdAt: 'desc' },
  })

  return c.json(successResponse(activities))
})

router.post('/:id/activities', async (c) => {
  const user = c.get('user') as AuthUser
  const id = c.req.param('id')
  const ownerFilter = user.role === 'ADMIN' ? {} : { ownerId: user.sub }

  const contact = await prisma.contact.findUnique({
    where: { id, ...ownerFilter },
  })

  if (!contact || contact.deletedAt) {
    throw new AppError(404, errCode.notFound, '연락처를 찾을 수 없습니다.')
  }

  const payload = await c.req.json()
  const performedAt = new Date()
  const created = await prisma.activity.create({
    data: {
      ownerId: user.sub,
      contactId: id,
      type: payload.type ?? 'NOTE',
      title: payload.title,
      note: payload.note,
      scheduledAt: payload.scheduledAt ? new Date(payload.scheduledAt) : null,
      performedAt,
    },
  })

  await prisma.contact.update({
    where: { id },
    data: { lastContactAt: performedAt },
  })

  return c.json(successResponse(created), 201)
})

export default router
