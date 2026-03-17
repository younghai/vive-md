# Test Cases

## 1. Test Case Management Rules

### 1.1 Authoring Rules

Each test case should have a stable ID, clear objective, steps, expected results, and traceability to requirements.

### 1.2 Naming Rules

Use prefixes such as `TC-FN`, `TC-PF`, `TC-SC`, `TC-AC`, and `TC-RG` to classify test intent.

### 1.3 Status Management

Track states such as drafted, ready, executed, passed, failed, blocked, and deferred.

## 2. Functional Test Cases (`TC-FN`)

### 2.1 Authentication - Sign Up

Cover valid signup, invalid inputs, duplicate email, password rules, and verification states.

### 2.2 Authentication - Login / Logout

Cover successful login, invalid credentials, token refresh, logout, and session expiration.

### 2.3 Contact Management

Cover CRUD, duplicate validation, filters, tags, import, limit rules, and restore.

### 2.4 Deal / Pipeline

Cover deal creation, stage movement, close outcomes, due dates, and pipeline limits.

### 2.5 AI Features

Cover lead score generation, grade boundaries, fallback behavior, and recommendations.

### 2.6 Activity / Task

Cover timeline creation, task CRUD, completion, notification triggers, and overdue handling.

### 2.7 Search / Filtering Cases

Cover list filtering by keyword, tag, stage, score range, and ownership.

### 2.8 Permission Cases

Cover owner-only access, admin-only operations, and immediate permission reflection behavior.

## 3. Non-Functional Test Cases

### 3.1 Performance (`TC-PF`)

Validate response time, throughput, and stability under expected load.

### 3.2 Security (`TC-SC`)

Validate auth bypass attempts, injection risks, sensitive data exposure, and dependency hygiene.

### 3.3 Compatibility (`TC-CP`)

Validate operation across target browsers and responsive breakpoints.

### 3.4 Accessibility (`TC-AC`)

Validate keyboard operation, labels, focus states, color contrast, and assistive compatibility.

## 4. UX Test Scenarios

### 4.1 Task-Based Usability Scenarios

Evaluate first-time signup, first contact creation, deal progression, and report review.

### 4.2 Error-State Scenarios

Validate how the product communicates network, validation, permission, and empty-state issues.

### 4.3 User Satisfaction Evaluation

Use a short rubric for clarity, speed, trust, and perceived usefulness.

## 5. Regression Test Cases (`TC-RG`)

### 5.1 Core Regression Suite

Protect auth, contacts, deals, AI recommendations, tasks, notifications, and dashboard flows.

### 5.2 Execution Criteria

Run the regression suite before release, after major feature merges, and after critical bug fixes.

## 6. Bug Report Template

### Bug Report

Include defect ID, environment, reproduction steps, expected behavior, actual behavior, severity, attachments, and owner.

## Appendix: Guide for Adding New Test Cases

### A. Checklist for New Test Cases

- Mapped to requirement
- Expected result is measurable
- Includes edge or failure conditions where relevant

### B. Test Case Review Criteria

Review for clarity, completeness, traceability, and duplication risk.
