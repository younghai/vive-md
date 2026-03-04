import type { Context, Next } from 'hono'
import { prisma } from '../db'
import { auditLog } from '../audit'
import { env } from '../../env'

export const auditMiddleware = async (c: Context, next: Next) => {
  const path = c.req.path
  const method = c.req.method
  if (env.nodeEnv === 'test') {
    await next()
    return
  }

  try {
    await next()
  } finally {
    if (path.startsWith('/api/v1/health') || path === '/healthz') return

    const status = c.res?.status ?? 500
    let userId: string | null = null
    try {
      userId = (c.get('user') as { sub?: string } | undefined)?.sub ?? null
    } catch {
      // user not set
    }
    const userAgent = c.req.header('user-agent') ?? null
    const ip = c.req.header('x-forwarded-for')?.split(',')[0]?.trim() ?? c.req.header('x-real-ip') ?? null

    auditLog(prisma, {
      userId,
      action: `${method} ${path}`,
      resource: 'api_request',
      resourceId: null,
      payload: { method, path, status },
      ip,
      userAgent,
    }).catch((e) => console.error('[Audit]', e))
  }
}
