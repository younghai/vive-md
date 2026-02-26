import { Hono } from 'hono'
import { z } from 'zod'
import { zValidator } from '@hono/zod-validator'
import { AppError, errCode } from '../../lib/errors'
import { successResponse } from '../../lib/response'
import { prisma } from '../../lib/db'
import type { AuthUser } from '../../lib/middleware/auth'

const router = new Hono()

const reportSchema = z.object({
  rangeDays: z.coerce.number().min(1).max(365).default(30),
  teamOnly: z.coerce.boolean().default(false),
})

router.get('/weekly', zValidator('query', reportSchema), async (c) => {
  const user = c.get('user') as AuthUser
  const query = c.req.valid('query')

  const end = new Date()
  const start = new Date(end.getTime() - query.rangeDays * 24 * 60 * 60 * 1000)

  const deals = await prisma.deal.findMany({
    where: {
      deletedAt: null,
      ownerId: query.teamOnly && user.role === 'ADMIN' ? undefined : user.sub,
      createdAt: { gte: start, lte: end },
    },
    select: { amount: true, createdAt: true },
  })

  const bucket = new Map<string, { amount: number; count: number }>()
  for (const d of deals) {
    const key = `${d.createdAt.getFullYear()}-W${Math.ceil(
      (((d.createdAt.getTime() - new Date(d.createdAt.getFullYear(), 0, 1).getTime()) / 86400000 +
        1) /
        7),
    )}`
    const current = bucket.get(key) ?? { amount: 0, count: 0 }
    current.count += 1
    current.amount += Number(d.amount)
    bucket.set(key, current)
  }

  return c.json(
    successResponse({
      from: start.toISOString(),
      to: end.toISOString(),
      unit: 'week',
      series: Array.from(bucket.entries()).map(([week, v]) => ({
        week,
        deals: v.count,
        wonAmount: v.amount,
      })),
    }),
  )
})

router.get('/monthly', zValidator('query', reportSchema), async (c) => {
  const user = c.get('user') as AuthUser
  const query = c.req.valid('query')

  const end = new Date()
  const start = new Date(end.getTime() - query.rangeDays * 24 * 60 * 60 * 1000)

  const deals = await prisma.deal.findMany({
    where: {
      deletedAt: null,
      ownerId: query.teamOnly && user.role === 'ADMIN' ? undefined : user.sub,
      createdAt: { gte: start, lte: end },
    },
    select: { amount: true, createdAt: true },
  })

  const bucket = new Map<string, { amount: number; count: number }>()
  for (const d of deals) {
    const key = `${d.createdAt.getFullYear()}-${String(d.createdAt.getMonth() + 1).padStart(2, '0')}`
    const current = bucket.get(key) ?? { amount: 0, count: 0 }
    current.count += 1
    current.amount += Number(d.amount)
    bucket.set(key, current)
  }

  return c.json(
    successResponse({
      from: start.toISOString(),
      to: end.toISOString(),
      unit: 'month',
      series: Array.from(bucket.entries()).map(([month, v]) => ({
        month,
        deals: v.count,
        wonAmount: v.amount,
      })),
    }),
  )
})

router.get('/weekly-export', async () => {
  throw new AppError(501, errCode.badRequest, '월간/주간 리포트 CSV export는 다음 버전에 구현됩니다.')
})

export default router
