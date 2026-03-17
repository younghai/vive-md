# Operations Guide

## Document Information

| Item | Value |
|------|-------|
| **Version** | v1.1 |
| **Created on** | 2026-02-24 |
| **Updated on** | 2026-03-17 |
| **Author** | Kwon Younghae / Planning and Development |

This guide defines the operational baseline for running, monitoring, securing, backing up, and recovering the VIVE CRM service.

## Change History

| Version | Date | Description | Author |
|---------|------|-------------|--------|
| v1.0 | 2026-02-24 | Initial operations guide | Kwon Younghae |
| v1.1 | 2026-03-17 | Added security operations, Redis Rate Limit, audit log monitoring | Kwon Younghae |

## 1. Overview

### 1.1 Purpose

Provide operators and developers with a shared standard for day-to-day service operations.

### 1.2 Target Readers

- Developers on operational duty
- Product or project owners
- Future maintainers or support staff

### 1.3 Operating Environment

Managed cloud services, responsive web frontend, backend APIs, PostgreSQL, Redis, storage, monitoring, and logging stack.

## 2. System Composition

### 2.1 Architecture Overview

Frontend, backend, database, cache, AI integration, and observability stack work together as the production baseline.

### 2.2 Infrastructure

Use Vercel, Railway/Fly.io, PostgreSQL, Redis, storage, CDN, logs, and metrics services with isolated environments.

## 3. Deployment Process

### 3.1 Deployment Policy

All production deployment must pass build, tests, contract checks, and staging validation.

### 3.2 Deployment Checklist

Confirm secrets, migrations, health checks, smoke tests, logs, and rollback readiness.

### 3.3 Database Migration

Run managed migrations with backup, validation, and documented rollback conditions.

## 4. Monitoring and Alerts

### 4.1 Key Metrics

- API latency
- Error rate
- DB health
- Queue or notification health
- Resource usage
- Core business KPI visibility

### 4.2 Alert Channel Setup

Use agreed alert channels for incidents, deployment notifications, and operational anomalies.

### 4.3 Dashboard Access

Operators should have access to platform dashboards, logs, metrics, and error monitoring.

## 5. Incident Response

### 5.1 Severity Definitions

Use the incident runbook severity model (`SEV-1` to `SEV-3` or equivalent severity levels).

### 5.2 Scenario-Based Response

Cover API failure, auth issues, DB degradation, notification outage, and deployment regressions.

### 5.3 Emergency Contact Network

Maintain clear escalation ownership for technical, operational, and product decisions.

## 6. Backup and Recovery

### 6.1 Backup Policy

Use scheduled DB backups, point-in-time recovery where available, and storage-level protection as needed.

### 6.2 RTO / RPO

Recovery objectives should align with the maintenance and SLA documents.

### 6.3 Recovery Procedure

Restore infrastructure, data, and application state in a controlled sequence with validation checkpoints.

### 6.4 Backup Verification

Periodically verify that backups can actually be restored.

## 7. Security Management

### 7.1 Access Control

Restrict operator permissions and audit access to production resources.

### 7.2 Security Updates

Patch dependencies, rotate secrets, and respond to vulnerability advisories on a defined schedule.

### 7.3 Secret Management

Never store production secrets in source control. Use managed secret stores and platform injection.

### 7.4 Redis Rate Limit Operations

**Monitoring:**
- Monitor Redis connection health via Upstash dashboard
- Set alerts for connection limit approaching (80% threshold)
- Track rate limit hit rates by tier

**Troubleshooting:**
```bash
# Check rate limit status
redis-cli> INFO stats
redis-cli> LRANGE ratelimit:analytics 0 10
```

### 7.5 Audit Log Operations

**Log Retention:**
- Authentication logs: 1 year
- Authorization logs: 3 years
- Data change logs: 3 years
- Payment logs: 5 years

**Monitoring:**
- Set alerts for suspicious patterns:
  - Multiple login failures (5+ in 5 minutes)
  - Permission escalation attempts
  - Bulk data exports
  - Unusual access times

**Alert Example:**
```
Severity: HIGH
Type: Security Alert
Message: Multiple failed login attempts detected
User: user@example.com
IP: 192.168.1.1
Count: 10 attempts in 5 minutes
Action: Account temporarily locked
```

### 7.6 CSRF/Security Header Monitoring

- Monitor CSP violation reports
- Set alerts for cross-origin request attempts
- Track security header enforcement

## 8. Operations Checklists

### 8.1 Daily Checklist

- Review health checks
- Review error logs
- Review major alerts
- Confirm service availability

### 8.2 Weekly Checklist

- Review performance trend
- Review backup health
- Review unresolved incidents or defects

### 8.3 Monthly Checklist

- Review dependency updates
- Review access permissions
- Review SLA / reliability metrics

## 9. Appendix

### 9.1 Useful Commands

Keep a stable set of commands for health checks, migrations, logs, and environment validation.

### 9.2 Reference Documents

- Deployment plan
- Incident runbook
- API contract policy
- Maintenance plan

### 9.3 Change History

Update this guide whenever production procedures materially change.
