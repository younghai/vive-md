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

  const [totalContacts, totalDeals, wonDeals, openTasks, overdueActivities] = await Promise.all([
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
  ])

  return c.json(
    successResponse({
      totalContacts,
      totalDeals,
      wonDeals,
      openTasks,
      overdueActivities,
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

export default router
