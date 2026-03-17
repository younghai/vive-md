# Phase-by-Phase Review Checklist

## Phase 1: Requirements Review Checklist

### 1.1 Review `Software-Requirements-Specification-SRS.md`

Confirm clarity, completeness, priority, and traceability of requirements.

### 1.2 Review Use Case Specification (9 UCs)

Confirm actor coverage, main flows, alternate flows, and business rule linkage.

### 1.3 Review RTM

Confirm every requirement maps to design, code, and tests.

## Phase 2: Design Review Checklist

### 2.1 Review `System-Architecture-Design-SAD.md`

Confirm architecture is coherent, feasible, and aligned with requirements.

### 2.2 Review `Database-Design-Document.md`

Confirm entities, keys, indexes, retention rules, and migration strategy.

### 2.3 Review `API-Design-Document.md`

Confirm route contracts, error handling, and versioning rules.

### 2.4 Review `Screen-Design-Document.md`

Confirm layout, interaction patterns, accessibility baseline, and responsive behavior.

## Phase 3: Code Review Checklist

### 3.1 Next.js + TypeScript Frontend

Review UI correctness, routing, state handling, and accessibility basics.

### 3.2 Hono + TypeScript Backend

Review API correctness, auth boundaries, business rules, and logging.

### 3.3 Prisma ORM

Review schema fidelity, query safety, and migration hygiene.

### 3.4 Vitest Tests

Review coverage of core logic and regression risk.

## Phase 4: Test Review Checklist

### 4.1 Review `Test-Plan.md`

Confirm scope, strategy, environments, and exit criteria.

### 4.2 Review `Test-Cases.md`

Confirm case quality, traceability, and coverage.

### 4.3 Review `Test-Result-Report.md`

Confirm release-readiness evidence and remaining risk status.

## Phase 5: Deployment Review Checklist

### 5.1 Review `Deployment-Plan.md`

Confirm deployment steps, rollback, and migration readiness.

### 5.2 Review `Operations-Guide.md`

Confirm monitoring, backup, security, and incident response readiness.

## Review Completion Confirmation

Each phase should record reviewer, date, findings, and approval outcome.

## Approval

The checklist serves as a standard quality gate across the document and implementation lifecycle.
