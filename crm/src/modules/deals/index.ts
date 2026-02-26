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
  amount: z.coerce.number().min(0).default(0),
  probability: z.number().min(0).max(100).default(0),
  stage: z.enum(['LEAD', 'QUALIFIED', 'PROPOSAL', 'NEGOTIATION', 'WON', 'LOST']).default('LEAD'),
  expectedCloseDate: z.string().optional(),
  contactId: z.string().cuid().optional(),
})

const stageSchema = z.object({
  stage: z.enum(['LEAD', 'QUALIFIED', 'PROPOSAL', 'NEGOTIATION', 'WON', 'LOST']),
})

const patchSchema = z.object({
  title: z.string().min(1).optional(),
  amount: z.number().min(0).optional(),
  probability: z.number().min(0).max(100).optional(),
  expectedCloseDate: z.string().optional(),
  contactId: z.string().cuid().optional(),
})

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
    ownerId: user.role === 'ADMIN' ? undefined : user.sub,
  }
  const rows = await prisma.deal.groupBy({
    by: ['stage'],
    _count: { _all: true },
    where,
    orderBy: { stage: 'asc' },
  })

  return c.json(successResponse(rows))
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
      amount: body.amount,
      probability: body.probability,
      stage: body.stage,
      expectedCloseDate: body.expectedCloseDate ? new Date(body.expectedCloseDate) : null,
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

  const updated = await prisma.deal.update({
    where: { id },
    data: {
      ...body,
      expectedCloseDate: body.expectedCloseDate ? new Date(body.expectedCloseDate) : undefined,
    },
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

  const changed = await prisma.deal.update({
    where: { id },
    data: { stage: body.stage },
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

export default router
