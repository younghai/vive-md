import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('../../src/lib/middleware/rate-limit', () => ({
  rateLimitApi: (_c: unknown, next: () => Promise<void>) => next(),
  rateLimitAuth: (_c: unknown, next: () => Promise<void>) => next(),
}))

vi.mock('../../src/lib/db', () => ({
  prisma: {
    deal: {
      findUnique: vi.fn(),
      update: vi.fn(),
    },
    auditLog: {
      create: vi.fn().mockResolvedValue({}),
    },
  },
}))

import app from '../../src/index'
import { prisma } from '../../src/lib/db'
import { createAccessToken } from '../../src/lib/token'

const ownerId = 'user-uuid-1'
const adminId = 'admin-uuid-1'
const dealId = 'deal-uuid-1'
const ownerToken = createAccessToken({ sub: ownerId, email: 'user@example.com', role: 'USER' })
const adminToken = createAccessToken({ sub: adminId, email: 'admin@example.com', role: 'ADMIN' })
const ownerHeader = { Authorization: `Bearer ${ownerToken}` }
const adminHeader = { Authorization: `Bearer ${adminToken}` }

const mockDeletedDeal = {
  id: dealId,
  ownerId,
  title: '테스트 딜',
  description: null,
  amount: 1000,
  probability: 20,
  stage: 'LEAD',
  expectedCloseDate: null,
  actualCloseDate: null,
  deletedAt: new Date(),
  createdAt: new Date(),
  updatedAt: new Date(),
}

beforeEach(() => {
  vi.clearAllMocks()
  vi.mocked(prisma.auditLog.create).mockResolvedValue({} as never)
})

describe('POST /api/v1/deals/:id/restore', () => {
  it('인증 없이 접근하면 401', async () => {
    const res = await app.request(`/api/v1/deals/${dealId}/restore`, {
      method: 'POST',
    })
    expect(res.status).toBe(401)
  })

  it('삭제된 딜을 복구하면 200', async () => {
    vi.mocked(prisma.deal.findUnique)
      .mockResolvedValueOnce(mockDeletedDeal as never)
      .mockResolvedValueOnce({ ...mockDeletedDeal, deletedAt: null } as never)
    vi.mocked(prisma.deal.update).mockResolvedValue({ ...mockDeletedDeal, deletedAt: null } as never)

    const res = await app.request(`/api/v1/deals/${dealId}/restore`, {
      method: 'POST',
      headers: ownerHeader,
    })
    expect(res.status).toBe(200)
    const json = await res.json()
    expect(json.data.deletedAt).toBeNull()
  })

  it('복구 대상이 없으면 404', async () => {
    vi.mocked(prisma.deal.findUnique).mockResolvedValue(null)

    const res = await app.request(`/api/v1/deals/${dealId}/restore`, {
      method: 'POST',
      headers: ownerHeader,
    })
    expect(res.status).toBe(404)
  })

  it('소유자도 ADMIN도 아닐 때 403', async () => {
    vi.mocked(prisma.deal.findUnique).mockResolvedValue({ ...mockDeletedDeal, ownerId: 'other-owner' } as never)

    const res = await app.request(`/api/v1/deals/${dealId}/restore`, {
      method: 'POST',
      headers: ownerHeader,
    })
    expect(res.status).toBe(403)
  })

  it('ADMIN은 소유자와 상관없이 복구 가능', async () => {
    vi.mocked(prisma.deal.findUnique)
      .mockResolvedValueOnce({ ...mockDeletedDeal, ownerId: 'other-owner' } as never)
      .mockResolvedValueOnce({ ...mockDeletedDeal, ownerId: 'other-owner', deletedAt: null } as never)
    vi.mocked(prisma.deal.update).mockResolvedValue({ ...mockDeletedDeal, ownerId: 'other-owner', deletedAt: null } as never)

    const res = await app.request(`/api/v1/deals/${dealId}/restore`, {
      method: 'POST',
      headers: adminHeader,
    })
    expect(res.status).toBe(200)
  })
})
