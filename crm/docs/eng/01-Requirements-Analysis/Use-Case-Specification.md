# Use Case Specification

## Document Information

This document describes the main actors and the nine core use cases of the VIVE CRM MVP.

## Change History

| Version | Description |
|---------|-------------|
| v1.0 | Initial use case baseline |

## Table of Contents

The document includes the overall use case model, actor definitions, a use case list, and detailed scenario summaries.

## 1. Use Case Diagram

### 1.1 Overall System Use Case Diagram

The system centers on the following user goals:

- Sign up and log in
- Manage contacts and deals
- Track activities and tasks
- Review AI insights
- Use dashboards and reports

## 2. Actor Definitions

### 2.1 Primary Actors

| Actor | Description |
|-------|-------------|
| Regular user | Uses CRM features for day-to-day sales work |
| Administrator | Manages permissions, team scope, and operational controls |

### 2.2 Secondary Actors

| Actor | Description |
|-------|-------------|
| AI service | Generates scores and recommendations |
| Email / notification service | Delivers reminders and transactional notices |
| Payment / infrastructure services | Support billing and operations |

### 2.3 Actor Hierarchy

`ADMIN` extends the baseline capabilities of `USER` with additional management authority.

## 3. Use Case List

| ID | Use Case |
|----|----------|
| `UC-001` | Sign up / login |
| `UC-002` | Contact management |
| `UC-003` | Deal management |
| `UC-004` | AI lead scoring |
| `UC-005` | Next action recommendation |
| `UC-006` | Activity tracking |
| `UC-007` | Task and notification management |
| `UC-008` | Dashboard |
| `UC-009` | Performance reporting |

## 4. Detailed Use Case Specifications

### 4.1 UC-001: Sign Up / Login

- Goal: allow users to create an account, authenticate, and access the service securely
- Main flow: sign up, verify email if required, log in, receive tokens, enter dashboard
- Alternate flows: invalid credentials, expired session, password reset, account lock

### 4.2 UC-002: Contact Management

- Goal: create, update, view, filter, and soft-delete customer records
- Main flow: register contact, calculate score, view detail timeline, edit or delete
- Alternate flows: duplicate email, free-tier customer limit, restore from trash

### 4.3 UC-003: Deal Management

- Goal: manage sales opportunities linked to contacts through a fixed pipeline
- Main flow: create deal, move across stages, update amount and close date, close won/lost
- Alternate flows: missing contact linkage, invalid stage reversal, overdue handling

### 4.4 UC-004: AI Lead Scoring

- Goal: calculate and display customer purchase likelihood
- Main flow: analyze contact profile and history, return score and grade, reflect on UI
- Alternate flows: AI timeout or failure, fallback scoring, recalculation after updates

### 4.5 UC-005: Next Action Recommendation

- Goal: recommend the most useful next step for a lead or deal
- Main flow: generate prioritized action, show today list, allow user follow-through
- Alternate flows: insufficient data, stale recommendations, low-priority contacts

### 4.6 UC-006: Activity Tracking

- Goal: record customer-facing activity and maintain a reliable timeline
- Main flow: add email/call/meeting/note activity, update history and recency fields
- Alternate flows: invalid relation, missing schedule, duplicated timeline events

### 4.7 UC-007: Task / Notification Management

- Goal: manage follow-up work items and reminder delivery
- Main flow: create task, assign due date, receive notification, complete task
- Alternate flows: overdue reminders, bulk read, restore deleted task, notification failure

### 4.8 UC-008: Dashboard

- Goal: provide at-a-glance KPI and pipeline visibility
- Main flow: open dashboard, review summaries, recent activity, and recommendation counts
- Alternate flows: empty state for new users, delayed analytics, degraded data freshness

### 4.9 UC-009: Performance Reporting

- Goal: review weekly and monthly sales and activity performance
- Main flow: generate report, review pipeline movement and outcome trends
- Alternate flows: partial data availability, export limitations, delayed aggregation

This use case set is intended to align directly with the SRS, business rules, and RTM.
