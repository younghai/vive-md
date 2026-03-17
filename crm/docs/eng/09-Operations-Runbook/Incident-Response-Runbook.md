# Incident Response Runbook

> Defines the common response standard when incidents occur in the VIVE CRM production environment.

## 1. Purpose and Scope

- Purpose: apply standard procedures consistently from incident detection through recovery and post-incident analysis
- Scope: API (`apps/api`), web (`apps/web`), DB (PostgreSQL), and documentation contracts (OpenAPI/Postman)

## 2. Incident Severity Definitions

| Severity | Criteria | Example | Response Target |
|----------|----------|---------|-----------------|
| `SEV-1` | Core functionality for the entire service is down | Login unavailable, sharp increase in API `5xx` | Start mitigation within 15 minutes |
| `SEV-2` | Partial outage in a core function | Deal save failure, report API error | Start mitigation within 30 minutes |
| `SEV-3` | Non-core issue or bypassable issue | Some UI breakage, incorrect metric display | Action plan within the business day |

## 3. Common Response Procedure

1. Detection: receive monitoring, user report, or health check alert
2. Classification: determine impact scope and severity (`SEV`)
3. Mitigation: immediate action such as traffic blocking, rollback, or disabling a feature flag
4. Recovery: verify normal operation (`health`, major API smoke test)
5. Post-incident: root cause analysis (RCA) and register recurrence prevention actions

## 4. Immediate Actions by Scenario

### 4.1 Sharp Increase in API `5xx`

1. Check `GET /healthz`, `GET /api/v1/health/ready`, and `GET /api/v1/health/metrics`
2. Check whether a recent deployment occurred, and roll back to the previous release if needed
3. If DB connection fails, inspect the DB status and connection info (`DATABASE_URL`)
4. After mitigation, run smoke tests on core endpoints

### 4.2 Authentication Incident (Abnormal Surge in `401/403`)

1. Check the change history of `JWT_SECRET` and the expiration policy (`JWT_ACCESS_EXPIRES_IN`)
2. Verify behavior of `auth` routes (`/api/v1/auth/login`, `/refresh`, `/me`)
3. If this happened right after a permission-related change, inspect the admin role change API logs

### 4.3 DB Incident or Performance Degradation

1. Check whether `/api/v1/health/ready` is returning `503`
2. Inspect DB connections, slow queries, and lock status
3. Temporary mitigation: limit high-cost report calls and restore read-heavy features first

## 5. Recovery Verification Checklist

- [ ] API `ready` and `liveness` are normal
- [ ] Login and token refresh are normal
- [ ] Contacts/Deals/Tasks CRUD is normal
- [ ] Dashboard and report baseline queries are normal
- [ ] No contract violations between OpenAPI paths and actual routes

## 6. Post-Incident Analysis (RCA) Template

| Item | Details |
|------|---------|
| Incident start/end time |  |
| Impact scope |  |
| Customer impact |  |
| Immediate action |  |
| Root cause |  |
| Recurrence prevention action |  |
| Owner / due date |  |

## 7. Related Documents

- `../06-Deployment/Operations-Guide.md`
- `../06-Deployment/Deployment-Plan.md`
- `../11-Quality/API-Contract-Operations-Policy.md`
