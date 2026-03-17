# System Design: Immediate Reflection + Operational Business Value

## 1. Design Goals

Without changing the existing API structure, add the following capabilities on top of the current authentication, authorization, and soft delete patterns:

- Immediate reflection of permission changes
- Manual restore APIs for deleted data
- Operational health checks and lightweight metrics

## 2. Architectural Impact

### 2.1 Immediate Reflection of Permissions

- Current: uses the `role` in the access token payload
- Change: keep the access token for identity verification, but on every request read the latest `role` from the DB using `userId`
- Effect: administrator role changes are reflected immediately, reducing dependence on re-login

### 2.2 Admin Permission API

- Location: `modules/auth`
- New endpoints
  - `GET /api/v1/auth/admin/users`: list users
  - `PATCH /api/v1/auth/admin/users/:id/role`: change role
- Gate: `authMiddleware` + `adminOnly`

### 2.3 Soft Delete Restore

- Target modules
  - `contacts`, `deals`, `tasks`
- Additional endpoints
  - `POST /:id/restore` (for each module)
- Delete rules
  - Restore is allowed only when `deletedAt != null`
  - Only the owner or an `ADMIN` can restore

### 2.4 Operational Health and Metrics

- Location: `modules/health`
- New routes
  - `GET /api/v1/health/ready`: DB connectivity (`503` on failure)
  - `GET /api/v1/health/live`: process liveness
  - `GET /api/v1/health/metrics`: memory, uptime, DB status

## 3. Security and Stability Considerations

- Keep the existing policy for authentication path exceptions (`register/login/refresh`) and health paths.
- Protect permission change paths first with `adminOnly`, and validate object ownership again inside individual resource handlers.
- `/health/ready` should return `503` so that operational monitoring can detect and propagate outages quickly.

## 4. Data Impact

- No schema change (to minimize operational burden)
- Compatible with the existing soft delete policy, and resets `deletedAt` to `null` on restore
