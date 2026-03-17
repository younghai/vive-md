# API Design Document

## 1. API Design Principles

### 1.1 RESTful Rules

- Use resource-oriented URLs
- Prefer standard HTTP verbs and status codes
- Use consistent JSON request and response envelopes

### 1.2 Versioning Strategy

The baseline version is `v1`, exposed under `/api/v1`. Breaking changes require a new version boundary.

### 1.3 Naming Rules

- URL paths use kebab-case or stable resource names
- JSON fields use predictable application naming conventions
- Error codes are stable and machine-readable

## 2. Authentication / Authorization

### 2.1 Authentication Method

Bearer token authentication based on JWT.

### 2.2 JWT Token Structure

Tokens include user identity and are validated alongside current authorization state stored in the database.

### 2.3 Authorization

Role-based access control distinguishes public, authenticated, owner-scoped, and admin-only routes.

## 3. Common Specifications

### 3.1 Request Format

- `application/json` for general APIs
- `text/csv` for CSV import endpoints where applicable

### 3.2 Response Format

- Success responses return structured JSON with `data` and optional `meta`
- List endpoints support pagination metadata

### 3.3 Error Response Format

- Standard error envelope with code, message, and optional field-level details

### 3.4 HTTP Status Code Rules

Use `200`, `201`, `204`, `400`, `401`, `403`, `404`, `422`, `429`, and `500` consistently.

## 4. Endpoint Catalog

### 4.1 Auth APIs

- Register
- Login
- Refresh
- Profile read/update
- Admin user listing and role update where supported

### 4.2 Contact APIs

- Contact CRUD
- Search, filtering, import, restore

### 4.3 Deal APIs

- Deal CRUD
- Pipeline board
- Stage change and restore flows

### 4.4 AI APIs

- Lead score retrieval / recalculation
- Recommendation list and daily recommendation endpoints

### 4.5 Task APIs

- Task CRUD
- Completion toggle
- Restore and notification-related flows

### 4.6 Dashboard APIs

- Summary KPIs
- Pipeline stats
- Recent activities

### 4.7 Report APIs

- Weekly reports
- Monthly reports
- Activity statistics

## 5. Detailed Endpoint Specifications

### 5.1 `POST /api/v1/auth/register`

Creates a new user account with email-based authentication and validation rules.

### 5.2 `POST /api/v1/contacts`

Creates a contact, validates duplication, and may trigger AI scoring.

### 5.3 `GET /api/v1/deals/pipeline`

Returns a kanban-friendly pipeline structure with stage groupings and summary data.

### 5.4 `GET /api/v1/ai/recommendations/today`

Returns the list of priority recommendations for the current day.

## 6. Error Code Table

### 6.1 Auth / Authorization Errors

| Error Code | HTTP Status | Message | Description | Resolution |
|------------|-------------|---------|-------------|------------|
| `UNAUTHORIZED` | 401 | Authentication required | Missing or expired token | Login or refresh token |
| `FORBIDDEN` | 403 | Access denied | Insufficient permissions | Contact administrator |
| `INVALID_CREDENTIALS` | 401 | Invalid email or password | Login failure | Re-enter credentials |
| `EMAIL_ALREADY_EXISTS` | 409 | Email already registered | Duplicate registration | Prompt to login |

### 6.2 Validation Errors

| Error Code | HTTP Status | Message | Description | Resolution |
|------------|-------------|---------|-------------|------------|
| `VALIDATION_ERROR` | 400 | Invalid input value | Field validation failed | Check details |
| `MISSING_REQUIRED_FIELD` | 400 | Required field is missing | Required value not provided | Fill required fields |
| `INVALID_FORMAT` | 400 | Invalid input format | Format mismatch | Re-enter in correct format |

### 6.3 Business Logic Errors

| Error Code | HTTP Status | Message | Description | Resolution |
|------------|-------------|---------|-------------|------------|
| `CONTACT_LIMIT_EXCEEDED` | 422 | Free contact limit exceeded | Over 100 contacts | Prompt Pro upgrade |
| `RESOURCE_NOT_FOUND` | 404 | Requested resource not found | Non-existent ID | Verify ID |
| `INVALID_STAGE_TRANSITION` | 422 | Invalid stage transition | Pipeline backward attempt | Move in correct order |

### 6.4 System Errors

| Error Code | HTTP Status | Message | Description | Resolution |
|------------|-------------|---------|-------------|------------|
| `INTERNAL_SERVER_ERROR` | 500 | Internal server error | Unexpected error | Retry after a moment |
| `SERVICE_UNAVAILABLE` | 503 | Service temporarily unavailable | Maintenance/overload | Retry after a moment |
| `RATE_LIMIT_EXCEEDED` | 429 | Rate limit exceeded | Rate limit reached | Retry after a moment |

## 7. Rate Limiting Policy

### 7.1 Global Policy

| Item | Content |
|------|---------|
| Application Location | API Gateway (middleware) |
| Identification Basis | User ID (authenticated users) |
| Response Headers | `X-RateLimit-Limit`, `X-RateLimit-Remaining`, `X-RateLimit-Reset` |
| Exceeded Response | `429 Too Many Requests` |
| Algorithm | Sliding Window |

Apply a baseline request-per-minute cap, with tighter controls for AI and heavier endpoints.

### 7.2 User-Tier Limits

| Tier | General API | AI API | Import/Export |
|------|-------------|--------|---------------|
| Free | 100/min | 20/min | 10/min |
| Pro | 300/min | 60/min | 30/min |

Paid plans may later receive higher throughput allowances, but the MVP uses a consistent protective limit.

## 8. API Change Management

### 8.1 Versioning Policy

Non-breaking additions remain in `v1`. Breaking changes require explicit version separation.

### 8.2 Breaking Change Definition

Removing required fields, changing response top-level shapes, or tightening auth expectations.

### 8.3 API Change Log

Track endpoint additions and contract updates in the changelog, release notes, and Postman/OpenAPI artifacts.

## Appendix

### A. API Documentation Automation

OpenAPI remains the source of truth and is used to generate or validate downstream assets such as Postman collections.

### B. Endpoint-to-Requirement Mapping

Each endpoint must be traceable to its corresponding functional requirement and test coverage.

### C. Reference Documents

- SRS
- RTM
- API Integration Guide
- Quality policy for API contract operations
