# Maintenance Plan

| Item | Value |
|------|-------|
| Project | VIVE CRM |
| Version | v1.0 |
| Maintenance window | 2026-04-15 to 2027-04-14 |

## 1. Maintenance Type Definitions

### 1.1 Maintenance Categories

#### Corrective Maintenance

Fix defects discovered in production to restore normal operation and reduce user impact.

#### Adaptive Maintenance

Adjust the system to environmental changes such as platform updates, API changes, or regulatory changes.

#### Perfective Maintenance

Improve the system based on user needs, feature enhancement, or business value growth.

#### Preventive Maintenance

Reduce future risk through refactoring, dependency updates, testing, and security hardening.

### 1.2 Target Ratio by Maintenance Type

| Type | Target Ratio |
|------|--------------|
| Corrective | 20% |
| Adaptive | 25% |
| Perfective | 40% |
| Preventive | 15% |

## 2. Change Request (CR) Process

### 2.1 Flow

Register request, analyze impact, approve or reject, implement, test, deploy, and close with monitoring.

### 2.2 CR Template

Track request ID, requester, type, priority, desired due date, change description, business impact, and approval history.

### 2.3 Impact Analysis Template

Assess code, DB, API, UI/UX, external integrations, performance, security, effort, risk, and recommendation.

### 2.4 Approval Criteria

| Size | Criteria | Approver |
|------|----------|----------|
| Small | Up to 3 man-days, single module | Lead |
| Medium | 3 to 10 man-days, multiple modules | Change control board |
| Large | More than 10 man-days, architecture or migration impact | Executive approval |
| Emergency | Critical defect or security patch | Immediate lead approval |

## 3. SLA Definitions

### 3.1 Response and Recovery Targets

Critical issues require the fastest response and short recovery objectives; lower severity issues allow longer windows.

### 3.2 Availability Targets

- Service availability target: `99.9%`
- Core feature availability target: `99.95%`
- API availability target: `99.9%`

### 3.3 Escalation for SLA Breach

Escalate through lead, PM, project owner, and executive review depending on severity and duration.

## 4. Technical Debt Management

### 4.1 Debt Categories

- Code complexity
- Architectural shortcuts
- Missing tests
- Documentation drift
- Dependency and security debt

### 4.2 Debt Registration Template

Record debt ID, description, impact, owner, target release, and remediation strategy.

### 4.3 Debt Remediation Plan

Address the highest-risk items in regular maintenance windows and before major releases.

## 5. Handover Document Template

### 5.1 System Diagram

Capture system topology and ownership boundaries.

### 5.2 Account and Access List

Track operator access, platform ownership, and credential responsibility.

### 5.3 Recurring Task Schedule

List backup, audit, review, and maintenance jobs.

### 5.4 Known Issue List

Document accepted limitations and follow-up plans.

### 5.5 Emergency Contacts

Keep an up-to-date operator and escalation list.

## Appendix

### A. Maintenance Report Template

Include issue summary, work performed, validation results, and follow-up actions.

### B. Approval

This plan defines the baseline maintenance framework for the first operational year.
