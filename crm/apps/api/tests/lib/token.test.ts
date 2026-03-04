import { describe, it, expect } from 'vitest'
import { createAccessToken, verifyAccessToken, hashToken, generateRefreshToken } from '../../src/lib/token'

describe('token utils', () => {
  it('토큰 생성/검증이 일관되게 동작한다', () => {
    const token = createAccessToken({ sub: 'u-1', email: 'user@example.com', role: 'USER' })
    const payload = verifyAccessToken(token)

    expect(payload.sub).toBe('u-1')
    expect(payload.email).toBe('user@example.com')
    expect(payload.role).toBe('USER')
  })

  it('refresh 토큰은 길고 안전한 형식이며 hash가 변경된다', () => {
    const token = generateRefreshToken()
    const hash = hashToken(token)

    expect(token.length).toBeGreaterThan(30)
    expect(hash).not.toBe(token)
    expect(hash.length).toBe(64)
  })
})
