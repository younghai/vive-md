# CRM Service Feature Summary (Implementation Baseline)

## Overview

This document summarizes the main features currently provided by the `crm-service` codebase.  
Even if the wording differs from planning documents or other document baselines, actual operational behavior must be judged based on the implemented API.

**Current version:** v0.1.4 (2026-02-26)

## 1. Core Service Scope

- Backend API version: `v1`
- Framework: Hono + TypeScript + Prisma + PostgreSQL
- Authentication method: JWT
- Base route: `/api/v1/*`
- Public health checks: `/healthz`, `/api/v1/health`
- Service root and documentation exposure: `/`, `/api/v1`, `/docs`, `/docs/openapi.yaml`

## 2. Authentication and Account

### Features
- Sign-up (`email`, `password`, `name`, `company`)
- Login (token issuance)
- Profile update (`PATCH /auth/me`)
- Protected route access control through token-based authentication middleware

### Behavior
- Endpoints requiring `Authorization`-based authentication are separated
- Authentication routes (`GET /`, `POST /api/v1/auth/register`, `POST /api/v1/auth/login`) are public
- Resource access restrictions based on user identity (ownership verification) are applied
- Password policy: at least one alphabetic character, one number, and one special character (v0.1.3+)

## 3. Contact Management

- Create, read, update, and delete contacts (soft delete)
- Single contact and contact list retrieval (pagination, search, filtering)
- Extended attributes: `source`, `tags`, `memo`, `jobTitle`, `lastContactAt`
- Bulk CSV registration (`POST /contacts/import`)
- Duplicate email and phone number checks
- 100-contact limit (free plan)
- Restore API (`POST /contacts/:id/restore`)

## 4. Deal Management

- Create, read, update, and delete deals
- Structure based on pipeline and stage management (`LEAD → QUALIFIED → PROPOSAL → NEGOTIATION → WON/LOST`)
- Sales opportunity tracking linked to `Contact`
- Management of core sales data such as amount, probability, and expected close date
- Kanban board API (`GET /deals/pipeline`)
- Automatic history logging on stage movement (`DealStageHistory`)
- Restore API (`POST /deals/:id/restore`)

## 5. Activity Management

- Create, read, update, and delete activities
- History tracking in the context of a specific contact or deal
- Activity data recorded by memo and type (`NOTE`, `CALL`, `EMAIL`, `MEETING`)
- Automatic update of `lastContactAt` when an activity is registered
- Automatic logging of a "registered" activity when a contact is created

## 6. Task Management

- Create, read, update, and delete tasks
- Mark task completion (completion state toggle)
- Task assignment and tracking linked to contacts and deals
- Priority (`high`, `medium`, `low`) and due date management
- Automatic due date-based notification generation
- Restore API (`POST /tasks/:id/restore`)

## 7. Dashboard and Metrics

- `/api/v1/dashboard/summary`
  - `totalContacts`, `totalDeals`, `wonDeals`, `openTasks`
  - `newContactsThisWeek`, `todayRecommendationsCount`
- `/api/v1/dashboard/pipeline-stats`
- `/api/v1/dashboard/activities` (recent activities)
- Report-style aggregation through weekly and monthly query APIs (report module)

## 8. AI Features

- Lead score retrieval API (`GET /ai/lead-score/:contactId`)
- Lead score recalculation (`POST /ai/rescore/:contactId`)
- Recommended action and next-step suggestion APIs
  - `GET /ai/recommendations`
  - `GET /ai/recommendations/today`
  - `GET /ai/recommendations/:contactId`
- Additional analytics APIs based on existing data
- Automatic A/B/C/D grading (`A >= 80`, `B 60-79`, `C 40-59`, `D < 40`)

## 9. Notifications

- In-app notification system
- Automatic task due date notification creation
- Notification list retrieval (read/unread filter)
- Bulk mark-as-read

## 10. Reports

- Weekly and monthly reports (`GET /reports/weekly`, `/reports/monthly`)
- Activity statistics (`GET /reports/activities`)
- Success rate, pipeline changes, and lead score distribution
- CSV export (`501` - intentionally not implemented)

## 11. Operations, Documentation, and Quality Features

- OpenAPI v1 documentation provided
  - `docs/openapi-v1.yaml`
  - exposed at `/docs/openapi.yaml`
  - `/docs` (ReDoc) provided
- Postman generation script
  - `npm run postman:generate`
  - uses `docs/postman/*.json`
- Contract verification
  - `npm run contract:audit`
- Common middleware
  - standardized error responses
  - operational features such as request IDs, audit logs, and rate limiting

## 12. Deployment and Runtime

- Environment variable-based execution
- Separate templates for local and production environments
  - for `.env.local`: `.env.local.example`
  - for `.env.production`: `.env.production.example`
- `localhost` execution guide aligned without Docker

## 13. Quality Assurance Points

- Service startup verified based on health check API response (`200`)
- Consistency check between OpenAPI paths and actual routes
- 83 unit and integration tests (100% pass)
  - auth: 13
  - contacts: 15
  - tasks: 18
  - notifications: 8
  - `lib/leadScore`: 17
  - etc: 12

## 14. Summary of Implemented Features (as of v0.1.4)

### P1 (Core Priority) - Fully Implemented

| Feature | Status | Notes |
|---------|--------|-------|
| Role-based access control (RBAC) | ✅ | USER/ADMIN role separation, admin APIs |
| Refresh token and token rotation | ✅ | Fully implemented |
| Soft delete and restore APIs | ✅ | Supported for contacts, deals, and tasks |
| Audit logs for login failure and authorization violation | ✅ | `AuditLog` model + middleware |
| Contact schema expansion | ✅ | `source`, `tags`, `memo`, `jobTitle`, `lastContactAt` |
| `PATCH /auth/me` | ✅ | Profile update |
| `POST /contacts/import` | ✅ | Bulk CSV registration |
| `GET /deals/pipeline` | ✅ | Kanban-style response |
| Tasks CRUD | ✅ | `GET/PATCH/DELETE /tasks/:id` |
| AI recommendation APIs | ✅ | `/ai/recommendations`, `/today` |
| Lead score grading | ✅ | Automatic A/B/C/D grading |
| Password policy | ✅ | Alphabetic + numeric + special character (v0.1.3) |
| 100-contact limit | ✅ | Free plan limit (v0.1.3) |

### P2 (Next Release)

| Feature | Status | Notes |
|---------|--------|-------|
| Integrated search and filter performance improvements | ⚠️ | Basic search implemented, advanced search not implemented |
| Bulk CSV/Excel import and export | ⚠️ | Import implemented, export not implemented |
| Task and deal deadline notifications (email/webhook) | ⚠️ | In-app notifications implemented, email not implemented |
| `/api/v1/health/ready`, `/api/v1/health/live`, `/api/v1/metrics` | ❌ | Not implemented |

### P3 (Mid to Long Term)

| Feature | Status | Notes |
|---------|--------|-------|
| Automatic lead stage transition rules | ❌ | Not implemented |
| Organization-level multi-tenancy | ❌ | Not implemented |
| Collaborative notes, comments, and tag features | ❌ | Basic tags implemented, collaboration features not implemented |
| Advanced dashboard metrics | ⚠️ | Basic metrics implemented, advanced analytics not implemented |

---

**Last update:** 2026-02-26  
**Document version:** v0.1.4
