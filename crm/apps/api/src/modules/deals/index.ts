import { Hono } from 'hono'
import { z } from 'zod'
import { zValidator } from '@hono/zod-validator'
import { AppError, errCode } from '../../lib/errors'
import { prisma } from '../../lib/db'
import { buildPagination } from '../../lib/pagination'
import { successResponse } from '../../lib/response'
import type { AuthUser } from '../../lib/middleware/auth'

const listSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
  stage: z.string().optional(),
  q: z.string().optional(),
  sortBy: z.enum(['title', 'createdAt', 'amount', 'probability']).default('createdAt'),
  order: z.enum(['asc', 'desc']).default('desc'),
})

const createSchema = z.object({
  title: z.string().min(1),
  description: z.string().max(5000).optional(),
  amount: z.coerce.number().min(0).default(0),
  probability: z.number().min(0).max(100).default(0),
  stage: z.enum(['LEAD', 'QUALIFIED', 'PROPOSAL', 'NEGOTIATION', 'WON', 'LOST']).default('LEAD'),
  expectedCloseDate: z.string().optional(),
  actualCloseDate: z.string().optional(),
  contactId: z.string().uuid().optional(),
})

const stageSchema = z.object({
  stage: z.enum(['LEAD', 'QUALIFIED', 'PROPOSAL', 'NEGOTIATION', 'WON', 'LOST']),
})

const patchSchema = z.object({
  title: z.string().min(1).optional(),
  description: z.string().max(5000).optional(),
  amount: z.number().min(0).optional(),
  probability: z.number().min(0).max(100).optional(),
  expectedCloseDate: z.string().optional(),
  actualCloseDate: z.string().optional(),
  contactId: z.string().uuid().optional(),
})

const STAGE_ORDER = ['LEAD', 'QUALIFIED', 'PROPOSAL', 'NEGOTIATION', 'WON', 'LOST'] as const
const STAGE_NAMES: Record<string, string> = {
  LEAD: '리드',
  QUALIFIED: '기회',
  PROPOSAL: '제안',
  NEGOTIATION: '협상',
  WON: '계약',
  LOST: '실패',
}

const router = new Hono()

router.get('/', zValidator('query', listSchema), async (c) => {
  const user = c.get('user') as AuthUser
  const query = c.req.valid('query')
  const where: any = {
    deletedAt: null,
    ownerId: user.role === 'ADMIN' ? undefined : user.sub,
  }

  if (query.stage) {
    where.stage = query.stage
  }

  if (query.q) {
    where.title = { contains: query.q, mode: 'insensitive' }
  }

  const skip = (query.page - 1) * query.pageSize
  const [rows, total] = await Promise.all([
    prisma.deal.findMany({
      where,
      skip,
      take: query.pageSize,
      orderBy: { [query.sortBy]: query.order },
      include: { contact: true },
    }),
    prisma.deal.count({ where }),
  ])

  return c.json(successResponse(rows, buildPagination(query.page, query.pageSize, total)))
})

router.get('/pipeline', async (c) => {
  const user = c.get('user') as AuthUser
  const where = {
    deletedAt: null,
    ...(user.role !== 'ADMIN' && { ownerId: user.sub }),
  }

  const allDeals = await prisma.deal.findMany({
    where,
    include: {
      contact: { select: { id: true, name: true, company: true } },
    },
    orderBy: { createdAt: 'desc' },
  })

  const stages = STAGE_ORDER.map((stageId) => {
    const deals = allDeals
      .filter((d) => d.stage === stageId)
      .map((d) => ({
        id: d.id,
        title: d.title,
        amount: d.amount,
        probability: d.probability,
        expectedCloseDate: d.expectedCloseDate,
        contact: d.contact,
      }))
    return {
      id: stageId.toLowerCase(),
      name: STAGE_NAMES[stageId] ?? stageId,
      deals,
    }
  })

  const totalDeals = allDeals.length
  const totalAmount = allDeals.reduce((sum, d) => sum + Number(d.amount), 0)
  const weightedAmount = allDeals.reduce((sum, d) => sum + Number(d.amount) * (d.probability / 100), 0)

  return c.json(
    successResponse({
      stages,
      summary: {
        totalDeals,
        totalAmount,
        weightedAmount: Math.round(weightedAmount),
      },
    }),
  )
})

router.post('/', zValidator('json', createSchema), async (c) => {
  const user = c.get('user') as AuthUser
  const body = c.req.valid('json')

  if (body.contactId) {
    const contact = await prisma.contact.findUnique({ where: { id: body.contactId } })
    if (!contact || contact.deletedAt) {
      throw new AppError(404, errCode.notFound, '선택한 연락처가 존재하지 않습니다.')
    }
  }

  const created = await prisma.deal.create({
    data: {
      ownerId: user.sub,
      title: body.title,
      description: body.description,
      amount: body.amount,
      probability: body.probability,
      stage: body.stage,
      expectedCloseDate: body.expectedCloseDate ? new Date(body.expectedCloseDate) : null,
      actualCloseDate: body.actualCloseDate ? new Date(body.actualCloseDate) : (body.stage === 'WON' || body.stage === 'LOST' ? new Date() : null),
      contactId: body.contactId,
    },
  })

  return c.json(successResponse(created), 201)
})

router.get('/:id', async (c) => {
  const user = c.get('user') as AuthUser
  const id = c.req.param('id')

  const row = await prisma.deal.findUnique({
    where: { id },
    include: { contact: true, activities: true, tasks: true },
  })

  if (!row || row.deletedAt) {
    throw new AppError(404, errCode.notFound, '딜을 찾을 수 없습니다.')
  }
  if (user.role !== 'ADMIN' && row.ownerId !== user.sub) {
    throw new AppError(403, errCode.forbidden, '접근 권한이 없습니다.')
  }

  return c.json(successResponse(row))
})

router.patch('/:id', zValidator('json', patchSchema), async (c) => {
  const user = c.get('user') as AuthUser
  const id = c.req.param('id')
  const body = c.req.valid('json')
  const row = await prisma.deal.findUnique({ where: { id } })

  if (!row || row.deletedAt) {
    throw new AppError(404, errCode.notFound, '딜을 찾을 수 없습니다.')
  }
  if (user.role !== 'ADMIN' && row.ownerId !== user.sub) {
    throw new AppError(403, errCode.forbidden, '접근 권한이 없습니다.')
  }

  const updateData: Record<string, unknown> = {
    ...(body.title != null && { title: body.title }),
    ...(body.description !== undefined && { description: body.description }),
    ...(body.amount != null && { amount: body.amount }),
    ...(body.probability != null && { probability: body.probability }),
    ...(body.expectedCloseDate !== undefined && {
      expectedCloseDate: body.expectedCloseDate ? new Date(body.expectedCloseDate) : null,
    }),
    ...(body.actualCloseDate !== undefined && {
      actualCloseDate: body.actualCloseDate ? new Date(body.actualCloseDate) : null,
    }),
    ...(body.contactId !== undefined && { contactId: body.contactId }),
  }

  const updated = await prisma.deal.update({
    where: { id },
    data: updateData,
  })

  return c.json(successResponse(updated))
})

router.patch('/:id/stage', zValidator('json', stageSchema), async (c) => {
  const user = c.get('user') as AuthUser
  const id = c.req.param('id')
  const body = c.req.valid('json')
  const row = await prisma.deal.findUnique({ where: { id } })

  if (!row || row.deletedAt) {
    throw new AppError(404, errCode.notFound, '딜을 찾을 수 없습니다.')
  }
  if (user.role !== 'ADMIN' && row.ownerId !== user.sub) {
    throw new AppError(403, errCode.forbidden, '접근 권한이 없습니다.')
  }

  const isClosed = body.stage === 'WON' || body.stage === 'LOST'
  const actualClose = isClosed && !row.actualCloseDate ? new Date() : undefined
  const changed = await prisma.deal.update({
    where: { id },
    data: {
      stage: body.stage,
      ...(actualClose && { actualCloseDate: actualClose }),
    },
  })

  await prisma.dealStageHistory.create({
    data: {
      dealId: id,
      userId: user.sub,
      fromStage: row.stage,
      toStage: body.stage,
    },
  })

  return c.json(successResponse(changed))
})

router.delete('/:id', async (c) => {
  const user = c.get('user') as AuthUser
  const id = c.req.param('id')
  const row = await prisma.deal.findUnique({ where: { id } })

  if (!row || row.deletedAt) {
    throw new AppError(404, errCode.notFound, '딜을 찾을 수 없습니다.')
  }
  if (user.role !== 'ADMIN' && row.ownerId !== user.sub) {
    throw new AppError(403, errCode.forbidden, '접근 권한이 없습니다.')
  }

  await prisma.deal.update({ where: { id }, data: { deletedAt: new Date() } })
  return c.json(successResponse({ ok: true }))
})

router.post('/:id/restore', async (c) => {
  const user = c.get('user') as AuthUser
  const id = c.req.param('id')
  const target = await prisma.deal.findUnique({ where: { id } })

  if (!target || !target.deletedAt) {
    throw new AppError(404, errCode.notFound, '복구할 딜을 찾을 수 없습니다.')
  }

  if (user.role !== 'ADMIN' && target.ownerId !== user.sub) {
    throw new AppError(403, errCode.forbidden, '접근 권한이 없습니다.')
  }

  await prisma.deal.update({ where: { id }, data: { deletedAt: null } })
  const restored = await prisma.deal.findUnique({ where: { id } })
  return c.json(successResponse(restored))
})

export default router
