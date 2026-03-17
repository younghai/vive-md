# Incident Response Runbook

| Item | Value |
|------|-------|
| **Version** | v1.1 |
| **Created on** | 2026-02-24 |
| **Updated on** | 2026-03-17 |
| **Author** | Kwon Younghae / Planning and Development |

> Defines the common response standard when incidents occur in the VIVE CRM production environment.

## Change History

| Version | Date | Description | Author |
|---------|------|-------------|--------|
| v1.0 | 2026-02-24 | Initial runbook | Kwon Younghae |
| v1.1 | 2026-03-17 | Added security incident scenarios (CSRF, Rate Limit, Session hijacking) | Kwon Younghae |

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

### 4.4 Rate Limit Exhaustion (429 Errors)

**Symptoms:** Large number of 429 responses, legitimate users blocked

1. Check Redis connection and rate limit analytics
2. Identify if it's a DDoS attack or misconfigured client
3. **If attack:** Enable stricter rate limits, consider IP blocking
4. **If misconfiguration:** Contact affected users, temporarily whitelist if necessary
5. Monitor Upstash Redis dashboard for connection limits

```bash
# Emergency rate limit adjustment
redis-cli> CONFIG SET maxclients 10000
```

### 4.5 CSRF Attack Detection

**Symptoms:** Cross-origin requests with invalid/missing CSRF tokens

1. Check security logs for `Sec-Fetch-Site: cross-origin` requests
2. Verify Origin/Referer headers are being validated
3. Check if CSRF token rotation is working
4. If bypass detected:
   - Immediately rotate CSRF secrets
   - Force logout all sessions
   - Enable additional validation layers

### 4.6 Session Hijacking / Token Theft

**Symptoms:** Unauthorized access from unusual locations, token abuse

1. Check audit logs for suspicious login patterns
2. Identify affected user accounts
3. Immediate actions:
   - Revoke all refresh tokens for affected users
   - Force password reset
   - Check for XSS vulnerabilities in recent deployments
4. Review access logs for data exfiltration

### 4.7 Audit Log System Failure

**Symptoms:** Audit logs not recording, disk space issues

1. Check database connection to audit log table
2. Verify audit log table size and retention
3. If disk full:
   - Archive old logs (beyond retention period)
   - Expand storage
4. **Never disable audit logging** - service should fail safe

### 4.8 Redis Connection Failure

**Symptoms:** Rate limit not working, session issues

1. Check Upstash Redis status dashboard
2. Verify connection string and credentials
3. **Failover:** Application should gracefully degrade
   - Rate limit: Allow requests (log warning)
   - Session: Use fallback session store
4. Contact Upstash support if regional outage

## 5. Recovery Verification Checklist

### 5.1 General Health
- [ ] API `ready` and `liveness` are normal
- [ ] Login and token refresh are normal
- [ ] Contacts/Deals/Tasks CRUD is normal
- [ ] Dashboard and report baseline queries are normal
- [ ] No contract violations between OpenAPI paths and actual routes

### 5.2 Security Systems
- [ ] CSRF token validation working
- [ ] Rate limiting active (test with sample requests)
- [ ] Security headers present in responses
- [ ] Audit logs recording new events
- [ ] Redis connection stable

### 5.3 Post-Security Incident
- [ ] All tokens rotated (if token theft suspected)
- [ ] Affected users notified
- [ ] Security patches applied
- [ ] Penetration test passed (if major breach)

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
