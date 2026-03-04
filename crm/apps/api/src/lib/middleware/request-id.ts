import type { Context, Next } from 'hono'
import { randomUUID } from 'node:crypto'

export const requestIdMiddleware = async (c: Context, next: Next) => {
  const requestId = c.req.header('x-request-id') || randomUUID()
  c.header('x-request-id', requestId)
  c.set('requestId', requestId)
  await next()
}
