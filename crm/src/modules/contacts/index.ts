import { Hono } from 'hono'
import { z } from 'zod'
import { zValidator } from '@hono/zod-validator'
import { AppError, errCode } from '../../lib/errors'
import { prisma } from '../../lib/db'
import { buildPagination } from '../../lib/pagination'
import { successResponse } from '../../lib/response'
import type { AuthUser } from '../../lib/middleware/auth'
import { Role } from '../../lib/token'

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

const createSchema = z.object({
  name: z.string().min(1),
  email: z.string().email().optional(),
  phone: z.string().optional(),
  company: z.string().optional(),
  leadGrade: z.string().optional(),
})

const patchSchema = z.object({
  name: z.string().min(1).optional(),
  email: z.string().email().optional(),
  phone: z.string().optional(),
  company: z.string().optional(),
  leadGrade: z.string().optional(),
  leadScore: z.number().min(0).max(100).optional(),
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

  const created = await prisma.contact.create({
    data: {
      ownerId: user.sub,
      name: body.name,
      email: body.email,
      phone: body.phone,
      company: body.company,
      leadGrade: body.leadGrade,
    },
  })

  return c.json(successResponse(created), 201)
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

  const updated = await prisma.contact.update({
    where: { id },
    data: {
      ...body,
    },
  })

  return c.json(successResponse(updated))
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
  const created = await prisma.activity.create({
    data: {
      ownerId: user.sub,
      contactId: id,
      type: payload.type ?? 'NOTE',
      title: payload.title,
      note: payload.note,
      scheduledAt: payload.scheduledAt ? new Date(payload.scheduledAt) : null,
      performedAt: new Date(),
    },
  })

  return c.json(successResponse(created), 201)
})

export default router
