import { Hono } from 'hono'
import { z } from 'zod'
import { zValidator } from '@hono/zod-validator'
import { AppError, errCode } from '../../lib/errors'
import { buildPagination } from '../../lib/pagination'
import { successResponse } from '../../lib/response'
import { prisma } from '../../lib/db'
import type { AuthUser } from '../../lib/middleware/auth'

const listSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
  status: z.enum(['all', 'open', 'done']).default('all'),
})

const createSchema = z.object({
  title: z.string().min(1),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH']).default('MEDIUM'),
  dueDate: z.string().optional(),
  note: z.string().optional(),
  contactId: z.string().cuid().optional(),
  dealId: z.string().cuid().optional(),
})

const router = new Hono()

router.get('/', zValidator('query', listSchema), async (c) => {
  const user = c.get('user') as AuthUser
  const q = c.req.valid('query')

  const where: any = {
    deletedAt: null,
    ownerId: user.role === 'ADMIN' ? undefined : user.sub,
  }

  if (q.status === 'open') where.completedAt = null
  if (q.status === 'done') where.completedAt = { not: null }

  const skip = (q.page - 1) * q.pageSize
  const [rows, total] = await Promise.all([
    prisma.task.findMany({ where, skip, take: q.pageSize, orderBy: { dueDate: 'asc' } }),
    prisma.task.count({ where }),
  ])

  return c.json(successResponse(rows, buildPagination(q.page, q.pageSize, total)))
})

router.post('/', zValidator('json', createSchema), async (c) => {
  const user = c.get('user') as AuthUser
  const body = c.req.valid('json')

  const created = await prisma.task.create({
    data: {
      ownerId: user.sub,
      title: body.title,
      priority: body.priority,
      dueDate: body.dueDate ? new Date(body.dueDate) : null,
      note: body.note,
      contactId: body.contactId,
      dealId: body.dealId,
    },
  })

  return c.json(successResponse(created), 201)
})

router.patch('/:id/complete', async (c) => {
  const user = c.get('user') as AuthUser
  const id = c.req.param('id')

  const task = await prisma.task.findUnique({ where: { id } })
  if (!task || task.deletedAt) {
    throw new AppError(404, errCode.notFound, '작업을 찾을 수 없습니다.')
  }

  if (user.role !== 'ADMIN' && task.ownerId !== user.sub) {
    throw new AppError(403, errCode.forbidden, '접근 권한이 없습니다.')
  }

  const updated = await prisma.task.update({
    where: { id },
    data: { completedAt: task.completedAt ? null : new Date() },
  })

  return c.json(successResponse(updated))
})

export default router
