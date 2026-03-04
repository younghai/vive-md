import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('../../src/lib/middleware/rate-limit', () => ({
  rateLimitApi: (_c: unknown, next: () => Promise<void>) => next(),
  rateLimitAuth: (_c: unknown, next: () => Promise<void>) => next(),
}))

vi.mock('../../src/lib/db', () => ({
  prisma: {
    contact: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
      findFirst: vi.fn(),
      count: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
    },
    leadScore: {
      create: vi.fn().mockResolvedValue({}),
      upsert: vi.fn().mockResolvedValue({}),
    },
    leadScoreHistory: {
      create: vi.fn().mockResolvedValue({}),
    },
    activity: {
      create: vi.fn().mockResolvedValue({}),
      count: vi.fn().mockResolvedValue(0),
      findMany: vi.fn().mockResolvedValue([]),
    },
    deal: {
      count: vi.fn().mockResolvedValue(0),
      findMany: vi.fn().mockResolvedValue([]),
    },
    task: {
      count: vi.fn().mockResolvedValue(0),
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
const contactId = 'contact-uuid-1'
const token = createAccessToken({ sub: userId, email: 'test@example.com', role: 'USER' })
const authHeader = { Authorization: `Bearer ${token}` }

const mockContact = {
  id: contactId,
  ownerId: userId,
  name: '김고객',
  email: 'customer@example.com',
  phone: '010-1234-5678',
  company: '테스트회사',
  jobTitle: null,
  source: null,
  tags: [],
  memo: null,
  leadScore: 20,
  leadGrade: 'D',
  lastContactAt: null,
  deletedAt: null,
  createdAt: new Date(),
  updatedAt: new Date(),
  owner: { id: userId, name: '테스트', email: 'test@example.com' },
  deals: [],
  activities: [],
}

beforeEach(() => {
  vi.clearAllMocks()
  vi.mocked(prisma.auditLog.create).mockResolvedValue({} as never)
  vi.mocked(prisma.leadScore.create).mockResolvedValue({} as never)
  vi.mocked(prisma.leadScore.upsert).mockResolvedValue({} as never)
  vi.mocked(prisma.leadScoreHistory.create).mockResolvedValue({} as never)
  vi.mocked(prisma.activity.create).mockResolvedValue({} as never)
  vi.mocked(prisma.activity.count).mockResolvedValue(0)
  vi.mocked(prisma.deal.count).mockResolvedValue(0)
  vi.mocked(prisma.task.count).mockResolvedValue(0)
})

describe('GET /api/v1/contacts', () => {
  it('인증 없이 접근하면 401', async () => {
    const res = await app.request('/api/v1/contacts')
    expect(res.status).toBe(401)
  })

  it('유효한 토큰으로 목록 조회하면 200', async () => {
    vi.mocked(prisma.contact.findMany).mockResolvedValue([mockContact] as never)
    vi.mocked(prisma.contact.count).mockResolvedValue(1)

    const res = await app.request('/api/v1/contacts', { headers: authHeader })
    expect(res.status).toBe(200)
    const json = await res.json()
    expect(Array.isArray(json.data)).toBe(true)
    expect(json.pagination).toHaveProperty('total', 1)
  })
})

describe('POST /api/v1/contacts', () => {
  it('인증 없이 접근하면 401', async () => {
    const res = await app.request('/api/v1/contacts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: '테스트' }),
    })
    expect(res.status).toBe(401)
  })

  it('name이 없으면 400', async () => {
    const res = await app.request('/api/v1/contacts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...authHeader },
      body: JSON.stringify({ email: 'only@email.com' }),
    })
    expect(res.status).toBe(400)
  })

  it('유효하지 않은 이메일이면 400', async () => {
    const res = await app.request('/api/v1/contacts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...authHeader },
      body: JSON.stringify({ name: '테스트', email: 'not-email' }),
    })
    expect(res.status).toBe(400)
  })

  it('무료 플랜 100명 한도 초과시 422', async () => {
    vi.mocked(prisma.contact.count).mockResolvedValue(100)

    const res = await app.request('/api/v1/contacts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...authHeader },
      body: JSON.stringify({ name: '신규고객', email: 'new@example.com' }),
    })
    expect(res.status).toBe(422)
  })

  it('이메일 중복이면 409', async () => {
    vi.mocked(prisma.contact.count).mockResolvedValue(5)
    vi.mocked(prisma.contact.findFirst).mockResolvedValue(mockContact as never)

    const res = await app.request('/api/v1/contacts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...authHeader },
      body: JSON.stringify({ name: '중복테스트', email: 'customer@example.com' }),
    })
    expect(res.status).toBe(409)
  })

  it('정상 등록시 201', async () => {
    vi.mocked(prisma.contact.count).mockResolvedValue(5)
    vi.mocked(prisma.contact.findFirst).mockResolvedValue(null)
    vi.mocked(prisma.contact.create).mockResolvedValue(mockContact as never)
    vi.mocked(prisma.contact.update).mockResolvedValue({ ...mockContact, leadScore: 25 } as never)
    vi.mocked(prisma.contact.findUnique).mockResolvedValue({ ...mockContact, leadScore: 25 } as never)

    const res = await app.request('/api/v1/contacts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...authHeader },
      body: JSON.stringify({ name: '김고객', email: 'new@example.com', source: 'website' }),
    })
    expect(res.status).toBe(201)
    const json = await res.json()
    expect(json.data).toHaveProperty('name', '김고객')
  })
})

describe('GET /api/v1/contacts/:id', () => {
  it('인증 없이 접근하면 401', async () => {
    const res = await app.request(`/api/v1/contacts/${contactId}`)
    expect(res.status).toBe(401)
  })

  it('존재하지 않으면 404', async () => {
    vi.mocked(prisma.contact.findUnique).mockResolvedValue(null)

    const res = await app.request(`/api/v1/contacts/${contactId}`, { headers: authHeader })
    expect(res.status).toBe(404)
  })

  it('다른 사용자의 연락처에 접근하면 403', async () => {
    vi.mocked(prisma.contact.findUnique).mockResolvedValue({
      ...mockContact,
      ownerId: 'other-user-uuid',
    } as never)

    const res = await app.request(`/api/v1/contacts/${contactId}`, { headers: authHeader })
    expect(res.status).toBe(403)
  })

  it('본인의 연락처 조회하면 200', async () => {
    vi.mocked(prisma.contact.findUnique).mockResolvedValue(mockContact as never)

    const res = await app.request(`/api/v1/contacts/${contactId}`, { headers: authHeader })
    expect(res.status).toBe(200)
    const json = await res.json()
    expect(json.data).toHaveProperty('id', contactId)
  })
})

describe('DELETE /api/v1/contacts/:id', () => {
  it('인증 없이 접근하면 401', async () => {
    const res = await app.request(`/api/v1/contacts/${contactId}`, { method: 'DELETE' })
    expect(res.status).toBe(401)
  })

  it('존재하지 않으면 404', async () => {
    vi.mocked(prisma.contact.findUnique).mockResolvedValue(null)

    const res = await app.request(`/api/v1/contacts/${contactId}`, {
      method: 'DELETE',
      headers: authHeader,
    })
    expect(res.status).toBe(404)
  })

  it('soft delete 성공시 200', async () => {
    vi.mocked(prisma.contact.findUnique).mockResolvedValue(mockContact as never)
    vi.mocked(prisma.contact.update).mockResolvedValue({ ...mockContact, deletedAt: new Date() } as never)

    const res = await app.request(`/api/v1/contacts/${contactId}`, {
      method: 'DELETE',
      headers: authHeader,
    })
    expect(res.status).toBe(200)
  })
})

describe('POST /api/v1/contacts/:id/restore', () => {
  it('인증 없이 접근하면 401', async () => {
    const res = await app.request(`/api/v1/contacts/${contactId}/restore`, {
      method: 'POST',
    })
    expect(res.status).toBe(401)
  })

  it('삭제된 데이터 복구 성공 시 200', async () => {
    vi.mocked(prisma.contact.findUnique).mockResolvedValue({ ...mockContact, deletedAt: new Date() } as never)
    vi.mocked(prisma.contact.update).mockResolvedValue({ ...mockContact, deletedAt: null } as never)
    vi.mocked(prisma.contact.findUnique).mockResolvedValueOnce({ ...mockContact, deletedAt: new Date() } as never)
    vi.mocked(prisma.contact.findUnique).mockResolvedValueOnce({ ...mockContact, deletedAt: null } as never)

    const res = await app.request(`/api/v1/contacts/${contactId}/restore`, {
      method: 'POST',
      headers: authHeader,
    })
    expect(res.status).toBe(200)
    const json = await res.json()
    expect(json.data.deletedAt).toBeNull()
  })
})
