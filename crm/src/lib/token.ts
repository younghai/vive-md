import { createHash, randomUUID } from 'node:crypto'
import jwt from 'jsonwebtoken'
import type { SignOptions } from 'jsonwebtoken'
import { env } from '../env'

export type Role = 'USER' | 'ADMIN'

export interface JwtPayload {
  sub: string
  email: string
  role: Role
}

export function hashToken(value: string) {
  return createHash('sha256').update(value).digest('hex')
}

export function generateRefreshToken() {
  return randomUUID() + '.' + randomUUID()
}

export function createAccessToken(payload: JwtPayload) {
  const options: SignOptions = {
    expiresIn: env.accessExpiresIn as SignOptions['expiresIn'],
    issuer: 'crm-service',
    audience: 'crm-client',
  }

  return jwt.sign(payload, env.jwtSecret, options)
}

export function verifyAccessToken(token: string): JwtPayload {
  return jwt.verify(token, env.jwtSecret, {
    issuer: 'crm-service',
    audience: 'crm-client',
  }) as JwtPayload
}
