import { Hono } from 'hono'
import { prisma } from '../../lib/db'
import { successResponse } from '../../lib/response'

const router = new Hono()
const checkDb = async () => {
  try {
    await prisma.$queryRaw`SELECT 1`
    return true
  } catch {
    return false
  }
}

router.get('/ready', async (c) => {
  const dbConnected = await checkDb()

  if (!dbConnected) {
    return c.json(
      {
        status: 'not ready',
        checks: {
          db: 'down',
        },
      },
      503,
    )
  }

  return c.json(successResponse({ status: 'ready', checks: { db: 'up' } }))
})

router.get('/live', (c) =>
  c.json(
    successResponse({
      status: 'alive',
      pid: process.pid,
      nodeVersion: process.version,
    }),
  ),
)

router.get('/metrics', async (c) => {
  const dbConnected = await checkDb()
  const mem = process.memoryUsage()
  const heapUsedMB = Math.round(mem.heapUsed / 1024 / 1024)
  const heapTotalMB = Math.round(mem.heapTotal / 1024 / 1024)
  const rssMB = Math.round(mem.rss / 1024 / 1024)

  return c.json(
    successResponse({
      service: 'crm-service',
      uptimeSec: Math.floor(process.uptime()),
      checks: {
        db: dbConnected ? 'up' : 'down',
      },
      memory: {
        heapUsedMB,
        heapTotalMB,
        rssMB,
      },
    }),
  )
})

router.get('/', (c) => c.json({ status: 'ok' }))

export default router
