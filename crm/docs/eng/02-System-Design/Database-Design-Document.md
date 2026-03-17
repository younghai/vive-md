# Database Design Document

> **Version:** v1.1  
> **Created on:** 2026-02-24  
> **Updated on:** 2026-03-17  
> **Author:** Kwon Younghae / Planning and Development

---

## Change History

| Version | Date | Description | Author |
|---------|------|-------------|--------|
| v1.0 | 2026-02-24 | Initial database design | Kwon Younghae |
| v1.1 | 2026-03-17 | Added Workspace, Membership, Subscription tables for multi-tenancy | Kwon Younghae |

---

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

The ERD centers on `workspaces` (tenant), `users`, `memberships`, `subscriptions`, `contacts`, `deals`, `activities`, `tasks`, `lead_scores`, `notifications`, and `audit_logs`, with supporting history and token tables.

### 2.1 Multi-Tenancy Data Model

```
Workspace (Tenant)
├── Subscription (subscription info)
├── Membership[] (team member relations)
├── Contacts[] (customer data)
├── Deals[] (sales opportunities)
├── Tasks[] (task management)
└── AuditLogs[] (audit logs)
```

### 2.2 Key Relationships

- **Workspace** is the root tenant entity. All data belongs to a workspace.
- **User** can belong to multiple workspaces via **Membership**.
- **Membership** defines role (OWNER/ADMIN/MEMBER) within a workspace.
- **Subscription** defines plan and billing for each workspace.

## 3. Table Specifications

### 3.1 `workspaces`

Stores tenant/organization information. The root entity for multi-tenancy.

| Column | Type | Description |
|--------|------|-------------|
| id | String (PK) | Unique workspace identifier (CUID) |
| name | String | Workspace display name |
| slug | String (Unique) | URL-friendly identifier |
| plan | Enum | FREE, PRO, ENTERPRISE |
| status | Enum | ACTIVE, SUSPENDED, DELETED |
| created_at | Timestamp | Creation timestamp |
| updated_at | Timestamp | Last update timestamp |

**Indexes:** slug, plan

### 3.2 `subscriptions`

Stores subscription and billing information for each workspace.

| Column | Type | Description |
|--------|------|-------------|
| id | String (PK) | Unique subscription identifier |
| workspace_id | String (FK) | Reference to workspaces.id |
| stripe_customer_id | String | Stripe customer identifier |
| stripe_subscription_id | String | Stripe subscription identifier |
| status | Enum | INCOMPLETE, ACTIVE, CANCELED, PAST_DUE |
| current_period_start | Timestamp | Subscription period start |
| current_period_end | Timestamp | Subscription period end |
| plan | Enum | FREE, PRO, ENTERPRISE |
| cancel_at_period_end | Boolean | Whether to cancel at period end |

### 3.3 `memberships`

Stores user-workspace relationships and roles.

| Column | Type | Description |
|--------|------|-------------|
| id | String (PK) | Unique membership identifier |
| workspace_id | String (FK) | Reference to workspaces.id |
| user_id | String (FK) | Reference to users.id |
| role | Enum | OWNER, ADMIN, MEMBER |
| invited_by | String | User ID who sent invitation |
| created_at | Timestamp | Join timestamp |
| updated_at | Timestamp | Last update timestamp |

**Unique Constraint:** (workspace_id, user_id)
**Indexes:** workspace_id, user_id

### 3.4 `users`

Stores account identity and authentication metadata. User can belong to multiple workspaces via memberships.

### 3.5 `contacts`

Stores customer profile, communication metadata, tags, source, memo fields, and soft delete markers. Belongs to a workspace.

**Key Fields:**
- workspace_id (FK): Reference to workspaces.id for multi-tenancy
- user_id (FK): Reference to users.id (creator)
- email, name, phone, company, job_title
- tags, source, memo
- deleted_at (soft delete)

### 3.6 `deals`

Stores sales opportunities linked to contacts, including stage, amount, probability, and close-date data. Belongs to a workspace.

**Key Fields:**
- workspace_id (FK): Reference to workspaces.id
- contact_id (FK): Reference to contacts.id

### 3.7 `activities`

Stores timeline events such as notes, calls, emails, and meetings. Belongs to a workspace.

**Key Fields:**
- workspace_id (FK): Reference to workspaces.id

### 3.8 `tasks`

Stores follow-up work items and completion / reminder state. Belongs to a workspace.

**Key Fields:**
- workspace_id (FK): Reference to workspaces.id

### 3.9 `lead_scores`

Stores the current AI lead score snapshot and grade. Belongs to a workspace.

**Key Fields:**
- workspace_id (FK): Reference to workspaces.id

### 3.10 `lead_score_history`

Stores historical score changes for trend and audit use.

### 3.11 `deal_stage_history`

Stores stage-transition history for deals.

### 3.12 `refresh_tokens`

Stores refresh-session state and rotation / expiration data.

**Security:**
- HttpOnly, Secure, SameSite=Strict cookies only
- No JSON response

### 3.13 `notifications`

Stores in-app notification records and read state. Belongs to a workspace.

**Key Fields:**
- workspace_id (FK): Reference to workspaces.id

### 3.14 `audit_logs`

Stores security and operational audit events for sensitive actions and requests. Immutable (WORM - Write Once Read Many).

| Column | Type | Description |
|--------|------|-------------|
| id | String (PK) | Unique log identifier |
| workspace_id | String (FK) | Reference to workspaces.id |
| user_id | String (FK) | Reference to users.id (nullable) |
| action | Enum | CREATE, UPDATE, DELETE, EXPORT, LOGIN, LOGOUT, PERMISSION_CHANGE |
| entity | String | Target entity (contact, deal, etc.) |
| entity_id | String | Target entity ID |
| metadata | JSON | Additional context |
| ip_address | String | Client IP address |
| user_agent | String | Client user agent |
| created_at | Timestamp | Event timestamp |

**Indexes:** workspace_id + created_at, user_id

**Audit Log Events:**
- Authentication: Login, Logout, Login failures
- Authorization: Permission changes, role changes
- Data: Contact/Deal/Task create, update, delete, export
- Payment: Subscription changes, payment events

## 4. Index Strategy

### 4.1 Index List

Prioritize indexes on:

- Tenant isolation (`workspace_id`) - critical for multi-tenancy
- Ownership fields (`user_id`, `created_by`)
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
