import { config } from 'dotenv'
import path from 'node:path'

const nodeEnv = process.env.NODE_ENV || 'development'
const envFile =
  nodeEnv === 'production'
    ? '.env.production'
    : '.env.local'

config({ path: path.resolve(process.cwd(), envFile) })
config() // fallback to .env if it exists

export const env = {
  nodeEnv,
  port: Number(process.env.PORT || 3001),
  host: process.env.HOST || '127.0.0.1',
  databaseUrl: process.env.DATABASE_URL || 'postgresql://crm:crm@localhost:5432/crm?schema=public',
  jwtSecret: process.env.JWT_SECRET || 'dev-jwt-secret',
  accessExpiresIn: process.env.JWT_ACCESS_EXPIRES_IN || '1h',
  refreshExpiresInDays: Number(process.env.JWT_REFRESH_EXPIRES_DAYS || 14),
  corsOrigins: (process.env.CORS_ORIGINS || '*').split(',').map((item) => item.trim()).filter(Boolean),
}
