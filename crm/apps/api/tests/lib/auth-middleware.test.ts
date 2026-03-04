import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('../../src/env', () => ({
  env: {
    nodeEnv: 'development',
    jwtSecret: 'test-jwt-secret',
    accessExpiresIn: '1h',
  },
}))

vi.mock('../../src/lib/db', () => ({
  prisma: {
    user: {
      findUnique: vi.fn(),
    },
  },
}))

import { createAccessToken } from '../../src/lib/token'
import { prisma } from '../../src/lib/db'
import { authMiddleware } from '../../src/lib/middleware/auth'

describe('authMiddleware', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  const token = createAccessToken({
    sub: 'user-uuid-1',
    email: 'test@example.com',
    role: 'USER',
  })

  const createContext = (tokenValue: string) => ({
    req: {
      path: '/api/v1/contacts',
      header: (name: string) => (name.toLowerCase() === 'authorization' ? `Bearer ${tokenValue}` : undefined),
    },
    set: vi.fn(),
  })

  it('동일 access token으로 db 최신 role이 즉시 반영된다', async () => {
    vi.mocked(prisma.user.findUnique).mockResolvedValue({
      id: 'user-uuid-1',
      email: 'test@example.com',
      role: 'ADMIN',
    } as never)

    const c: any = createContext(token)
    await authMiddleware(c, async () => {})

    expect(prisma.user.findUnique).toHaveBeenCalledWith({
      where: { id: 'user-uuid-1' },
      select: { id: true, email: true, role: true },
    })

    expect(c.set).toHaveBeenCalledWith('user', {
      sub: 'user-uuid-1',
      email: 'test@example.com',
      role: 'ADMIN',
    })
  })

  it('DB에 유저가 없으면 401 예외가 발생한다', async () => {
    vi.mocked(prisma.user.findUnique).mockResolvedValue(null)

    const c: any = createContext(token)
    await expect(authMiddleware(c, async () => {})).rejects.toThrow()
  })
})
