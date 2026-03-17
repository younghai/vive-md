# Implementation Document: Immediate Reflection + Operational Business Value

## 1. Implementation Scope

- Immediate reflection: latest permission and session state, admin permission management, soft delete restore
- Operational features: expanded health endpoints

## 2. Change Items

### 2.1 Common

- `src/lib/middleware/auth.ts`
  - Query the DB using `userId` after verifying the access token
  - Set `c.set('user')` with the current DB role regardless of the token payload role
  - Establish the basis for immediate reflection of role changes

### 2.2 Admin Permission Management

- `src/modules/auth/index.ts`
  - Added `GET /admin/users`
  - Added `PATCH /admin/users/:id/role`
  - Applied `adminOnly`
  - Only administrators can view the user list and change roles

### 2.3 Soft Delete Restore

- `src/modules/contacts/index.ts`
  - `POST /:id/restore`
- `src/modules/deals/index.ts`
  - `POST /:id/restore`
- `src/modules/tasks/index.ts`
  - `POST /:id/restore`
- Only deleted data can be restored, while owner and admin control is preserved

### 2.4 Operational Health Expansion

- `src/modules/health/index.ts`
  - Added `GET /ready`: checks DB readiness and returns `503` on failure
  - Added `GET /live`
  - Added `GET /metrics`: `uptime`, memory, DB status
  - Applied a success wrapper to the root `/api/v1/health` to keep response format consistency

## 3. Impact

- No schema change
- OpenAPI documentation may still be missing some paths, so route supplementation may be required
- Compatibility with existing features: no route path conflicts

## 4. Deployment and Operations

- After code deployment, verify `/api/v1/health/ready`, `/api/v1/health/live`, and `/api/v1/health/metrics` together
- Verify immediate impact after an admin change:
  1. Call `/api/v1/auth/admin/users/:id/role`
  2. Retry a permission-checked API with the same access token
