import type { Context, Next } from 'hono'
import { getCookie } from 'hono/cookie'
import { AppError, errCode } from '../errors'
import { verifyAccessToken } from '../token'

export interface AuthUser {
  sub: string
  email: string
  role: 'USER' | 'ADMIN'
}

export const authMiddleware = async (c: Context, next: Next) => {
  const path = c.req.path
  const isPublicAuthPath = path === '/api/v1/auth/register' || path === '/api/v1/auth/login' || path === '/api/v1/auth/refresh'

  if (path.startsWith('/api/v1/health') || path === '/healthz' || isPublicAuthPath) {
    await next()
    return
  }

  const authHeader = c.req.header('authorization') ?? ''
  const token = authHeader.startsWith('Bearer ') ? authHeader.substring(7) : ''

  if (!token) {
    const refreshToken = getCookie(c, 'refresh_token')
    if (!refreshToken) {
      throw new AppError(401, errCode.unauthorized, '인증 토큰이 필요합니다.')
    }
  }

  try {
    const payload: AuthUser = token
      ? verifyAccessToken(token)
      : {
          sub: 'invalid',
          email: '',
          role: 'USER',
        }

    if (payload.sub === 'invalid') {
      throw new Error('invalid')
    }

    c.set('user', payload)
    await next()
  } catch {
    throw new AppError(401, errCode.unauthorized, '인증 토큰이 유효하지 않습니다.')
  }
}

export const adminOnly = async (c: Context, next: Next) => {
  const user = c.get('user') as AuthUser | undefined
  if (!user || user.role !== 'ADMIN') {
    throw new AppError(403, errCode.forbidden, '관리자 권한이 필요합니다.')
  }

  await next()
}
