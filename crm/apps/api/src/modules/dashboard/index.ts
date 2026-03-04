import { Hono } from 'hono'
import { prisma } from '../../lib/db'
import { successResponse } from '../../lib/response'
import type { AuthUser } from '../../lib/middleware/auth'

const router = new Hono()

router.get('/summary', async (c) => {
  const user = c.get('user') as AuthUser
  const where = {
    deletedAt: null,
    ownerId: user.role === 'ADMIN' ? undefined : user.sub,
  }

  const weekAgo = new Date()
  weekAgo.setDate(weekAgo.getDate() - 7)

  const threeDaysAgo = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000)

  const [totalContacts, totalDeals, wonDeals, openTasks, overdueActivities, newContactsThisWeek, todayRecommendationsCount] =
    await Promise.all([
      prisma.contact.count({ where }),
      prisma.deal.count({ where }),
      prisma.deal.count({ where: { ...where, stage: 'WON' } }),
      prisma.task.count({ where: { ...where, completedAt: null } }),
      prisma.activity.count({
        where: {
          ...where,
          scheduledAt: { lt: new Date() },
        },
      }),
      prisma.contact.count({
        where: { ...where, createdAt: { gte: weekAgo } },
      }),
      prisma.contact.count({
        where: {
          ...where,
          OR: [
            { lastContactAt: null },
            { lastContactAt: { lt: threeDaysAgo } },
          ],
          leadScore: { gte: 40 },
        },
      }),
    ])

  return c.json(
    successResponse({
      totalContacts,
      totalDeals,
      wonDeals,
      openTasks,
      overdueActivities,
      newContactsThisWeek,
      todayRecommendationsCount,
    }),
  )
})

router.get('/pipeline-stats', async (c) => {
  const user = c.get('user') as AuthUser
  const rows = await prisma.deal.groupBy({
    by: ['stage'],
    _count: { _all: true },
    _sum: { amount: true },
    where: {
      deletedAt: null,
      ownerId: user.role === 'ADMIN' ? undefined : user.sub,
    },
  })

  return c.json(successResponse(rows))
})

router.get('/activities', async (c) => {
  const user = c.get('user') as AuthUser
  const limit = Math.min(Number(c.req.query('limit')) || 20, 50)
  const where = {
    deletedAt: null,
    ownerId: user.role === 'ADMIN' ? undefined : user.sub,
  }

  const rows = await prisma.activity.findMany({
    where,
    take: limit,
    orderBy: { performedAt: 'desc' },
    include: {
      contact: { select: { id: true, name: true } },
      deal: { select: { id: true, title: true } },
    },
  })

  return c.json(successResponse(rows))
})

export default router
