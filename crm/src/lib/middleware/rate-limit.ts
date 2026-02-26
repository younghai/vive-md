import type { Context, Next } from 'hono'

interface Bucket {
  count: number
  resetAt: number
}

const store = new Map<string, Bucket>()

export const createRateLimit = (points = 100, windowMs = 60_000) => {
  return async (c: Context, next: Next) => {
    const key = c.req.header('x-forwarded-for') || c.req.header('x-real-ip') || 'anonymous'
    const now = Date.now()
    const bucket = store.get(key)

    if (!bucket || now > bucket.resetAt) {
      store.set(key, { count: 1, resetAt: now + windowMs })
      await next()
      return
    }

    if (bucket.count >= points) {
      c.header('Retry-After', String(Math.ceil((bucket.resetAt - now) / 1000)))
      c.status(429)
      return c.json({ error: { code: 'RATE_LIMIT', message: '요청 한도를 초과했습니다.' } })
    }

    bucket.count += 1
    store.set(key, bucket)
    c.header('X-RateLimit-Limit', String(points))
    c.header('X-RateLimit-Remaining', String(Math.max(0, points - bucket.count)))
    await next()
  }
}

export const rateLimitApi = createRateLimit(120, 60_000)
export const rateLimitAuth = createRateLimit(20, 60_000)
