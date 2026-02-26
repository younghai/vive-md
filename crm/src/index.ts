import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { secureHeaders } from 'hono/secure-headers'
import { serve } from '@hono/node-server'

import { env } from './env'
import { authMiddleware } from './lib/middleware/auth'
import { requestIdMiddleware } from './lib/middleware/request-id'
import { jsonErrorHandler } from './lib/middleware/error'
import { rateLimitApi, rateLimitAuth } from './lib/middleware/rate-limit'
import { prisma } from './lib/db'
import auth from './modules/auth'
import contacts from './modules/contacts'
import deals from './modules/deals'
import activities from './modules/activities'
import tasks from './modules/tasks'
import dashboard from './modules/dashboard'
import reports from './modules/reports'
import ai from './modules/ai'
import health from './modules/health'

const app = new Hono()

app.use('*', secureHeaders())
app.use('*', requestIdMiddleware)
app.use('*', cors({
  origin: env.corsOrigins,
  allowHeaders: ['Content-Type', 'Authorization', 'x-request-id'],
  allowMethods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
  maxAge: 600,
}))

app.get('/healthz', (c) => c.json({ status: 'ok' }))
app.route('/api/v1/health', health)

app.use('/api/v1/*', rateLimitApi)
app.use('/api/v1/auth/*', rateLimitAuth)
app.route('/api/v1/auth', auth)

app.use('/api/v1/*', authMiddleware)
app.route('/api/v1/contacts', contacts)
app.route('/api/v1/deals', deals)
app.route('/api/v1/activities', activities)
app.route('/api/v1/tasks', tasks)
app.route('/api/v1/dashboard', dashboard)
app.route('/api/v1/reports', reports)
app.route('/api/v1/ai', ai)

app.notFound((c) => c.json({ error: { code: 'NOT_FOUND', message: '요청 경로가 없습니다.' } }, 404))
app.onError(jsonErrorHandler)

if (env.nodeEnv !== 'test') {
  const server = serve({
    fetch: app.fetch,
    port: env.port,
  })

  console.log(`crm api is running: http://localhost:${env.port}`)

  process.on('SIGINT', async () => {
    await prisma.$disconnect()
    server.close()
    process.exit(0)
  })
}

export default app
