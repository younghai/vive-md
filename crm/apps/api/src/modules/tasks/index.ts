import { Hono } from 'hono'
import { z } from 'zod'
import { zValidator } from '@hono/zod-validator'
import { AppError, errCode } from '../../lib/errors'
import { buildPagination } from '../../lib/pagination'
import { successResponse } from '../../lib/response'
import { prisma } from '../../lib/db'
import type { AuthUser } from '../../lib/middleware/auth'

const patchSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH']).optional(),
  dueDate: z.string().optional(),
  note: z.string().max(1000).optional(),
  contactId: z.string().uuid().optional().nullable(),
  dealId: z.string().uuid().optional().nullable(),
})

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
  contactId: z.string().uuid().optional(),
  dealId: z.string().uuid().optional(),
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

  const dueDate = body.dueDate ? new Date(body.dueDate) : null
  const created = await prisma.task.create({
    data: {
      ownerId: user.sub,
      title: body.title,
      priority: body.priority,
      dueDate,
      note: body.note,
      contactId: body.contactId,
      dealId: body.dealId,
    },
  })

  if (dueDate) {
    await prisma.notification.create({
      data: {
        userId: user.sub,
        type: 'task_due',
        title: `작업 마감: ${body.title}`,
        body: `마감일: ${dueDate.toLocaleDateString('ko-KR')}`,
      },
    })
  }

  return c.json(successResponse(created), 201)
})

router.get('/:id', async (c) => {
  const user = c.get('user') as AuthUser
  const id = c.req.param('id')

  const task = await prisma.task.findUnique({
    where: { id },
    include: { contact: { select: { id: true, name: true } }, deal: { select: { id: true, title: true } } },
  })

  if (!task || task.deletedAt) {
    throw new AppError(404, errCode.notFound, '작업을 찾을 수 없습니다.')
  }

  if (user.role !== 'ADMIN' && task.ownerId !== user.sub) {
    throw new AppError(403, errCode.forbidden, '접근 권한이 없습니다.')
  }

  return c.json(successResponse(task))
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

router.patch('/:id', zValidator('json', patchSchema), async (c) => {
  const user = c.get('user') as AuthUser
  const id = c.req.param('id')
  const body = c.req.valid('json')

  const task = await prisma.task.findUnique({ where: { id } })
  if (!task || task.deletedAt) {
    throw new AppError(404, errCode.notFound, '작업을 찾을 수 없습니다.')
  }

  if (user.role !== 'ADMIN' && task.ownerId !== user.sub) {
    throw new AppError(403, errCode.forbidden, '접근 권한이 없습니다.')
  }

  const updated = await prisma.task.update({
    where: { id },
    data: {
      ...(body.title != null && { title: body.title }),
      ...(body.priority != null && { priority: body.priority }),
      ...(body.dueDate !== undefined && { dueDate: body.dueDate ? new Date(body.dueDate) : null }),
      ...(body.note !== undefined && { note: body.note }),
      ...(body.contactId !== undefined && { contactId: body.contactId }),
      ...(body.dealId !== undefined && { dealId: body.dealId }),
    },
  })

  return c.json(successResponse(updated))
})

router.delete('/:id', async (c) => {
  const user = c.get('user') as AuthUser
  const id = c.req.param('id')

  const task = await prisma.task.findUnique({ where: { id } })
  if (!task || task.deletedAt) {
    throw new AppError(404, errCode.notFound, '작업을 찾을 수 없습니다.')
  }

  if (user.role !== 'ADMIN' && task.ownerId !== user.sub) {
    throw new AppError(403, errCode.forbidden, '접근 권한이 없습니다.')
  }

  await prisma.task.update({ where: { id }, data: { deletedAt: new Date() } })
  return c.json(successResponse({ ok: true }))
})

router.post('/:id/restore', async (c) => {
  const user = c.get('user') as AuthUser
  const id = c.req.param('id')
  const target = await prisma.task.findUnique({ where: { id } })

  if (!target || !target.deletedAt) {
    throw new AppError(404, errCode.notFound, '복구할 작업을 찾을 수 없습니다.')
  }

  if (user.role !== 'ADMIN' && target.ownerId !== user.sub) {
    throw new AppError(403, errCode.forbidden, '접근 권한이 없습니다.')
  }

  await prisma.task.update({ where: { id }, data: { deletedAt: null } })
  const restored = await prisma.task.findUnique({ where: { id } })
  return c.json(successResponse(restored))
})

export default router
