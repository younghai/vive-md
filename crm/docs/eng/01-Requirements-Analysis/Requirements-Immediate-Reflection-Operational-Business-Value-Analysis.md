# Requirements Analysis: Immediate Reflection + Operational Business Value Features

## 1. Baseline Documents

- `docs/eng/00-Planning/Business-Policy-Document.md`
  - `AUTH-002-2` (Access/Refresh Token lifetime), `BP-AUTH-003` (roles and permissions), `CUSTOMER-003-1/3` (delete and restore), notification policy
- `docs/eng/05-Testing/Test-Cases.md`
  - `TC-FN-PERM-006` (immediate reflection after permission change)
- `docs/eng/Service-Features.md`
  - P1 proposals: refresh token rotation, soft delete restore, stronger audit logs
  - P2 proposals: `/health/ready`, `/health/live`, `/metrics`

## 2. New Requirements

### R1. Immediate Reflection Features

1. Immediate reflection of permission changes
- Expected result: after an administrator changes a permission, API access permission must change immediately without reissuing the user's token.
- Rationale: permission policy change test (`TC-FN-PERM-006`) and business policy.

2. Admin permission management API
- Only administrators can query the list of target accounts and change permissions.
- The result of the change must be applied immediately based on the current token authorization state, specifically the DB role value at request time.

3. Soft delete data restore
- `contacts`, `deals`, and `tasks` must reflect only a delete flag.
- Deleted targets are excluded from the default list and can be restored through `/{id}/restore`.

### R2. Operational Business Value Features

1. Extend the operational health chain
- `/api/v1/health/ready`: includes DB readiness.
- `/api/v1/health/live`: process liveness.
- `/api/v1/health/metrics`: operational metrics (memory, uptime, DB status).

2. Strengthen operational audit and traceability (phase 1)
- Authentication and authorization validation must use the latest DB role on every request and block policy violations immediately.

## 3. Non-Functional Requirements

- Maintain schemas compatible with existing routes.
- The authentication middleware must keep `/api/v1/auth/{register,login,refresh}` and health paths public.
- Restore APIs must enforce object ownership and administrator permissions in the same way.

## 4. Acceptance Criteria

- After an administrator changes a permission, reusing the same access token must reflect the permission change immediately.
- When the restore API is called for deleted data, the state must recover from `deletedAt != null` to a normal active state.
- `/health/ready` must return `503` when the DB is unavailable.
