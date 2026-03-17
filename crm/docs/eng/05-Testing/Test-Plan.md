# Test Plan

| Item | Value |
|------|-------|
| Project | VIVE CRM |
| Version | v1.0 |
| Scope | MVP validation baseline |

## 1. Overview

### 1.1 Purpose

Define the overall test scope, strategy, schedule, resources, environments, and reporting expectations for the VIVE CRM project.

### 1.2 Scope

The test scope covers signup/login, contacts, deals, AI lead scoring, recommendations, activities, tasks/notifications, dashboard, reports, and key non-functional requirements.

### 1.3 Reference Documents

- SRS
- SAD
- API design
- Screen design
- Database design

### 1.4 Change History

Draft, MVP-reflected, and final-approved milestones were used to finalize the plan.

### 1.5 Glossary

Key terms include `SUT`, `TC`, `RTM`, `UAT`, `CI/CD`, `SLA`, `CRM`, `Lead Scoring`, and `Deal`.

## 2. Test Strategy

### 2.1 Strategy by Test Level

- Unit test: validate functions, services, models, and components
- Integration test: validate API, DB, and inter-module flows
- System test: validate end-to-end behavior and non-functional quality
- UAT: validate business workflows from the user perspective

### 2.2 Strategy by Test Type

- Functional test
- Performance test
- Security test
- Compatibility test
- Accessibility test
- Usability / UX test

## 3. Test Scope

### 3.1 In Scope

All MVP functional requirements plus performance, security, and accessibility baselines.

### 3.2 Out of Scope

- External CRM integrations
- Full multilingual testing
- Internal behavior of third-party email or AI vendors
- Disaster recovery drills handled separately by infrastructure

## 4. Test Environment

### 4.1 Environment Setup

Use development, staging, and near-production validation environments where appropriate.

### 4.2 Test Data Strategy

Prepare representative data for users, contacts, deals, tasks, and edge-case scenarios.

### 4.3 Test Accounts

Maintain separate accounts for standard users, administrators, and restricted test flows.

## 5. Entry / Exit Criteria

### 5.1 Criteria by Test Level

Each level requires approved requirements, stable builds, and appropriate test artifacts before execution. Exit depends on pass rate and defect severity thresholds.

### 5.2 Defect Severity

Classify defects as critical, major, minor, or low based on user and business impact.

### 5.3 Defect Priority

Prioritize fixes according to release risk and MVP-critical path importance.

## 6. Schedule and Resources

### 6.1 Test Schedule

The plan assumes a dedicated MVP test window before release, including automation, manual system testing, and UAT.

### 6.2 RACI

Development leads automation, QA validates execution quality, and the product owner signs off on UAT.

### 6.3 Test Resources

Use automated tools such as Vitest, Supertest, Playwright/Cypress, k6, and security/a11y tooling as needed.

## 7. Risk Management

### 7.1 Risk Identification and Response

Track schedule compression, unstable dependencies, environment mismatch, incomplete data, and AI variability as major test risks.

## 8. Reporting

### 8.1 Daily Reporting

Include execution progress, blockers, newly found defects, and environment issues.

### 8.2 Weekly Reporting

Include cumulative pass/fail status, severity trends, and readiness risks.

### 8.3 Defect Management Process

Track defect creation, triage, assignment, fix, retest, and closure.

## 9. UX Test Plan

### 9.1 Usability Scenarios

Focus on first-time setup, contact creation, pipeline operation, and daily task use.

### 9.2 Accessibility Checklist

Use WCAG 2.1 AA as the validation baseline.

### 9.3 User Satisfaction Criteria

Evaluate clarity, efficiency, confidence, and friction in major workflows.

## Appendix

### A. Test Automation Strategy

Automate repeatable high-value flows and keep exploratory work manual.

### B. Test Tool List

Vitest, Supertest, Playwright/Cypress, k6, axe, Lighthouse, OWASP tooling.

### C. Approval

This plan serves as the baseline for the MVP testing phase.
