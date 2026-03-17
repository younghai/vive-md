# API Contract Operations Policy

> Operational baseline for keeping OpenAPI, route implementation, Postman, and contract verification results in sync at all times

| Item | Value |
|------|-------|
| **Document version** | v1.1 |
| **Created on** | 2026-02-24 |
| **Updated on** | 2026-03-17 |
| **Author** | Kwon Younghae / Planning and Development |

---

## Change History

| Version | Date | Author | Description |
|---------|------|--------|-------------|
| v0.1 | 2026-02-24 | Kwon Younghae | Initial draft |
| v1.1 | 2026-03-17 | Kwon Younghae | Added API security policy, authentication/CSRF specifications |

---

## 1. Purpose

- Minimize regressions and integration failures caused by mismatches between API documentation and actual implementation
- Establish contract verification as a mandatory quality gate before release
- **Clearly reflect API security policies (CSRF, Rate Limit, Authentication) in the contract**

---

## 2. Single Source of Truth for the Contract

- Single source: `crm/docs/openapi-v1.yaml`
- Derived artifacts:
  - `crm/docs/postman/crm-v1.postman_collection.json`
  - API integration document (`crm/docs/eng/API-Integration-Guide.md`)

---

## 3. Mandatory Procedure When Changes Occur

1. Change the API route (add/update/delete)
2. **Update OpenAPI securitySchemes when security policy changes**
3. Update `openapi-v1.yaml` at the same time
4. Regenerate the Postman collection
5. Run contract verification
6. Update the documentation (`API-Integration-Guide.md`, and RTM if needed)

---

## 4. API Security Contract

### 4.1 Authentication Method

```yaml
# openapi-v1.yaml
securitySchemes:
  bearerAuth:
    type: http
    scheme: bearer
    bearerFormat: JWT
    description: |
      Access Token (JWT) passed via Bearer scheme.
      Token is stored in memory only, localStorage is not used.
  cookieAuth:
    type: apiKey
    in: cookie
    name: refreshToken
    description: |
      Refresh Token passed via HttpOnly, Secure, SameSite=Strict cookie.
      Inaccessible from JavaScript.
```

### 4.2 CSRF Protection

```yaml
# openapi-v1.yaml - Sensitive endpoints
paths:
  /api/v1/contacts:
    post:
      security:
        - bearerAuth: []
      parameters:
        - name: X-CSRF-Token
          in: header
          required: true
          schema:
            type: string
          description: CSRF protection token (required for sensitive operations)
```

| Endpoint | CSRF Token Required | Reason |
|-----------|---------------------|--------|
| POST /auth/* | ❌ | Pre-authentication request |
| GET /* | ❌ | Read-only |
| POST/PUT/PATCH/DELETE /contacts | ✅ | State change |
| POST/PUT/PATCH/DELETE /deals | ✅ | State change |
| POST/PUT/PATCH/DELETE /tasks | ✅ | State change |
| POST /billing/* | ✅ | Payment related |
| POST /admin/* | ✅ | Admin functions |

### 4.3 Rate Limit Headers

```yaml
# Response header specifications
headers:
  X-RateLimit-Limit:
    description: Maximum requests per minute
    schema:
      type: integer
  X-RateLimit-Remaining:
    description: Remaining requests
    schema:
      type: integer
  X-RateLimit-Reset:
    description: Limit reset time (Unix timestamp)
    schema:
      type: integer
  Retry-After:
    description: Retry wait time in seconds (for 429 response)
    schema:
      type: integer
```

### 4.4 Security Response Codes

| Status Code | Meaning | Usage |
|-----------|------|-----------|
| 400 | Bad Request | Request parameter validation failure |
| 401 | Unauthorized | Missing/expired authentication token |
| 403 | Forbidden | Insufficient permissions or CSRF validation failure |
| 429 | Too Many Requests | Rate limit exceeded |
| 419 | Authentication Timeout | Session expired (30 min inactivity) |

---

## 5. Required Verification Commands

```bash
cd crm/apps/api
npm run build
npm test
npm run contract:audit
npm run postman:generate
```

---

## 6. PR Checklist

- [ ] The OpenAPI paths and schemas match the code
- [ ] **Security policies (CSRF, Rate Limit, Authentication) are specified in OpenAPI**
- [ ] `contract:audit` passes
- [ ] The Postman collection is up to date
- [ ] Whether a breaking change exists has been assessed and reflected in `CHANGELOG`
- [ ] Integration impact (frontend / external API consumers) is clearly described
- [ ] **Security review is completed for security changes**

---

## 7. Versioning and Change Policy

- Minor: backward-compatible endpoint or field additions
- Patch: bug fixes (response compatibility maintained)
- Major: backward-incompatible changes

Examples of breaking changes:
- Removal of a required field or field type change
- Change to a top-level key in the response structure
- Stronger authentication requirements
- **Security policy changes (CSRF mandatory, etc.)**

---

## 8. Release Approval Criteria

- Contract verification passes 100%
- Core API smoke tests pass
- **Security verification passes (CSRF, Rate Limit, Authentication)**
- At least one documentation review approval
- Release notes include changed endpoints and migration impact

---

## 9. API Security Verification Checklist

### 9.1 Authentication Verification

- [ ] Access Token is stored in memory only, not in localStorage
- [ ] Refresh Token is set as HttpOnly, Secure, SameSite=Strict cookie
- [ ] Refresh Token is not sent in JSON response
- [ ] Access Token is automatically refreshed using Refresh Token cookie
- [ ] Session expires after 30 minutes of inactivity

### 9.2 CSRF Verification

- [ ] CSRF protection is applied to state-changing requests (POST/PUT/PATCH/DELETE)
- [ ] Sec-Fetch-Site header is validated
- [ ] Origin/Referer headers are validated
- [ ] CSRF Token is required for sensitive operations
- [ ] CSRF Token is tied to session

### 9.3 Rate Limit Verification

- [ ] Redis-based Rate Limit is applied
- [ ] Rate Limit information is included in response headers
- [ ] Retry-After header is included in 429 response
- [ ] Rate Limit violations are logged in audit log

### 9.4 Security Header Verification

- [ ] Content-Security-Policy header is set
- [ ] X-Frame-Options: DENY is set
- [ ] X-Content-Type-Options: nosniff is set
- [ ] Strict-Transport-Security header is set

---

## 10. Related Documents

- `../02-System-Design/API-Design-Document.md`
- `../API-Integration-Guide.md`
- `../CHANGELOG.md`
- `../09-Operations-Runbook/Incident-Response-Runbook.md`
- `../00-Planning/Business-Policy-Document.md` (Security policies)

---

**Last Updated:** 2026-03-17  
**Document Version:** v1.1
