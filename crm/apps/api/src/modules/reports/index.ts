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

  const dealWhere = {
    deletedAt: null,
    ownerId: query.teamOnly && user.role === 'ADMIN' ? undefined : user.sub,
    createdAt: { gte: start, lte: end },
  }

  const [deals, stageHistories, contactsForGrade] = await Promise.all([
    prisma.deal.findMany({
      where: dealWhere,
      select: { amount: true, stage: true, createdAt: true },
    }),
    prisma.dealStageHistory.findMany({
      where: {
        ...(query.teamOnly && user.role === 'ADMIN' ? {} : { userId: user.sub }),
        createdAt: { gte: start, lte: end },
      },
      select: { fromStage: true, toStage: true },
    }),
    prisma.contact.findMany({
      where: {
        deletedAt: null,
        ownerId: query.teamOnly && user.role === 'ADMIN' ? undefined : user.sub,
      },
      select: { leadGrade: true },
    }),
  ])

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

  const wonCount = deals.filter((d) => d.stage === 'WON').length
  const lostCount = deals.filter((d) => d.stage === 'LOST').length
  const successRate = wonCount + lostCount > 0 ? (wonCount / (wonCount + lostCount)) * 100 : 0

  const leadScoreDist = { A: 0, B: 0, C: 0, D: 0 }
  for (const ct of contactsForGrade) {
    const g = ct.leadGrade?.toUpperCase()
    if (g && g in leadScoreDist) (leadScoreDist as Record<string, number>)[g] += 1
  }

  const pipelineStageChanges = stageHistories.reduce(
    (acc, h) => {
      const k = `${h.fromStage}->${h.toStage}`
      acc[k] = (acc[k] || 0) + 1
      return acc
    },
    {} as Record<string, number>,
  )

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
      successRate: Math.round(successRate * 100) / 100,
      pipelineStageChanges,
      leadScoreDistribution: leadScoreDist,
    }),
  )
})

router.get('/monthly', zValidator('query', reportSchema), async (c) => {
  const user = c.get('user') as AuthUser
  const query = c.req.valid('query')

  const end = new Date()
  const start = new Date(end.getTime() - query.rangeDays * 24 * 60 * 60 * 1000)

  const dealWhere = {
    deletedAt: null,
    ownerId: query.teamOnly && user.role === 'ADMIN' ? undefined : user.sub,
    createdAt: { gte: start, lte: end },
  }

  const [deals, stageHistories, contactsForGrade] = await Promise.all([
    prisma.deal.findMany({
      where: dealWhere,
      select: { amount: true, stage: true, createdAt: true },
    }),
    prisma.dealStageHistory.findMany({
      where: {
        ...(query.teamOnly && user.role === 'ADMIN' ? {} : { userId: user.sub }),
        createdAt: { gte: start, lte: end },
      },
      select: { fromStage: true, toStage: true },
    }),
    prisma.contact.findMany({
      where: {
        deletedAt: null,
        ownerId: query.teamOnly && user.role === 'ADMIN' ? undefined : user.sub,
      },
      select: { leadGrade: true },
    }),
  ])

  const bucket = new Map<string, { amount: number; count: number }>()
  for (const d of deals) {
    const key = `${d.createdAt.getFullYear()}-${String(d.createdAt.getMonth() + 1).padStart(2, '0')}`
    const current = bucket.get(key) ?? { amount: 0, count: 0 }
    current.count += 1
    current.amount += Number(d.amount)
    bucket.set(key, current)
  }

  const wonCount = deals.filter((d) => d.stage === 'WON').length
  const lostCount = deals.filter((d) => d.stage === 'LOST').length
  const successRate = wonCount + lostCount > 0 ? (wonCount / (wonCount + lostCount)) * 100 : 0

  const leadScoreDist = { A: 0, B: 0, C: 0, D: 0 }
  for (const ct of contactsForGrade) {
    const g = ct.leadGrade?.toUpperCase()
    if (g && g in leadScoreDist) (leadScoreDist as Record<string, number>)[g] += 1
  }

  const pipelineStageChanges = stageHistories.reduce(
    (acc, h) => {
      const k = `${h.fromStage}->${h.toStage}`
      acc[k] = (acc[k] || 0) + 1
      return acc
    },
    {} as Record<string, number>,
  )

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
      successRate: Math.round(successRate * 100) / 100,
      pipelineStageChanges,
      leadScoreDistribution: leadScoreDist,
    }),
  )
})

router.get('/activities', zValidator('query', reportSchema), async (c) => {
  const user = c.get('user') as AuthUser
  const query = c.req.valid('query')

  const end = new Date()
  const start = new Date(end.getTime() - query.rangeDays * 24 * 60 * 60 * 1000)

  const where = {
    deletedAt: null,
    ownerId: query.teamOnly && user.role === 'ADMIN' ? undefined : user.sub,
    createdAt: { gte: start, lte: end },
  }

  const [byType, totalCount] = await Promise.all([
    prisma.activity.groupBy({
      by: ['type'],
      _count: { _all: true },
      where,
    }),
    prisma.activity.count({ where }),
  ])

  const activitySummary = byType.map((r) => ({
    type: r.type,
    count: r._count._all,
  }))

  return c.json(
    successResponse({
      from: start.toISOString(),
      to: end.toISOString(),
      totalCount,
      activitySummary,
    }),
  )
})

router.get('/weekly-export', async () => {
  throw new AppError(501, errCode.badRequest, '월간/주간 리포트 CSV export는 다음 버전에 구현됩니다.')
})

export default router
