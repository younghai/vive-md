import { Hono } from 'hono'
import type { Context } from 'hono'
import { setCookie, deleteCookie, getCookie } from 'hono/cookie'
import { z } from 'zod'
import { zValidator } from '@hono/zod-validator'
import bcrypt from 'bcryptjs'
import { AppError, errCode } from '../../lib/errors'
import { prisma } from '../../lib/db'
import { createAccessToken, generateRefreshToken, hashToken } from '../../lib/token'
import { successResponse } from '../../lib/response'
import { env } from '../../env'
import type { AuthUser } from '../../lib/middleware/auth'

const registerSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(8),
})

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
})

const refreshSchema = z.object({
  refreshToken: z.string().min(20).optional(),
})

async function issueSession(c: Context, userId: string, email: string, role: 'USER' | 'ADMIN') {
  const accessToken = createAccessToken({ sub: userId, email, role })
  const refreshToken = generateRefreshToken()
  const refreshTokenHash = hashToken(refreshToken)
  const expiresAt = new Date(Date.now() + env.refreshExpiresInDays * 24 * 60 * 60 * 1000)

  await prisma.refreshToken.deleteMany({ where: { userId } })
  await prisma.refreshToken.create({
    data: {
      tokenHash: refreshTokenHash,
      userId,
      expiresAt,
      userAgent: c.req.header('user-agent') || null,
    },
  })

  setCookie(c, 'refresh_token', refreshToken, {
    httpOnly: true,
    secure: env.nodeEnv === 'production',
    sameSite: 'Strict',
    path: '/api/v1/auth',
    maxAge: env.refreshExpiresInDays * 24 * 60 * 60,
  })

  return {
    accessToken,
    refreshToken,
    tokenType: 'Bearer',
    expiresIn: env.accessExpiresIn,
  }
}

const router = new Hono()

router.post('/register', zValidator('json', registerSchema), async (c) => {
  const body = c.req.valid('json')
  const exists = await prisma.user.findUnique({ where: { email: body.email } })

  if (exists) {
    throw new AppError(409, errCode.conflict, '이미 사용 중인 이메일입니다.')
  }

  const passwordHash = await bcrypt.hash(body.password, 10)
  const user = await prisma.user.create({
    data: {
      name: body.name,
      email: body.email,
      passwordHash,
    },
    select: { id: true, name: true, email: true, role: true },
  })

  const session = await issueSession(c, user.id, user.email, user.role)
  return c.json(successResponse({ user, ...session }), 201)
})

router.post('/login', zValidator('json', loginSchema), async (c) => {
  const body = c.req.valid('json')
  const user = await prisma.user.findUnique({ where: { email: body.email } })

  if (!user) {
    throw new AppError(401, errCode.unauthorized, '이메일 또는 비밀번호가 일치하지 않습니다.')
  }

  const isPasswordValid = await bcrypt.compare(body.password, user.passwordHash)
  if (!isPasswordValid) {
    throw new AppError(401, errCode.unauthorized, '이메일 또는 비밀번호가 일치하지 않습니다.')
  }

  const session = await issueSession(c, user.id, user.email, user.role)

  return c.json(
    successResponse({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
      ...session,
    }),
  )
})

router.post('/refresh', zValidator('json', refreshSchema), async (c) => {
  const body = c.req.valid('json')
  const refreshToken = body.refreshToken || getCookie(c, 'refresh_token')

  if (!refreshToken) {
    throw new AppError(401, errCode.unauthorized, '리프레시 토큰이 없습니다.')
  }

  const tokenHash = hashToken(refreshToken)
  const tokenRow = await prisma.refreshToken.findUnique({
    where: { tokenHash },
    include: { user: { select: { id: true, name: true, email: true, role: true } } },
  })

  if (!tokenRow || tokenRow.revokedAt || tokenRow.expiresAt < new Date()) {
    throw new AppError(401, errCode.unauthorized, '유효하지 않은 리프레시 토큰입니다.')
  }

  const session = await issueSession(c, tokenRow.user.id, tokenRow.user.email, tokenRow.user.role)
  return c.json(successResponse({
    user: {
      id: tokenRow.user.id,
      name: tokenRow.user.name,
      email: tokenRow.user.email,
      role: tokenRow.user.role,
    },
    ...session,
  }))
})

router.post('/logout', async (c) => {
  const refreshToken = getCookie(c, 'refresh_token')
  if (refreshToken) {
    const tokenHash = hashToken(refreshToken)
    await prisma.refreshToken.updateMany({
      where: { tokenHash },
      data: { revokedAt: new Date() },
    })
  }

  deleteCookie(c, 'refresh_token', { path: '/api/v1/auth' })
  return c.json(successResponse({ ok: true }))
})

router.get('/me', async (c) => {
  const user = c.get('user') as AuthUser | undefined

  if (!user) {
    throw new AppError(401, errCode.unauthorized, '인증 토큰이 유효하지 않습니다.')
  }

  const data = await prisma.user.findUnique({
    where: { id: user.sub },
    select: { id: true, name: true, email: true, role: true, createdAt: true },
  })

  if (!data) {
    throw new AppError(401, errCode.unauthorized, '인증된 사용자를 찾지 못했습니다.')
  }

  return c.json(successResponse({ user: data }))
})

export default router
