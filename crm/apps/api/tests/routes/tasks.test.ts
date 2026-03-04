import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('../../src/lib/middleware/rate-limit', () => ({
  rateLimitApi: (_c: unknown, next: () => Promise<void>) => next(),
  rateLimitAuth: (_c: unknown, next: () => Promise<void>) => next(),
}))

vi.mock('../../src/lib/db', () => ({
  prisma: {
    task: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
      count: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
    },
    notification: {
      create: vi.fn().mockResolvedValue({}),
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
const taskId = 'task-uuid-1'
const token = createAccessToken({ sub: userId, email: 'test@example.com', role: 'USER' })
const authHeader = { Authorization: `Bearer ${token}` }

const mockTask = {
  id: taskId,
  ownerId: userId,
  title: '콜드콜 하기',
  priority: 'MEDIUM',
  dueDate: null,
  note: null,
  contactId: null,
  dealId: null,
  completedAt: null,
  deletedAt: null,
  createdAt: new Date(),
  updatedAt: new Date(),
}

beforeEach(() => {
  vi.clearAllMocks()
  vi.mocked(prisma.auditLog.create).mockResolvedValue({} as never)
  vi.mocked(prisma.notification.create).mockResolvedValue({} as never)
})

describe('GET /api/v1/tasks', () => {
  it('인증 없이 접근하면 401', async () => {
    const res = await app.request('/api/v1/tasks')
    expect(res.status).toBe(401)
  })

  it('목록 조회 성공하면 200', async () => {
    vi.mocked(prisma.task.findMany).mockResolvedValue([mockTask] as never)
    vi.mocked(prisma.task.count).mockResolvedValue(1)

    const res = await app.request('/api/v1/tasks', { headers: authHeader })
    expect(res.status).toBe(200)
    const json = await res.json()
    expect(Array.isArray(json.data)).toBe(true)
  })

  it('status=open 필터 적용해도 200', async () => {
    vi.mocked(prisma.task.findMany).mockResolvedValue([])
    vi.mocked(prisma.task.count).mockResolvedValue(0)

    const res = await app.request('/api/v1/tasks?status=open', { headers: authHeader })
    expect(res.status).toBe(200)
  })
})

describe('POST /api/v1/tasks', () => {
  it('인증 없이 접근하면 401', async () => {
    const res = await app.request('/api/v1/tasks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: '테스트' }),
    })
    expect(res.status).toBe(401)
  })

  it('title이 없으면 400', async () => {
    const res = await app.request('/api/v1/tasks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...authHeader },
      body: JSON.stringify({ priority: 'HIGH' }),
    })
    expect(res.status).toBe(400)
  })

  it('정상 생성시 201 + 알림 생성 없음 (dueDate 없을 때)', async () => {
    vi.mocked(prisma.task.create).mockResolvedValue(mockTask as never)

    const res = await app.request('/api/v1/tasks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...authHeader },
      body: JSON.stringify({ title: '콜드콜 하기', priority: 'HIGH' }),
    })
    expect(res.status).toBe(201)
    expect(prisma.notification.create).not.toHaveBeenCalled()
  })

  it('dueDate 있을 때 알림 자동 생성', async () => {
    const taskWithDue = { ...mockTask, dueDate: new Date('2026-03-01') }
    vi.mocked(prisma.task.create).mockResolvedValue(taskWithDue as never)

    const res = await app.request('/api/v1/tasks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...authHeader },
      body: JSON.stringify({ title: '마감 태스크', dueDate: '2026-03-01' }),
    })
    expect(res.status).toBe(201)
    expect(prisma.notification.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ type: 'task_due' }),
      }),
    )
  })
})

describe('GET /api/v1/tasks/:id', () => {
  it('인증 없이 접근하면 401', async () => {
    const res = await app.request(`/api/v1/tasks/${taskId}`)
    expect(res.status).toBe(401)
  })

  it('존재하지 않으면 404', async () => {
    vi.mocked(prisma.task.findUnique).mockResolvedValue(null)

    const res = await app.request(`/api/v1/tasks/${taskId}`, { headers: authHeader })
    expect(res.status).toBe(404)
  })

  it('조회 성공하면 200', async () => {
    vi.mocked(prisma.task.findUnique).mockResolvedValue(mockTask as never)

    const res = await app.request(`/api/v1/tasks/${taskId}`, { headers: authHeader })
    expect(res.status).toBe(200)
    const json = await res.json()
    expect(json.data).toHaveProperty('id', taskId)
  })
})

describe('PATCH /api/v1/tasks/:id', () => {
  it('인증 없이 접근하면 401', async () => {
    const res = await app.request(`/api/v1/tasks/${taskId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: '수정된 태스크' }),
    })
    expect(res.status).toBe(401)
  })

  it('존재하지 않으면 404', async () => {
    vi.mocked(prisma.task.findUnique).mockResolvedValue(null)

    const res = await app.request(`/api/v1/tasks/${taskId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', ...authHeader },
      body: JSON.stringify({ title: '수정된 태스크' }),
    })
    expect(res.status).toBe(404)
  })

  it('수정 성공하면 200', async () => {
    vi.mocked(prisma.task.findUnique).mockResolvedValue(mockTask as never)
    vi.mocked(prisma.task.update).mockResolvedValue({ ...mockTask, title: '수정된 태스크' } as never)

    const res = await app.request(`/api/v1/tasks/${taskId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', ...authHeader },
      body: JSON.stringify({ title: '수정된 태스크' }),
    })
    expect(res.status).toBe(200)
  })
})

describe('DELETE /api/v1/tasks/:id', () => {
  it('인증 없이 접근하면 401', async () => {
    const res = await app.request(`/api/v1/tasks/${taskId}`, { method: 'DELETE' })
    expect(res.status).toBe(401)
  })

  it('존재하지 않으면 404', async () => {
    vi.mocked(prisma.task.findUnique).mockResolvedValue(null)

    const res = await app.request(`/api/v1/tasks/${taskId}`, {
      method: 'DELETE',
      headers: authHeader,
    })
    expect(res.status).toBe(404)
  })

  it('soft delete 성공시 200', async () => {
    vi.mocked(prisma.task.findUnique).mockResolvedValue(mockTask as never)
    vi.mocked(prisma.task.update).mockResolvedValue({ ...mockTask, deletedAt: new Date() } as never)

    const res = await app.request(`/api/v1/tasks/${taskId}`, {
      method: 'DELETE',
      headers: authHeader,
    })
    expect(res.status).toBe(200)
  })
})

describe('PATCH /api/v1/tasks/:id/complete', () => {
  it('인증 없이 접근하면 401', async () => {
    const res = await app.request(`/api/v1/tasks/${taskId}/complete`, { method: 'PATCH' })
    expect(res.status).toBe(401)
  })

  it('완료 처리 성공시 200', async () => {
    vi.mocked(prisma.task.findUnique).mockResolvedValue(mockTask as never)
    vi.mocked(prisma.task.update).mockResolvedValue({ ...mockTask, completedAt: new Date() } as never)

    const res = await app.request(`/api/v1/tasks/${taskId}/complete`, {
      method: 'PATCH',
      headers: authHeader,
    })
    expect(res.status).toBe(200)
  })
})

describe('POST /api/v1/tasks/:id/restore', () => {
  it('인증 없이 접근하면 401', async () => {
    const res = await app.request(`/api/v1/tasks/${taskId}/restore`, { method: 'POST' })
    expect(res.status).toBe(401)
  })

  it('삭제된 작업 복구 성공시 200', async () => {
    vi.mocked(prisma.task.findUnique).mockResolvedValueOnce({ ...mockTask, deletedAt: new Date() } as never)
    vi.mocked(prisma.task.findUnique).mockResolvedValueOnce({ ...mockTask, deletedAt: null } as never)
    vi.mocked(prisma.task.update).mockResolvedValue({ ...mockTask, deletedAt: null } as never)

    const res = await app.request(`/api/v1/tasks/${taskId}/restore`, {
      method: 'POST',
      headers: authHeader,
    })
    expect(res.status).toBe(200)
    const json = await res.json()
    expect(json.data.deletedAt).toBeNull()
  })
})
