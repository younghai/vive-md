import { Hono } from 'hono'
import type { Context } from 'hono'
import { setCookie, deleteCookie, getCookie } from 'hono/cookie'
import { z } from 'zod'
import { zValidator } from '@hono/zod-validator'
import bcrypt from 'bcryptjs'
import { AppError, errCode } from '../../lib/errors'
import { prisma } from '../../lib/db'
import { buildPagination } from '../../lib/pagination'
import { createAccessToken, generateRefreshToken, hashToken } from '../../lib/token'
import { successResponse } from '../../lib/response'
import { env } from '../../env'
import { adminOnly, type AuthUser } from '../../lib/middleware/auth'

const PASSWORD_REGEX = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,}$/

const registerSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z
    .string()
    .min(8)
    .regex(PASSWORD_REGEX, '비밀번호는 영문, 숫자, 특수문자를 각 1자 이상 포함해야 합니다'),
  company: z.string().max(100).optional(),
})

const patchMeSchema = z.object({
  name: z.string().min(2).max(100).optional(),
  company: z.string().max(100).optional(),
})

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
})

const refreshSchema = z.object({
  refreshToken: z.string().min(20).optional(),
})

const adminUserListSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
  q: z.string().max(100).optional(),
  role: z.enum(['USER', 'ADMIN']).optional(),
})

const updateUserRoleSchema = z.object({
  role: z.enum(['USER', 'ADMIN']),
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
      company: body.company,
    },
    select: { id: true, name: true, email: true, role: true, company: true },
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
    select: { id: true, name: true, email: true, role: true, company: true, createdAt: true },
  })

  if (!data) {
    throw new AppError(401, errCode.unauthorized, '인증된 사용자를 찾지 못했습니다.')
  }

  return c.json(successResponse({ user: data }))
})

router.patch('/me', zValidator('json', patchMeSchema), async (c) => {
  const user = c.get('user') as AuthUser | undefined

  if (!user) {
    throw new AppError(401, errCode.unauthorized, '인증 토큰이 유효하지 않습니다.')
  }

  const body = c.req.valid('json')
  const updated = await prisma.user.update({
    where: { id: user.sub },
    data: {
      ...(body.name != null && { name: body.name }),
      ...(body.company !== undefined && { company: body.company || null }),
    },
    select: { id: true, name: true, email: true, role: true, company: true, createdAt: true },
  })

  return c.json(successResponse({ user: updated }))
})

router.get('/admin/users', adminOnly, zValidator('query', adminUserListSchema), async (c) => {
  const query = c.req.valid('query')
  const where: { role?: 'USER' | 'ADMIN'; OR?: Array<{ name?: { contains: string; mode: 'insensitive' }; email?: { contains: string; mode: 'insensitive' } }> } = {}

  if (query.role) {
    where.role = query.role
  }

  if (query.q) {
    where.OR = [
      { name: { contains: query.q, mode: 'insensitive' } },
      { email: { contains: query.q, mode: 'insensitive' } },
    ]
  }

  const skip = (query.page - 1) * query.pageSize
  const [rows, total] = await Promise.all([
    prisma.user.findMany({
      where,
      skip,
      take: query.pageSize,
      orderBy: { createdAt: 'desc' },
      select: { id: true, name: true, email: true, role: true, company: true, createdAt: true },
    }),
    prisma.user.count({ where }),
  ])

  return c.json(successResponse(rows, buildPagination(query.page, query.pageSize, total)))
})

router.patch('/admin/users/:id/role', adminOnly, zValidator('json', updateUserRoleSchema), async (c) => {
  const admin = c.get('user') as AuthUser | undefined
  const targetId = c.req.param('id')
  const body = c.req.valid('json')

  if (!admin) {
    throw new AppError(401, errCode.unauthorized, '인증 토큰이 유효하지 않습니다.')
  }

  const target = await prisma.user.findUnique({
    where: { id: targetId },
    select: { id: true, name: true, email: true, role: true },
  })

  if (!target) {
    throw new AppError(404, errCode.notFound, '사용자를 찾을 수 없습니다.')
  }

  const updated = await prisma.user.update({
    where: { id: targetId },
    data: { role: body.role },
    select: { id: true, name: true, email: true, role: true },
  })

  return c.json(successResponse({ user: updated, changedBy: admin.sub }))
})

export default router
