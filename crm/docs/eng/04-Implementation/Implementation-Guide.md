# Implementation Guide

| Item | Value |
|------|-------|
| Project | VIVE CRM |
| Version | v1.0 |
| Purpose | Development standards and implementation guidance |

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

This version establishes the initial implementation baseline.

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

## 11. Implementation Schedule

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
