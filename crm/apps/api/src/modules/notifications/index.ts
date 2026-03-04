import { Hono } from 'hono'
import { z } from 'zod'
import { zValidator } from '@hono/zod-validator'
import { AppError, errCode } from '../../lib/errors'
import { buildPagination } from '../../lib/pagination'
import { successResponse } from '../../lib/response'
import { prisma } from '../../lib/db'
import type { AuthUser } from '../../lib/middleware/auth'

const router = new Hono()

const listSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(50).default(20),
  unreadOnly: z.coerce.boolean().default(false),
})

router.get('/', zValidator('query', listSchema), async (c) => {
  const user = c.get('user') as AuthUser
  const query = c.req.valid('query')

  const where: { userId: string; readAt?: null } = {
    userId: user.sub,
  }
  if (query.unreadOnly) where.readAt = null

  const skip = (query.page - 1) * query.pageSize
  const [rows, total] = await Promise.all([
    prisma.notification.findMany({
      where,
      skip,
      take: query.pageSize,
      orderBy: { createdAt: 'desc' },
    }),
    prisma.notification.count({ where }),
  ])

  return c.json(successResponse(rows, buildPagination(query.page, query.pageSize, total)))
})

router.patch('/:id/read', async (c) => {
  const user = c.get('user') as AuthUser
  const id = c.req.param('id')

  const row = await prisma.notification.findUnique({ where: { id } })
  if (!row || row.userId !== user.sub) {
    throw new AppError(404, errCode.notFound, '알림을 찾을 수 없습니다.')
  }

  const updated = await prisma.notification.update({
    where: { id },
    data: { readAt: new Date() },
  })

  return c.json(successResponse(updated))
})

router.patch('/read-all', async (c) => {
  const user = c.get('user') as AuthUser

  await prisma.notification.updateMany({
    where: { userId: user.sub, readAt: null },
    data: { readAt: new Date() },
  })

  return c.json(successResponse({ ok: true }))
})

export default router
