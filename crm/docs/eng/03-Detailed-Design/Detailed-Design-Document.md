# Detailed Design Document

## 1. Document Overview

### 1.1 Purpose

Provide module-level design detail, object relationships, lifecycle diagrams, and coding baselines needed for implementation and review.

### 1.2 Scope

Covers class structure, sequence flow, state changes, module design, and coding standards for the VIVE CRM MVP.

### 1.3 Reference Documents

- SRS
- Use Case Specification
- SAD
- API, DB, and screen design

### 1.4 Change History

This version represents the initial detailed design baseline.

## 2. Class Diagrams

### 2.1 Full Domain Model View

Key entities include user, contact, deal, activity, task, notification, score, and history objects.

### 2.2 Service Layer Class Diagram

Service classes orchestrate validation, repository access, business rule enforcement, and side effects such as notifications and AI scoring.

### 2.3 Infrastructure Layer Class Diagram

Infrastructure classes encapsulate persistence, external APIs, logging, and configuration concerns.

## 3. Sequence Diagrams

### 3.1 Contact Registration and AI Lead Scoring Flow

User action triggers contact creation, persistence, AI scoring, grade assignment, and UI refresh.

### 3.2 Pipeline Deal Movement Flow

Deal movement validates stage rules, records history, updates pipeline state, and may trigger reminders or metrics changes.

### 3.3 Next Action Recommendation Flow

Recommendation requests gather contact and activity context, score urgency, and return prioritized actions.

## 4. State Diagrams

### 4.1 Deal State

Deals move through fixed pipeline states and terminate in `Closed Won` or `Closed Lost`.

### 4.2 Task State

Tasks support active, completed, deleted, and restored lifecycle handling.

### 4.3 Contact State

Contacts support active, soft-deleted, and restored states, with score and relationship continuity rules.

## 5. Module Detailed Design

### 5.1 `AuthModule`

Handles registration, login, refresh, profile update, and authorization guards.

### 5.2 `ContactModule`

Handles contact CRUD, duplicate checks, import, restore, and timeline relationships.

### 5.3 `DealModule`

Handles deal CRUD, stage transitions, history, and pipeline board aggregation.

### 5.4 `AIModule`

Handles lead scoring and recommendation generation with safe fallback logic.

### 5.5 `DashboardModule`

Aggregates KPI, recent activity, recommendation counts, and pipeline summaries.

## 6. Applied Design Patterns

### 6.1 Pattern List

- Layered architecture
- Repository pattern
- DTO and mapping boundaries
- Guard / middleware for auth and policy checks

### 6.2 Pattern Examples

Patterns are applied to isolate business rules, improve testability, and keep API handlers thin.

## 7. Coding Standards

### 7.1 Naming Conventions

Use predictable TypeScript naming, stable API naming, and clear entity vocabulary.

### 7.2 Code Structure

Group code by domain module with explicit separation between transport, business logic, and persistence.

### 7.3 Error Handling Rules

Use explicit exceptions, structured logging, and standard response envelopes.

### 7.4 Code Review Checklist

Focus on requirement alignment, security, maintainability, and test coverage.

## Appendix

### A. DTO List

Important DTOs include auth, contact, deal, activity, task, notification, and dashboard/report payloads.

### B. Reference Documents

All detailed design sections map back to the architecture, API, DB, UI, and requirements documents.
