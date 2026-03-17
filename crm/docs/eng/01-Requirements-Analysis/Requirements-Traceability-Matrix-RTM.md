# Requirements Traceability Matrix (RTM)

## Document Information

Tracks how requirements are mapped to design, implementation, testing, and release status for VIVE CRM.

## Change History

| Version | Description |
|---------|-------------|
| v1.0 | Initial RTM baseline |

## 1. Purpose

Ensure that every requirement is connected to design artifacts, code implementation, tests, and validation outcomes.

## 2. Traceability Scope

- Functional requirements (`FR`)
- Non-functional requirements (`NFR`)
- Related business rules (`BR`)
- Design documents, implementation modules, and test artifacts

## 3. Status Definitions

### 3.1 Requirement Status

| Status | Meaning |
|--------|---------|
| Draft | Defined but not yet approved |
| Approved | Baseline requirement |
| Implemented | Reflected in code |
| Verified | Covered by tests or review evidence |

### 3.2 Mapping Status

| Status | Meaning |
|--------|---------|
| Full | Requirement is fully mapped |
| Partial | Some downstream artifacts exist, but coverage is incomplete |
| Gap | No reliable mapping or evidence found |

## 4. Functional Requirement Traceability Matrix

| Requirement | Design | Implementation | Test | Status |
|-------------|--------|----------------|------|--------|
| `FR-001` Auth | SAD, API design, detailed design | Auth module | Unit / integration / system | Implemented |
| `FR-002` Contacts | DB design, API design, screen design | Contacts module | CRUD and permission tests | Implemented |
| `FR-003` Deals | Pipeline and DB design | Deals module | Pipeline and lifecycle tests | Implemented |
| `FR-004` AI scoring | AI rules, detailed design | AI module | Lead score tests | Implemented |
| `FR-005` Recommendations | AI and dashboard design | AI module | Recommendation tests | Implemented |
| `FR-006` Activities | DB and detailed design | Activities module | Activity flow tests | Implemented |
| `FR-007` Tasks / notifications | API design, detailed design | Tasks and notifications modules | CRUD and notification tests | Partially implemented |
| `FR-008` Dashboard | Screen and API design | Dashboard module | System and review tests | Implemented |
| `FR-009` Reports | API and screen design | Reports module | Reporting tests | Partially implemented |

## 5. Non-Functional Requirement Traceability Matrix

| Requirement | Related Artifact | Validation | Status |
|-------------|------------------|-----------|--------|
| Performance | SAD, test plan, result report | Load test and response metrics | Partial |
| Security | Business policy, API design, ops guide | Audit, validation, dependency scan | Partial |
| Availability | Ops guide, runbook, deployment plan | Health checks, backup, rollback | Implemented |
| Accessibility | Screen design, UX review, test plan | WCAG checklist and tooling | Partial |

## 6. Coverage Summary

### 6.1 Functional Coverage (as of v0.1.4)

Core MVP requirements are largely covered, with remaining gaps concentrated in extended notifications, reporting depth, and some operational interfaces.

### 6.2 Non-Functional Coverage (as of v0.1.4)

Availability and core security controls are in place. Accessibility, advanced performance verification, and some observability requirements need further strengthening.

### 6.3 Coverage by Priority

| Priority | Coverage Summary |
|----------|------------------|
| `P0` | Broadly implemented and verified |
| `P1` | Implemented with several partial gaps |
| `P2/P3` | Planned for later releases |

### 6.4 Overall Progress

The RTM indicates a stable MVP baseline with follow-up work required for advanced features and operational hardening.

## 7. Detailed Implementation References

### 7.1 Module Status

- Auth, contacts, deals, AI, tasks, notifications, dashboard, and reports modules exist in code
- Some documents and route contracts were updated after implementation and require ongoing alignment

### 7.2 Test Statistics

Use the test plan, test result report, and implementation verification report as the primary validation sources.

## 8. RTM Update Procedure

### 8.1 Update Cycle

- Update whenever requirements, design, implementation, or tests change materially
- Refresh before major releases and review checkpoints

### 8.2 Change Impact Checklist

- Did the requirement text change?
- Did the API, DB, or UI change?
- Were the related tests updated?
- Was the release note or changelog updated?

## 9. Next Release Plan (P2/P3)

Future releases should strengthen advanced search, exports, external integrations, operational observability, and more complete notification behavior.

## Appendix: RTM ID Scheme

Use stable requirement IDs (`FR`, `NFR`, `BR`, `TC`) so traceability remains consistent across documents.
