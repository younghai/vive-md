import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { secureHeaders } from 'hono/secure-headers'
import { serve } from '@hono/node-server'
import { readFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

import { env } from './env'
import { authMiddleware } from './lib/middleware/auth'
import { requestIdMiddleware } from './lib/middleware/request-id'
import { jsonErrorHandler } from './lib/middleware/error'
import { rateLimitApi, rateLimitAuth } from './lib/middleware/rate-limit'
import { prisma } from './lib/db'
import { auditMiddleware } from './lib/middleware/audit'
import auth from './modules/auth'
import contacts from './modules/contacts'
import notifications from './modules/notifications'
import deals from './modules/deals'
import activities from './modules/activities'
import tasks from './modules/tasks'
import dashboard from './modules/dashboard'
import reports from './modules/reports'
import ai from './modules/ai'
import health from './modules/health'

const app = new Hono()
const openApiPath = path.resolve(fileURLToPath(new URL('../docs/openapi-v1.yaml', import.meta.url)))
const openApiYaml = readFileSync(openApiPath, 'utf8')

app.use('*', secureHeaders())
app.use('*', requestIdMiddleware)
app.use('*', cors({
  origin: env.corsOrigins,
  allowHeaders: ['Content-Type', 'Authorization', 'x-request-id'],
  allowMethods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
  maxAge: 600,
}))

app.get('/', (c) => c.html(`
<!doctype html>
<html lang="ko">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>CRM Service</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; margin: 40px; line-height: 1.6; }
    code { background: #f4f4f5; padding: 2px 6px; border-radius: 6px; }
  </style>
</head>
<body>
  <h1>CRM Service API</h1>
  <p>서버는 정상 실행 중입니다. 아래 링크로 전체 서비스를 확인할 수 있습니다.</p>
  <ul>
    <li>헬스체크: <code>/healthz</code></li>
    <li>API 헬스체크: <code>/api/v1/health</code></li>
    <li>API 인덱스(JSON): <code>/api/v1</code></li>
    <li>전체 라우트(JSON): <a href="/routes"><code>/routes</code></a></li>
    <li>OpenAPI YAML: <a href="/docs/openapi.yaml"><code>/docs/openapi.yaml</code></a></li>
    <li>API 문서 UI: <a href="/docs"><code>/docs</code></a></li>
  </ul>
</body>
</html>
`))
app.get('/api/v1', (c) => c.json({ service: 'crm-service', version: 'v1', status: 'ok' }))
app.get('/routes', (c) => c.json({
  data: (app.routes || [])
    .map((r: { method: string; path: string }) => ({ method: r.method, path: r.path }))
    .sort((a, b) => {
      if (a.path === b.path) return a.method.localeCompare(b.method)
      return a.path.localeCompare(b.path)
    }),
}))
app.get('/docs/openapi.yaml', (c) => c.body(openApiYaml, 200, {
  'Content-Type': 'application/yaml; charset=utf-8',
}))
app.get('/docs', (c) => c.html(`
<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>CRM API Docs</title>
  <style>body { margin: 0; }</style>
</head>
<body>
  <redoc spec-url="/docs/openapi.yaml"></redoc>
  <script src="https://cdn.redoc.ly/redoc/latest/bundles/redoc.standalone.js"></script>
</body>
</html>
`))

app.get('/healthz', (c) => c.json({ status: 'ok' }))
app.route('/api/v1/health', health)

app.use('/api/v1/*', rateLimitApi)
app.use('/api/v1/auth/*', rateLimitAuth)
app.use('/api/v1/*', auditMiddleware)

app.use('/api/v1/*', authMiddleware)
app.route('/api/v1/auth', auth)
app.route('/api/v1/contacts', contacts)
app.route('/api/v1/deals', deals)
app.route('/api/v1/activities', activities)
app.route('/api/v1/tasks', tasks)
app.route('/api/v1/dashboard', dashboard)
app.route('/api/v1/reports', reports)
app.route('/api/v1/ai', ai)
app.route('/api/v1/notifications', notifications)

app.notFound((c) => c.json({ error: { code: 'NOT_FOUND', message: '요청 경로가 없습니다.' } }, 404))
app.onError(jsonErrorHandler)

if (env.nodeEnv !== 'test') {
  const server = serve({
    fetch: app.fetch,
    hostname: env.host,
    port: env.port,
  })

  console.log(`crm api is running: http://${env.host}:${env.port}`)

  process.on('SIGINT', async () => {
    await prisma.$disconnect()
    server.close()
    process.exit(0)
  })
}

export default app
