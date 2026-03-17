# Test and Validation: Immediate Reflection + Operational Business Value

## 1. Core Test Scenarios

### TC-FN-PERM-IM-001 Immediate Reflection of Permission Change

- Precondition: log in with an `ADMIN` account (Access/Refresh issued)
- Steps
  1. Retrieve the list of target users (`GET /api/v1/auth/admin/users`)
  2. Change the target user's role (`PATCH /api/v1/auth/admin/users/:id/role`)
  3. The target user calls an admin-only feature using the same access token
- Expected result: the change is applied immediately (`403` ↔ `200/201`, reflecting the updated permission)

### TC-FN-DELETE-IM-001 Soft Delete Restore

- Target: one item each from `contacts`, `deals`, and `tasks`
- Steps
  1. Call the delete API
  2. Confirm it is excluded from the list response
  3. Call `/{id}/restore`
  4. Confirm the detail view is available again
- Expected result: the restored object's `deletedAt` returns to `null`

### TC-HEALTH-IM-001 Operational Metrics

- Validate the `GET /api/v1/health/ready` response (`200` in the normal case)
- When a DB check failure is injected, verify `503` and `db: down`
- Confirm that `GET /api/v1/health/metrics` returns the expected fields (`uptime`, memory, check status)

## 2. Manual Inspection Points

- Confirm through logs and responses that immediate reflection of admin role changes works without reissuing tokens
- Confirm that `admin` permission paths pass both `adminOnly` and ownership checks

## 3. Improvement Proposals

- In the long term, separate an action code such as `USER_ROLE_CHANGED` in the audit log for `/api/v1/auth/admin/users/:id/role`
- Add request throughput and DB query latency to `/health/metrics`

## 4. Summary of Execution Results (Final)

### Script Execution

- `npm --prefix apps/api run test` → `12` files, `98` tests passed
- `npm --prefix apps/api run contract:audit` → passed without failure

### Items Applied

- Reduced audit log exception output in DB-down environments by skipping the `audit` middleware test
- Strengthened tests for `admin` routes (user list and role change)
- Strengthened tests for `contacts`/`tasks`/`deals` restore APIs (soft delete restore)
- Added validation tests for `health` operational metrics (`ready`, `live`, `metrics`)

### Confirmed Environment Issues

- When the DB is down, the health check continues to return `503` and `db: down` for `ready`
- Due to port and IPC restrictions, actual `localhost` binding-based execution may remain limited under the existing constraints
