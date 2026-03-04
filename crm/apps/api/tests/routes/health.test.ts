import { describe, it, expect } from 'vitest'
import app from '../../src/index'

describe('health routes', () => {
  it('GET /healthz', async () => {
    const response = await app.request('/healthz')
    const json = await response.json()

    expect(response.status).toBe(200)
    expect(json).toMatchObject({ status: 'ok' })
  })

  it('GET /api/v1/health', async () => {
    const response = await app.request('/api/v1/health')
    const json = await response.json()

    expect(response.status).toBe(200)
    expect(json).toMatchObject({ status: 'ok' })
  })

  it('GET /api/v1/auth/me는 인증 없을 때 401', async () => {
    const response = await app.request('/api/v1/auth/me')
    expect(response.status).toBe(401)
  })

  it('GET /api/v1/health/ready는 DB 상태를 확인하고 비정상 시 503', async () => {
    const response = await app.request('/api/v1/health/ready')
    const json = await response.json()
    expect(response.status).toBe(503)
    expect(json).toMatchObject({ status: 'not ready', checks: { db: 'down' } })
  })

  it('GET /api/v1/health/metrics는 운영 지표를 반환', async () => {
    const response = await app.request('/api/v1/health/metrics')
    const json = await response.json()
    expect(response.status).toBe(200)
    expect(json.data).toMatchObject({
      service: 'crm-service',
    })
    expect(json.data.checks).toMatchObject({ db: expect.stringMatching(/up|down/) })
    expect(json.data).toMatchObject({ memory: { heapUsedMB: expect.any(Number), heapTotalMB: expect.any(Number), rssMB: expect.any(Number) } })
  })
})
