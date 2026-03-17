# Environment Variables and Security Configuration Summary

This document is the operational baseline that defines the environment variable structure required to run the CRM API.

## 1. File Role Summary

- `apps/api/.env.example`
  - Base template for the API runtime
  - Sample defining JWT secrets, DB URL, and allowed origins
  - **Must remain in version control**

- `apps/api/.env`
  - Real values for local development (local defaults or overrides)
  - Must be excluded from Git tracking

- `.env.local.example`
  - Shared root-level example for local use (documentation and operations reference)

- `.env.production.example`
  - Shared root-level example for production use (documentation and operations reference)

- `.env.production`, `.env.local`
  - Used only as real production or local injected values, or for temporary testing
  - For actual production secrets, separation into a platform secret manager or secret management service is recommended

## 2. Required Security Variables

- `JWT_SECRET`
  - Recommended minimum length: 32 characters
  - Used directly for JWT signing and verification, so it must be rotated immediately if exposed
- `DATABASE_URL`
  - `postgresql://user:password@host:5432/dbname?schema=public`
  - Passwords must not be stored in plaintext
- `CORS_ORIGINS`
  - Allow only frontend domains for each environment (development: `localhost`, production: real domains)

## 3. Recommended Operational Rules

1. Do not commit real value files such as `.env`, `.env.local`, `.env.production`, or `apps/api/.env` to Git.
2. Share only example files: `.env.example`, `.env.local.example`, and `.env.production.example`.
3. Inject production secrets (`JWT_SECRET`, DB password, external API keys) through:
   - Vercel/Railway Secret Manager
   - GitHub Actions Secrets
   - a secret store such as Vault
4. Required variable check before deployment:
   - `NODE_ENV`
   - `DATABASE_URL`
   - `JWT_SECRET`
   - `JWT_ACCESS_EXPIRES_IN`
   - `JWT_REFRESH_EXPIRES_DAYS`
   - `CORS_ORIGINS`

### Execution Check

```bash
cd apps/api
npm run env:check
```

## 4. Example Secret Generation

```bash
# 32-byte random key
openssl rand -base64 32

# or Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

## 5. Rules for Creating Example Files

- When adding a new environment:
  1. Copy `.env.example` to create `.env` or an app-specific environment file
  2. Override with platform environment variables if needed
  3. After injecting sensitive values, delete the `env` file immediately or move it to a separate secure location

## 6. `docker-compose` Integration

- `apps/api/docker-compose.yml` uses `apps/api/.env` by default for runtime value injection
- If necessary, runtime differences such as the DB host should be overridden through environment variables
