# VIVE CRM Priority Roadmap

> Execution roadmap for transitioning to an SEO-enabled Next.js SaaS

| Item | Value |
|------|-------|
| **Document version** | v1.0 |
| **Created on** | 2026-03-17 |
| **Author** | Kwon Younghae / Planning and Development |
| **Status** | Ready for execution |

---

## Overview

This roadmap establishes a 6-phase priority plan to transition the current VIVE CRM into an SEO-enabled Next.js SaaS, with detailed execution items for each phase.

---

## Roadmap Overview

```
Phase 1: Structural Redesign (2 weeks)
    └── Landing/App separation, Route Group setup
            ↓
Phase 2: SEO Implementation (2 weeks)
    └── Metadata, OG, Sitemap, robots.txt
            ↓
Phase 3: Security Hardening (2 weeks)
    └── Authentication model improvement, CSRF protection
            ↓
Phase 4: Infrastructure Improvement (1 week)
    └── Redis Rate Limit, security headers
            ↓
Phase 5: SaaS Modeling (4 weeks)
    └── Workspace, multi-tenancy, subscriptions
            ↓
Phase 6: Operational Security (ongoing)
    └── Audit logs, monitoring, alerts
```

---

## Phase 1: Structural Redesign (2 weeks)

### Goal
- Convert `/` to public landing page
- Separate app area to `/app/*`
- Set up Next.js Route Group structure

### Tasks

| ID | Task | Details | Assignee | Duration | Deliverable |
|----|------|---------|----------|----------|-------------|
| P1-1 | Create Route Groups | Create `(landing)`, `(app)` groups | FE | 1 day | Directory structure |
| P1-2 | Landing page migration | Existing `/` → `/app/dashboard`, new `/` landing | FE | 2 days | Landing page |
| P1-3 | Auth middleware setup | Auth check for `/app/*` access | FE | 1 day | middleware.ts |
| P1-4 | Layout separation | Separate layouts for landing and app | FE | 1 day | layout.tsx |
| P1-5 | Navigation cleanup | Separate landing nav vs app nav | FE | 1 day | Navigation component |
| P1-6 | Redirection setup | Redirection logic based on auth state | FE | 1 day | Redirection rules |
| P1-7 | Testing | Test landing/app separation | QA | 2 days | Test results |

### Success Criteria
- [ ] Non-members see landing page at `/`
- [ ] Members are redirected to `/app/dashboard` at `/`
- [ ] Non-members accessing `/app/*` are redirected to login
- [ ] Landing and app layouts are completely separated

---

## Phase 2: SEO Implementation (2 weeks)

### Goal
- Implement metadata for search engine optimization
- Optimize for social media sharing (OG, Twitter Card)
- Support search engine crawling (robots, sitemap)

### Tasks

| ID | Task | Details | Assignee | Duration | Deliverable |
|----|------|---------|----------|----------|-------------|
| P2-1 | Root metadata | Set up basic metadata in `app/layout.tsx` | FE | 0.5 day | metadata object |
| P2-2 | Page metadata | Page-specific metadata.ts for `/features`, `/pricing`, etc. | FE | 1 day | Page metadata |
| P2-3 | robots.ts | Crawler access control | FE | 0.5 day | robots.ts |
| P2-4 | sitemap.ts | URL structure exposure | FE | 0.5 day | sitemap.ts |
| P2-5 | OG images | Dynamic generation with `opengraph-image.tsx` | FE | 1 day | OG image component |
| P2-6 | Twitter images | Dynamic generation with `twitter-image.tsx` | FE | 0.5 day | Twitter card |
| P2-7 | Schema.org | Structured data components | FE | 1 day | JSON-LD components |
| P2-8 | manifest.ts | PWA manifest setup | FE | 0.5 day | manifest.ts |
| P2-9 | Content writing | Landing page content (Features, Pricing) | Planning | 3 days | Content drafts |
| P2-10 | Search engine registration | Google Search Console, Naver registration | Marketing | 1 day | Registration complete |

### Success Criteria
- [ ] Lighthouse SEO score 90+ achieved
- [ ] OG image/title/description display correctly on social media share
- [ ] Google Search Console recognizes sitemap normally
- [ ] Unique metadata set for each page

---

## Phase 3: Security Hardening (2 weeks)

### Goal
- Improve authentication model (localStorage → Memory + HttpOnly Cookie)
- Implement CSRF protection
- Strengthen session security

### Tasks

| ID | Task | Details | Assignee | Duration | Deliverable |
|----|------|---------|----------|----------|-------------|
| P3-1 | Auth Store modification | Remove localStorage, use memory state | FE | 1 day | auth-store.ts |
| P3-2 | API client modification | withCredentials setup, cookie auto-send | FE | 1 day | api-client.ts |
| P3-3 | Backend cookie setup | Refresh Token HttpOnly + Secure + SameSite | BE | 1 day | Auth endpoints |
| P3-4 | CSRF Middleware | Sec-Fetch-Site, Origin validation | FE/BE | 1 day | middleware.ts |
| P3-5 | CSRF Token | Issue/validate CSRF Token for sensitive operations | BE | 1 day | CSRF token logic |
| P3-6 | Login lockout | Lock for 30 min after 5 failed attempts | BE | 1 day | Login logic |
| P3-7 | Session expiration | Expire after 30 min inactivity | BE | 0.5 day | Session middleware |
| P3-8 | Device limit | Max 3 concurrent sessions | BE | 1 day | Session management |
| P3-9 | Email verification | Mandatory email verification after signup | BE | 1 day | Email verification |
| P3-10 | Security testing | XSS, CSRF, session hijacking tests | QA | 1 day | Security test results |

### Success Criteria
- [ ] Access Token is not stored in localStorage (check DevTools)
- [ ] Refresh Token is only delivered via HttpOnly cookie (check Network tab)
- [ ] Cross-origin requests are blocked by CSRF protection
- [ ] Account locked for 30 min after 5 login failures
- [ ] Auto logout after 30 min inactivity

---

## Phase 4: Infrastructure Improvement (1 week)

### Goal
- Implement Redis-based Rate Limit
- Apply security headers
- Prepare for multi-instance SaaS operation

### Tasks

| ID | Task | Details | Assignee | Duration | Deliverable |
|----|------|---------|----------|----------|-------------|
| P4-1 | Redis setup | Upstash Redis connection | BE | 0.5 day | Redis client |
| P4-2 | Rate Limit implementation | Tier-based Rate Limit logic | BE | 1 day | rate-limit.ts |
| P4-3 | Rate Limit middleware | Apply to API endpoints | BE | 0.5 day | Middleware |
| P4-4 | Security headers | CSP, HSTS, X-Frame-Options, etc. | BE/Infra | 0.5 day | Security header config |
| P4-5 | CSP policy | Content-Security-Policy setup | FE | 0.5 day | CSP config |
| P4-6 | Error handling | 429 Rate Limit response handling | FE | 0.5 day | Error handler |
| P4-7 | Load testing | Rate Limit behavior test | QA | 1 day | Test results |

### Rate Limit Policy
| Tier | Requests/Min | Scope |
|------|-----------|-----------|
| Free | 100 | General API |
| Pro | 1,000 | General API |
| Enterprise | 10,000 | General API |
| Auth | 5 | Login/Signup |

---

## Phase 5: SaaS Modeling (4 weeks)

### Goal
- Introduce Workspace/Organization model
- Implement multi-tenant architecture
- Integrate subscription/payment system

### Key Tasks

| ID | Task | Duration |
|----|------|----------|
| P5-1 | DB schema design | 2 days |
| P5-2 | Data migration | 2 days |
| P5-3 | Workspace API | 2 days |
| P5-4 | Membership API | 2 days |
| P5-5 | Subscription API | 2 days |
| P5-6 | Data isolation | 2 days |
| P5-7 | Plan limit logic | 1 day |
| P5-8 | Payment integration | 3 days |
| P5-9 | Workspace UI | 3 days |
| P5-10 | Team invitation UI | 2 days |

### Data Model
```
Workspace (Tenant)
├── Subscription (subscription info)
├── Membership[] (team member relations)
├── Contacts[] (customer data)
├── Deals[] (sales opportunities)
└── AuditLogs[] (audit logs)
```

---

## Phase 6: Operational Security (Ongoing)

### Goal
- Build audit log system
- Security monitoring and alerts
- Vulnerability management

### Tasks

| ID | Task | Details | Assignee | Duration | Deliverable |
|----|------|---------|----------|----------|-------------|
| P6-1 | Audit log DB design | AuditLog table design | BE | 1 day | Schema |
| P6-2 | Audit log middleware | Logging for major events | BE | 2 days | Middleware |
| P6-3 | Log query API | Admin query API | BE | 1 day | API |
| P6-4 | Log query UI | Admin dashboard | FE | 2 days | UI |
| P6-5 | Alert setup | Security event alerts (email/Slack) | BE | 2 days | Alert logic |
| P6-6 | CSP report | Collect CSP violation reports | BE | 1 day | Report collection |
| P6-7 | Dependency scanning | npm audit automation | DevOps | 1 day | CI/CD setup |
| P6-8 | Security patch process | Vulnerability response procedure docs | Security | 1 day | Runbook |

---

## Schedule Summary

| Phase | Duration | Key Deliverable | Dependencies |
|-------|----------|-----------------|--------------|
| Phase 1: Structural Redesign | 2 weeks | Landing/App separation complete | - |
| Phase 2: SEO Implementation | 2 weeks | SEO optimization complete | Phase 1 |
| Phase 3: Security Hardening | 2 weeks | Auth/CSRF implementation complete | Phase 1 |
| Phase 4: Infrastructure Improvement | 1 week | Rate Limit, security headers | Phase 3 |
| Phase 5: SaaS Modeling | 4 weeks | Multi-tenancy implementation | Phase 3 |
| Phase 6: Operational Security | Ongoing | Audit logs, monitoring | Phase 5 |

**Total Estimated Duration:** 11 weeks (2.5 months)

---

## Resource Requirements

### Personnel
| Role | P1 | P2 | P3 | P4 | P5 | P6 |
|------|-----|-----|-----|-----|-----|-----|
| FE Developer | ●● | ●● | ●● | ● | ●● | ● |
| BE Developer | ● | ● | ●● | ●● | ●●● | ●● |
| Planner | ● | ●● | - | - | ● | - |
| QA | ● | - | ● | ● | ●● | ● |
| DevOps | - | - | - | ● | ● | ● |

---

## KPIs by Phase

| Phase | Metric | Target | Measurement |
|-------|--------|--------|-------------|
| Phase 1 | Landing/App separation error rate | 0% | Error monitoring |
| Phase 2 | Lighthouse SEO score | 90+ | Lighthouse |
| Phase 2 | Organic search traffic | +50% | Google Analytics |
| Phase 3 | Security vulnerabilities | 0 | OWASP ZAP |
| Phase 4 | Rate Limit violation rate | <1% | Log analysis |
| Phase 5 | Workspace creation rate | 30% | Event tracking |
| Phase 6 | Audit log coverage | 100% | Log verification |

---

## Approval

| Role | Name | Approval | Date |
|------|------|----------|------|
| Planning Lead | Kwon Younghae | ☐ | |
| Development Lead | Kwon Younghae | ☐ | |
| Operations Lead | Kwon Younghae | ☐ | |

---

**Last Updated:** 2026-03-17  
**Document Version:** v1.0
