# Implementation Guide

| Item | Value |
|------|-------|
| Project | VIVE CRM |
| Version | v1.1 |
| Created on | 2026-02-24 |
| Updated on | 2026-03-17 |
| Purpose | Development standards and implementation guidance, security implementation |

## 1. Overview

### 1.1 Purpose

Define the development guidelines, coding standards, environment setup, module checklists, review expectations, and debugging practices required during implementation.

### 1.2 Scope

- Development environment setup
- Coding conventions and naming rules
- Git workflow and commit rules
- Module implementation checklists
- Code review process
- Debugging and logging guidance

### 1.3 Reference Documents

- Detailed design
- API design
- Database design
- Screen design

### 1.4 Change History

| Version | Date | Description | Author |
|---------|------|-------------|--------|
| v1.0 | 2026-02-24 | Initial implementation baseline | Kwon Younghae |
| v1.1 | 2026-03-17 | Added security implementation guide, SEO/SaaS structure | Kwon Younghae |

## 2. Development Environment Setup

### 2.1 Required Tools and Versions

- `Node.js 20.x LTS`
- `pnpm 9.x`
- `TypeScript 5.x`
- `Prisma 5.x`
- `Vitest 1.x`
- `ESLint 8.x`
- `Prettier 3.x`

### 2.2 Project Initialization

Typical flow:

1. Clone the repository
2. Install dependencies
3. Copy and configure environment variables
4. Generate Prisma client and apply schema
5. Start development servers

### 2.3 Environment Variables

The local environment includes database, Redis, JWT, AI, email, and storage credentials. Real secrets must not be committed.

## 3. Coding Conventions

### 3.1 Naming Rules

Use:

- `PascalCase` for classes, components, interfaces, and type aliases
- `camelCase` for methods, functions, and variables
- `UPPER_SNAKE_CASE` for constants
- `snake_case` for DB columns

### 3.2 Code Style

- Prefer explicit typing
- Avoid `any`
- Use early returns
- Use descriptive names
- Keep functions focused and side effects explicit

### 3.3 Comment Rules

Use comments sparingly for non-obvious business logic or public API behavior. Prefer JSDoc for important functions.

### 3.4 Error Handling

Use custom exceptions, structured logging, and layered handling that preserves user-safe errors while capturing technical details in logs.

## 4. Project Structure

Organize code by domain modules such as auth, contacts, deals, activities, tasks, AI, and dashboard, supported by shared common and infrastructure layers.

## 5. Git Workflow

### 5.1 Branch Strategy

Use a lightweight GitHub Flow approach with short-lived branches and fast review cycles.

### 5.2 Commit Messages

Use Conventional Commits where possible for clarity and release hygiene.

### 5.3 Pull Request Rules

PRs should include purpose, key changes, test evidence, screenshots when applicable, and related issue references.

## Work Template

Typical PR template sections include:

- Work summary
- Checklist
- Screenshots for UI changes
- Related issues

## 6. Module Implementation Checklists

### 6.1 `AuthModule`

- Registration
- Login / refresh
- Profile update
- Role handling and guards

### 6.2 `ContactModule`

- CRUD
- Search and filter
- CSV import
- Soft delete and restore

### 6.3 `DealModule`

- CRUD
- Pipeline views
- Stage transitions
- History logging

### 6.4 `AIModule`

- Scoring
- Recommendations
- Fallback behavior

### 6.5 `DashboardModule`

- KPI aggregation
- Recent activity
- Recommendation counts

## 7. Code Review Process

### 7.1 Review Checklist

- Requirement alignment
- Correctness and regression risk
- Security and permission boundaries
- Maintainability and naming
- Test coverage

### 7.2 Review Priorities

Prioritize bugs, behavior regressions, missing validation, and document-contract mismatches.

## 8. Debugging and Logging

### 8.1 Logging Levels

Use consistent levels such as debug, info, warn, and error.

### 8.2 Log Format

Prefer structured logs with context such as request ID, module, entity ID, and error class.

### 8.3 Debugging Guide

Check environment setup, API logs, DB queries, auth state, and external dependency boundaries in that order.

## 9. Performance Optimization Guide

### 9.1 Database

Review indexes, avoid unnecessary joins, and paginate large result sets.

### 9.2 Caching

Use Redis or lightweight caching selectively for frequently requested aggregate data.

## 10. Security Guide

### 10.1 Input Validation

Validate all external input at API boundaries.

### 10.2 Authentication / Authorization

Use JWT validation, owner checks, and admin guards consistently.

### 10.3 Sensitive Data Handling

Protect secrets, credentials, tokens, and privacy-sensitive fields from logs and source control.

## 11. Security Implementation Guide

### 11.1 Authentication Implementation

#### Access Token Storage
```typescript
// ❌ DON'T: localStorage
localStorage.setItem('accessToken', token);

// ✅ DO: Memory only (React Context/Zustand)
const useAuthStore = create(() => ({ accessToken: null }));
```

#### Refresh Token Handling
```typescript
// Backend: HttpOnly Cookie
res.cookie('refreshToken', token, {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'strict',
  maxAge: 14 * 24 * 60 * 60 * 1000 // 14 days
});

// ❌ DON'T: Send in JSON response
// res.json({ refreshToken: token });
```

### 11.2 CSRF Protection Implementation

#### Middleware Setup
```typescript
// middleware.ts
export function middleware(request: NextRequest) {
  // Check Sec-Fetch-Site header
  const secFetchSite = request.headers.get('sec-fetch-site');
  if (secFetchSite !== 'same-origin') {
    return NextResponse.json({ error: 'Invalid origin' }, { status: 403 });
  }
  
  // Validate Origin/Referer
  const origin = request.headers.get('origin');
  if (origin !== process.env.NEXT_PUBLIC_APP_URL) {
    return NextResponse.json({ error: 'Invalid origin' }, { status: 403 });
  }
}
```

#### CSRF Token for Sensitive Operations
```typescript
// Generate CSRF token
const csrfToken = crypto.randomUUID();
res.cookie('csrf-token', csrfToken, { httpOnly: false, sameSite: 'strict' });

// Validate on state-changing requests
if (req.headers['x-csrf-token'] !== req.cookies['csrf-token']) {
  return res.status(403).json({ error: 'Invalid CSRF token' });
}
```

### 11.3 Rate Limit Implementation

```typescript
import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(100, '1 m'),
  analytics: true,
});

// Apply in middleware
const { success, limit, remaining, reset } = await ratelimit.limit(identifier);
if (!success) {
  return res.status(429).json({ error: 'Rate limit exceeded' });
}
```

### 11.4 Security Headers

```typescript
// next.config.js
async headers() {
  return [{
    source: '/:path*',
    headers: [
      { key: 'Content-Security-Policy', value: "default-src 'self'; script-src 'self' 'unsafe-inline'" },
      { key: 'X-Frame-Options', value: 'DENY' },
      { key: 'X-Content-Type-Options', value: 'nosniff' },
      { key: 'Strict-Transport-Security', value: 'max-age=31536000; includeSubDomains' },
      { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
    ],
  }];
}
```

## 12. SEO Implementation Guide

### 12.1 Route Group Structure
```
app/
├── (landing)/           # Public landing group
│   ├── page.tsx         # / - Landing page
│   ├── features/
│   ├── pricing/
│   └── layout.tsx       # Landing layout (no auth)
├── (app)/               # Authenticated app group
│   ├── dashboard/
│   ├── contacts/
│   └── layout.tsx       # App layout (with auth)
```

### 12.2 Metadata Implementation
```typescript
// app/layout.tsx
export const metadata: Metadata = {
  metadataBase: new URL('https://vive-crm.com'),
  title: { template: '%s | VIVE CRM', default: 'VIVE CRM' },
  description: 'AI-powered sales management platform',
  openGraph: {
    type: 'website',
    title: 'VIVE CRM',
    description: 'AI-powered sales management',
    images: ['/og-image.png'],
  },
};
```

## 13. Implementation Schedule

Implementation follows the MVP roadmap: auth and contacts first, then deals, AI, tasks, dashboard, reporting, testing, and release preparation.

## 12. References

### 12.1 Recommended Documents

- SRS
- Detailed design
- DB/API/screen design

### 12.2 Useful Tools

- Prisma Studio
- Vitest
- ESLint / Prettier
- CI contract audit tools

## Appendix A: ESLint / Prettier Settings

Use repository-standard linting and formatting configuration for consistent output.

## Approval

This guide is the implementation baseline for the MVP codebase.
