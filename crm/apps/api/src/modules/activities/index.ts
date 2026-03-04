import { Hono } from 'hono'
import { z } from 'zod'
import { zValidator } from '@hono/zod-validator'
import { AppError, errCode } from '../../lib/errors'
import { buildPagination } from '../../lib/pagination'
import { successResponse } from '../../lib/response'
import { prisma } from '../../lib/db'
import type { AuthUser } from '../../lib/middleware/auth'

const querySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
  contactId: z.string().uuid().optional(),
  dealId: z.string().uuid().optional(),
})

const createSchema = z.object({
  type: z.enum(['NOTE', 'CALL', 'EMAIL', 'MEETING']),
  title: z.string().min(1),
  note: z.string().optional(),
  contactId: z.string().uuid().optional(),
  dealId: z.string().uuid().optional(),
  scheduledAt: z.string().optional(),
})

const router = new Hono()

router.get('/', zValidator('query', querySchema), async (c) => {
  const user = c.get('user') as AuthUser
  const q = c.req.valid('query')
  const where: any = {
    deletedAt: null,
    ownerId: user.role === 'ADMIN' ? undefined : user.sub,
  }
  if (q.contactId) where.contactId = q.contactId
  if (q.dealId) where.dealId = q.dealId

  const skip = (q.page - 1) * q.pageSize
  const [rows, total] = await Promise.all([
    prisma.activity.findMany({ where, skip, take: q.pageSize, orderBy: { createdAt: 'desc' } }),
    prisma.activity.count({ where }),
  ])

  return c.json(successResponse(rows, buildPagination(q.page, q.pageSize, total)))
})

router.post('/', zValidator('json', createSchema), async (c) => {
  const user = c.get('user') as AuthUser
  const body = c.req.valid('json')

  if (body.contactId) {
    const contact = await prisma.contact.findUnique({ where: { id: body.contactId } })
    if (!contact || contact.deletedAt) {
      throw new AppError(404, errCode.notFound, '연락처를 찾을 수 없습니다.')
    }
  }

  if (body.dealId) {
    const deal = await prisma.deal.findUnique({ where: { id: body.dealId } })
    if (!deal || deal.deletedAt) {
      throw new AppError(404, errCode.notFound, '딜을 찾을 수 없습니다.')
    }
  }

  const performedAt = new Date()
  const created = await prisma.activity.create({
    data: {
      ownerId: user.sub,
      type: body.type,
      title: body.title,
      note: body.note,
      contactId: body.contactId,
      dealId: body.dealId,
      scheduledAt: body.scheduledAt ? new Date(body.scheduledAt) : null,
      performedAt,
    },
  })

  if (body.contactId) {
    await prisma.contact.update({
      where: { id: body.contactId },
      data: { lastContactAt: performedAt },
    })
  }

  return c.json(successResponse(created), 201)
})

export default router
