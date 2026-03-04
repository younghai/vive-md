import { describe, it, expect } from 'vitest'
import { successResponse, errorResponse } from '../../src/lib/response'

describe('response helpers', () => {
  it('successResponse는 data를 감싸서 반환한다', () => {
    const payload = { id: '1' }
    expect(successResponse(payload)).toEqual({ data: payload })
  })

  it('errorResponse는 error 스키마 형태를 준수한다', () => {
    const output = errorResponse('UNAUTHORIZED', 'token missing', '/api/v1/auth/me', 'req-1', {
      reason: 'missing',
    })

    expect(output).toHaveProperty('error.code', 'UNAUTHORIZED')
    expect(output.error).toHaveProperty('requestId', 'req-1')
    expect(output.error).toHaveProperty('path', '/api/v1/auth/me')
  })
})
