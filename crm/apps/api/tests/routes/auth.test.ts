import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('../../src/lib/middleware/rate-limit', () => ({
  rateLimitApi: (_c: unknown, next: () => Promise<void>) => next(),
  rateLimitAuth: (_c: unknown, next: () => Promise<void>) => next(),
}))

vi.mock('../../src/lib/db', () => ({
  prisma: {
    user: {
      findUnique: vi.fn(),
      findMany: vi.fn(),
      count: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
    },
    refreshToken: {
      findUnique: vi.fn(),
      deleteMany: vi.fn().mockResolvedValue({ count: 0 }),
      create: vi.fn().mockResolvedValue({}),
      updateMany: vi.fn().mockResolvedValue({ count: 1 }),
    },
    auditLog: {
      create: vi.fn().mockResolvedValue({}),
    },
  },
}))

import app from '../../src/index'
import { prisma } from '../../src/lib/db'
import { createAccessToken } from '../../src/lib/token'
import bcrypt from 'bcryptjs'

const mockUser = {
  id: 'user-uuid-1',
  name: '홍길동',
  email: 'hong@example.com',
  role: 'USER' as const,
  company: null,
  passwordHash: '',
  createdAt: new Date(),
}

beforeEach(() => {
  vi.clearAllMocks()
  vi.mocked(prisma.refreshToken.deleteMany).mockResolvedValue({ count: 0 })
  vi.mocked(prisma.refreshToken.create).mockResolvedValue({} as never)
  vi.mocked(prisma.auditLog.create).mockResolvedValue({} as never)
})

describe('POST /api/v1/auth/register', () => {
  it('유효하지 않은 이메일이면 400', async () => {
    const res = await app.request('/api/v1/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: '홍길동', email: 'not-an-email', password: 'Abcd1234!' }),
    })
    expect(res.status).toBe(400)
  })

  it('비밀번호 정책 미충족시 400 (숫자/특수문자 없음)', async () => {
    const res = await app.request('/api/v1/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: '홍길동', email: 'hong@example.com', password: 'weakpassword' }),
    })
    expect(res.status).toBe(400)
  })

  it('이름이 1자 미만이면 400', async () => {
    const res = await app.request('/api/v1/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'A', email: 'hong@example.com', password: 'Abcd1234!' }),
    })
    expect(res.status).toBe(400)
  })

  it('이메일 중복이면 409', async () => {
    vi.mocked(prisma.user.findUnique).mockResolvedValue(mockUser as never)

    const res = await app.request('/api/v1/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: '홍길동', email: 'hong@example.com', password: 'Abcd1234!' }),
    })
    expect(res.status).toBe(409)
  })

  it('정상 등록시 201 + accessToken 반환', async () => {
    vi.mocked(prisma.user.findUnique).mockResolvedValue(null)
    vi.mocked(prisma.user.create).mockResolvedValue({
      ...mockUser,
      passwordHash: await bcrypt.hash('Abcd1234!', 10),
    } as never)

    const res = await app.request('/api/v1/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: '홍길동', email: 'hong@example.com', password: 'Abcd1234!' }),
    })

    expect(res.status).toBe(201)
    const json = await res.json()
    expect(json.data).toHaveProperty('accessToken')
    expect(json.data.user).toHaveProperty('email', 'hong@example.com')
  })
})

describe('POST /api/v1/auth/login', () => {
  it('빈 이메일이면 400', async () => {
    const res = await app.request('/api/v1/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: '', password: 'Abcd1234!' }),
    })
    expect(res.status).toBe(400)
  })

  it('존재하지 않는 이메일이면 401', async () => {
    vi.mocked(prisma.user.findUnique).mockResolvedValue(null)

    const res = await app.request('/api/v1/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'notfound@example.com', password: 'Abcd1234!' }),
    })
    expect(res.status).toBe(401)
  })

  it('비밀번호가 틀리면 401', async () => {
    vi.mocked(prisma.user.findUnique).mockResolvedValue({
      ...mockUser,
      passwordHash: await bcrypt.hash('RightPassword1!', 10),
    } as never)

    const res = await app.request('/api/v1/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'hong@example.com', password: 'WrongPassword1!' }),
    })
    expect(res.status).toBe(401)
  })

  it('정상 로그인시 200 + accessToken 반환', async () => {
    const passwordHash = await bcrypt.hash('Abcd1234!', 10)
    vi.mocked(prisma.user.findUnique).mockResolvedValue({ ...mockUser, passwordHash } as never)

    const res = await app.request('/api/v1/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'hong@example.com', password: 'Abcd1234!' }),
    })
    expect(res.status).toBe(200)
    const json = await res.json()
    expect(json.data).toHaveProperty('accessToken')
  })
})

describe('GET /api/v1/auth/me', () => {
  it('토큰 없이 접근하면 401', async () => {
    const res = await app.request('/api/v1/auth/me')
    expect(res.status).toBe(401)
  })

  it('유효한 토큰으로 접근하면 200', async () => {
    vi.mocked(prisma.user.findUnique).mockResolvedValue(mockUser as never)
    const token = createAccessToken({ sub: mockUser.id, email: mockUser.email, role: mockUser.role })

    const res = await app.request('/api/v1/auth/me', {
      headers: { Authorization: `Bearer ${token}` },
    })
    expect(res.status).toBe(200)
    const json = await res.json()
    expect(json.data.user).toHaveProperty('email', 'hong@example.com')
  })
})

describe('PATCH /api/v1/auth/me', () => {
  it('토큰 없이 접근하면 401', async () => {
    const res = await app.request('/api/v1/auth/me', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: '새이름' }),
    })
    expect(res.status).toBe(401)
  })

  it('유효한 토큰으로 이름 수정하면 200', async () => {
    const updatedUser = { ...mockUser, name: '새이름' }
    vi.mocked(prisma.user.update).mockResolvedValue(updatedUser as never)
    const token = createAccessToken({ sub: mockUser.id, email: mockUser.email, role: mockUser.role })

    const res = await app.request('/api/v1/auth/me', {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ name: '새이름' }),
    })
    expect(res.status).toBe(200)
    const json = await res.json()
    expect(json.data.user.name).toBe('새이름')
  })
})

describe('GET /api/v1/auth/admin/users', () => {
  const adminToken = createAccessToken({ sub: 'admin-id', email: 'admin@example.com', role: 'ADMIN' })
  const userToken = createAccessToken({ sub: mockUser.id, email: mockUser.email, role: 'USER' })

  it('ADMIN이 아니면 403', async () => {
    const userOnly = createAccessToken({ sub: mockUser.id, email: mockUser.email, role: 'USER' })
    const res = await app.request('/api/v1/auth/admin/users', {
      headers: {
        Authorization: `Bearer ${userOnly}`,
      },
    })
    expect(res.status).toBe(403)
  })

  it('ADMIN은 사용자 목록 조회 시 200', async () => {
    vi.mocked(prisma.user.findMany).mockResolvedValue([mockUser] as never)
    vi.mocked(prisma.user.count).mockResolvedValue(1)

    const res = await app.request('/api/v1/auth/admin/users', {
      headers: {
        Authorization: `Bearer ${adminToken}`,
      },
    })
    expect(res.status).toBe(200)
    const json = await res.json()
    expect(json.data).toHaveLength(1)
    expect(json.pagination).toHaveProperty('total', 1)
  })
})

describe('PATCH /api/v1/auth/admin/users/:id/role', () => {
  const adminToken = createAccessToken({ sub: 'admin-id', email: 'admin@example.com', role: 'ADMIN' })

  it('대상 사용자 역할 변경 시 200', async () => {
    vi.mocked(prisma.user.findUnique).mockResolvedValueOnce(mockUser as never)
    vi.mocked(prisma.user.findUnique).mockResolvedValueOnce({ ...mockUser, role: 'ADMIN' } as never)
    vi.mocked(prisma.user.update).mockResolvedValue({ ...mockUser, role: 'ADMIN' } as never)

    const res = await app.request(`/api/v1/auth/admin/users/${mockUser.id}/role`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({ role: 'ADMIN' }),
    })
    expect(res.status).toBe(200)
    const json = await res.json()
    expect(json.data.user.role).toBe('ADMIN')
    expect(json.data.changedBy).toBe('admin-id')
  })

  it('ADMIN 아닌 사용자는 403', async () => {
    const userToken = createAccessToken({ sub: mockUser.id, email: mockUser.email, role: 'USER' })
    const res = await app.request(`/api/v1/auth/admin/users/${mockUser.id}/role`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${userToken}`,
      },
      body: JSON.stringify({ role: 'ADMIN' }),
    })
    expect(res.status).toBe(403)
  })
})
