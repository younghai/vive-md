import { config } from 'dotenv'
import path from 'node:path'

config({ path: path.resolve(process.cwd(), '.env') })

type Severity = 'error' | 'warn'

const errors: string[] = []
const warnings: string[] = []

function add(type: Severity, message: string) {
  if (type === 'error') {
    errors.push(message)
    return
  }
  warnings.push(message)
}

function required(name: string) {
  const value = process.env[name]
  if (!value || !value.trim()) {
    add('error', `${name} is required`)
    return undefined
  }
  return value
}

const nodeEnv = required('NODE_ENV')
const databaseUrl = required('DATABASE_URL')
const jwtSecret = required('JWT_SECRET')
const jwtAccessExpiresIn = required('JWT_ACCESS_EXPIRES_IN')
const jwtRefreshExpiresInDays = required('JWT_REFRESH_EXPIRES_DAYS')
const corsOrigins = required('CORS_ORIGINS')

if (nodeEnv && !['development', 'test', 'production'].includes(nodeEnv)) {
  add('error', `NODE_ENV must be one of development|test|production. current=${nodeEnv}`)
}

if (databaseUrl) {
  if (!/^postgres(?:ql)?:\/\//i.test(databaseUrl)) {
    add('error', `DATABASE_URL must start with postgres:// or postgresql://. current=${databaseUrl}`)
  }
  if (!databaseUrl.includes('@') || !databaseUrl.includes('?')) {
    add('warn', 'DATABASE_URL format looks unusual. Recommended format: postgresql://user:password@host:5432/dbname?schema=public')
  }
}

if (jwtSecret) {
  if (jwtSecret.length < 32) {
    add('error', 'JWT_SECRET should be at least 32 characters')
  }
  if (nodeEnv === 'production' && /change|weak|weak-secret|secret|test|default/i.test(jwtSecret)) {
    add('error', 'JWT_SECRET in production should not use default/example-like value')
  }
}

if (jwtAccessExpiresIn) {
  const valid = /^\d+(ms|s|m|h|d|w|y)?$/.test(jwtAccessExpiresIn)
  if (!valid) {
    add('error', `JWT_ACCESS_EXPIRES_IN format is invalid: ${jwtAccessExpiresIn}`)
  }
}

if (jwtRefreshExpiresInDays) {
  const parsed = Number(jwtRefreshExpiresInDays)
  if (!Number.isInteger(parsed) || parsed <= 0) {
    add('error', `JWT_REFRESH_EXPIRES_DAYS must be positive integer. current=${jwtRefreshExpiresInDays}`)
  }
}

if (corsOrigins) {
  const list = corsOrigins
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean)

  if (list.length === 0) {
    add('error', 'CORS_ORIGINS is required. example: http://localhost:3000,https://app.vive.kr')
  }

  const invalid = list.filter((origin) => !origin.startsWith('http://') && !origin.startsWith('https://') && origin !== '*')
  if (invalid.length > 0) {
    add('warn', `CORS_ORIGINS contains non-URL values: ${invalid.join(', ')}`)
  }
}

if (nodeEnv === 'production' && !process.env.JWT_SECRET) {
  // eslint-disable-next-line no-useless-escape
  add('error', 'Production requires explicit JWT_SECRET in environment')
}

if (errors.length > 0) {
  console.error('❌ Environment check failed')
  for (const msg of errors) {
    console.error(` - ${msg}`)
  }
  if (warnings.length > 0) {
    console.warn('Warnings:')
    for (const msg of warnings) {
      console.warn(` - ${msg}`)
    }
  }
  process.exit(1)
}

if (warnings.length > 0) {
  console.warn('⚠️ Environment check completed with warnings')
  for (const msg of warnings) {
    console.warn(` - ${msg}`)
  }
} else {
  console.log('✅ Environment check passed')
}
