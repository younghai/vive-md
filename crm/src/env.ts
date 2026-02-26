import 'dotenv/config'

export const env = {
  nodeEnv: process.env.NODE_ENV || 'development',
  port: Number(process.env.PORT || 3001),
  databaseUrl: process.env.DATABASE_URL || 'postgresql://crm:crm@localhost:5432/crm?schema=public',
  jwtSecret: process.env.JWT_SECRET || 'dev-jwt-secret',
  accessExpiresIn: process.env.JWT_ACCESS_EXPIRES_IN || '1h',
  refreshExpiresInDays: Number(process.env.JWT_REFRESH_EXPIRES_DAYS || 14),
  corsOrigins: (process.env.CORS_ORIGINS || '*').split(',').map((item) => item.trim()).filter(Boolean),
}
