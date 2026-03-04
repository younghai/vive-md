import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('../../src/lib/middleware/rate-limit', () => ({
  rateLimitApi: (_c: unknown, next: () => Promise<void>) => next(),
  rateLimitAuth: (_c: unknown, next: () => Promise<void>) => next(),
}))

vi.mock('../../src/lib/db', () => ({
  prisma: {
    notification: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
      count: vi.fn(),
      update: vi.fn(),
      updateMany: vi.fn(),
    },
    auditLog: {
      create: vi.fn().mockResolvedValue({}),
    },
  },
}))

import app from '../../src/index'
import { prisma } from '../../src/lib/db'
import { createAccessToken } from '../../src/lib/token'

const userId = 'user-uuid-1'
const notifId = 'notif-uuid-1'
const token = createAccessToken({ sub: userId, email: 'test@example.com', role: 'USER' })
const authHeader = { Authorization: `Bearer ${token}` }

const mockNotif = {
  id: notifId,
  userId,
  type: 'task_due',
  title: '작업 마감: 콜드콜 하기',
  body: '마감일: 2026. 3. 1.',
  readAt: null,
  createdAt: new Date(),
}

beforeEach(() => {
  vi.clearAllMocks()
  vi.mocked(prisma.auditLog.create).mockResolvedValue({} as never)
})

describe('GET /api/v1/notifications', () => {
  it('인증 없이 접근하면 401', async () => {
    const res = await app.request('/api/v1/notifications')
    expect(res.status).toBe(401)
  })

  it('목록 조회 성공하면 200', async () => {
    vi.mocked(prisma.notification.findMany).mockResolvedValue([mockNotif] as never)
    vi.mocked(prisma.notification.count).mockResolvedValue(1)

    const res = await app.request('/api/v1/notifications', { headers: authHeader })
    expect(res.status).toBe(200)
    const json = await res.json()
    expect(Array.isArray(json.data)).toBe(true)
    expect(json.data[0]).toHaveProperty('type', 'task_due')
  })

  it('unreadOnly=true 쿼리 파라미터 적용해도 200', async () => {
    vi.mocked(prisma.notification.findMany).mockResolvedValue([mockNotif] as never)
    vi.mocked(prisma.notification.count).mockResolvedValue(1)

    const res = await app.request('/api/v1/notifications?unreadOnly=true', { headers: authHeader })
    expect(res.status).toBe(200)
  })
})

describe('PATCH /api/v1/notifications/:id/read', () => {
  it('인증 없이 접근하면 401', async () => {
    const res = await app.request(`/api/v1/notifications/${notifId}/read`, { method: 'PATCH' })
    expect(res.status).toBe(401)
  })

  it('존재하지 않는 알림이면 404', async () => {
    vi.mocked(prisma.notification.findUnique).mockResolvedValue(null)

    const res = await app.request(`/api/v1/notifications/${notifId}/read`, {
      method: 'PATCH',
      headers: authHeader,
    })
    expect(res.status).toBe(404)
  })

  it('읽음 처리 성공시 200', async () => {
    vi.mocked(prisma.notification.findUnique).mockResolvedValue(mockNotif as never)
    vi.mocked(prisma.notification.update).mockResolvedValue({ ...mockNotif, readAt: new Date() } as never)

    const res = await app.request(`/api/v1/notifications/${notifId}/read`, {
      method: 'PATCH',
      headers: authHeader,
    })
    expect(res.status).toBe(200)
    const json = await res.json()
    expect(json.data).toHaveProperty('readAt')
  })
})

describe('PATCH /api/v1/notifications/read-all', () => {
  it('인증 없이 접근하면 401', async () => {
    const res = await app.request('/api/v1/notifications/read-all', { method: 'PATCH' })
    expect(res.status).toBe(401)
  })

  it('전체 읽음 처리 성공시 200', async () => {
    vi.mocked(prisma.notification.updateMany).mockResolvedValue({ count: 3 })

    const res = await app.request('/api/v1/notifications/read-all', {
      method: 'PATCH',
      headers: authHeader,
    })
    expect(res.status).toBe(200)
    const json = await res.json()
    expect(json.data).toHaveProperty('ok', true)
  })
})
