# Proposal for Cross-Analysis of docs-src Consistency

## Consistency Re-Review (2026-03-04)

This document summarizes the re-review of consistency gaps between documentation and source implementation.

## 1. Summary

Several mismatches were found across Prisma models, DB design, API contracts, business logic, and non-functional expectations. The proposal prioritizes gaps by implementation urgency.

## 2. Prisma Model ↔ DB Design Mismatches

### 2.1 Contact Model

Field naming, optionality, and operational fields should be kept aligned with the DB design document.

### 2.2 Deal Model

Stage, amount, and lifecycle fields require strict consistency between schema and documentation.

### 2.3 Activity Model

Timeline-related relations and recent-contact metadata must remain synchronized.

### 2.4 User Model

Role, company, and authentication fields need stable documentation and implementation mapping.

### 2.5 LeadScore / LeadScoreHistory

Score grade handling and history persistence must match both business rules and DB design.

## 3. Unimplemented APIs and Path / Spec Mismatches

### 3.1 Auth

Review missing or outdated admin and profile-related routes.

### 3.2 Contacts

Review import, restore, duplicate checks, and contract accuracy.

### 3.3 Deals

Review pipeline-specific routes and close-state contract alignment.

### 3.4 AI

Review score and recommendation path alignment.

### 3.5 Dashboard

Review summary and activity endpoints.

### 3.6 Reports

Review expanded report coverage and contract completeness.

### 3.7 Tasks

Review full CRUD and lifecycle completeness.

## 4. Business Logic Mismatches

### 4.1 Contact Creation

Check score calculation, registration activity logging, and validation alignment.

### 4.2 `lastContactAt`

Ensure it updates consistently on the correct activity triggers.

### 4.3 Contact Limit

Ensure free-tier limits are enforced consistently in code and documentation.

### 4.4 Password Policy

Ensure actual validation matches the policy baseline.

### 4.5 Lead Score Grade

Ensure grade boundaries and naming stay consistent.

## 5. NFR Gaps

Observability, readiness probes, metrics depth, and some operational hardening remain weaker than target documents imply.

## 6. Notifications (`FR-007`) Not Fully Implemented

Notification delivery and lifecycle behavior require stronger implementation completeness and contract clarity.

## 7. Proposals by Priority

### P1 (Required / High Priority)

- Close contract and implementation mismatches affecting MVP-critical paths
- Update documents that lag behind actual code

### P2 (Recommended)

- Strengthen operational metrics and secondary behaviors
- Improve report and notification depth

### P3 (Optional)

- Further polish and future-scope alignment work

## 8. Documentation Update Proposals

Refresh DB, API, RTM, and verification documents whenever implementation materially shifts.

## 9. Conclusion

The fastest path is to close P1 mismatches first, then refresh documentation so the codebase and document set converge again.
