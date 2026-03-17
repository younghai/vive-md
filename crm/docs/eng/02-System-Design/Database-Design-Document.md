# Database Design Document

## 1. Overview

### 1.1 Purpose

Define the relational data model for VIVE CRM, including entity responsibilities, integrity rules, indexing strategy, retention policy, and migration guidance.

### 1.2 DBMS Selection

PostgreSQL is used as the primary relational database because it supports transactional consistency, flexible indexing, strong tooling, and managed cloud deployment options.

### 1.3 Data Modeling Principles

- Normalize core business entities while keeping operational queries practical
- Prefer explicit foreign keys and history tables for lifecycle tracking
- Support soft delete and auditability

## 2. ERD

The ERD centers on `users`, `contacts`, `deals`, `activities`, `tasks`, `lead_scores`, `notifications`, and `audit_logs`, with supporting history and token tables.

## 3. Table Specifications

### 3.1 `users`

Stores account identity, role, company context, and authentication metadata.

### 3.2 `contacts`

Stores customer profile, communication metadata, tags, source, memo fields, and soft delete markers.

### 3.3 `deals`

Stores sales opportunities linked to contacts, including stage, amount, probability, and close-date data.

### 3.4 `activities`

Stores timeline events such as notes, calls, emails, and meetings.

### 3.5 `tasks`

Stores follow-up work items and completion / reminder state.

### 3.6 `lead_scores`

Stores the current AI lead score snapshot and grade.

### 3.7 `lead_score_history`

Stores historical score changes for trend and audit use.

### 3.8 `deal_stage_history`

Stores stage-transition history for deals.

### 3.9 `refresh_tokens`

Stores refresh-session state and rotation / expiration data.

### 3.10 `notifications`

Stores in-app notification records and read state.

### 3.11 `audit_logs`

Stores security and operational audit events for sensitive actions and requests.

## 4. Index Strategy

### 4.1 Index List

Prioritize indexes on:

- Ownership fields (`user_id`, `owner_id`)
- Search fields such as email and company
- Pipeline / stage filters
- Due dates, created timestamps, and soft-delete filters

### 4.2 Performance Considerations

Balance read-heavy dashboard queries with manageable write overhead. Review composite indexes for list filters, activity feeds, and reporting.

## 5. Data Retention and Security

### 5.1 Soft Delete Policy

Contacts, deals, and tasks prefer logical deletion so they can be restored and excluded from default views.

### 5.2 Data Backup

Use managed database backup, point-in-time recovery, and periodic restore verification.

### 5.3 Sensitive Data Handling

Protect secrets, credentials, and privacy-sensitive data with encryption, restricted access, and legal retention rules.

## 6. Capacity Estimation

### 6.1 Estimated Annual Volume

The largest growth is expected in contacts, activities, tasks, score history, and audit logs. Reporting and indexing should consider multi-tenant growth even in an MVP architecture.

## 7. Prisma Schema Reference

### 7.1 Major Migration History

Schema evolution is managed through Prisma migrations, including contact field expansion, notifications, audit logging, and score changes.

### 7.2 Migration Commands

Use Prisma generate, push, migrate status, and migrate deploy commands as the operational baseline.

## 8. Appendix

### A. ENUM Definitions

Typical enums include user roles, deal stages, task priorities, notification states, and lead grades.

### B. Foreign Key Constraints

Relationships must preserve referential integrity between users, contacts, deals, activities, tasks, and associated history entities.
