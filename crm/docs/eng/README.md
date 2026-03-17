# VIVE CRM Central Documentation Repository

> All technical documentation for the VIVE CRM project is managed in one place.

---

## Document Overview

This repository contains all documents required for planning, designing, developing, testing, deploying, and operating the VIVE CRM system.

For the original Korean-to-English path mapping, see [FILE-PATH-MAPPING.md](./FILE-PATH-MAPPING.md).

### Documentation Structure

```text
docs/
├── 00-Planning/              # Project planning phase deliverables
├── 01-Requirements-Analysis/       # Requirements definition and analysis
├── 02-System-Design/         # System architecture and design
├── 03-Detailed-Design/           # Detailed design documents
├── 04-Implementation/               # Implementation guides and implementation updates
├── 05-Testing/             # Test plans and results
├── 06-Deployment/               # Deployment and operations documents
├── 07-Maintenance/           # Maintenance plans
├── 08-Review/               # Phase review deliverables
├── 09-Operations-Runbook/           # Incident response and operational standard procedures
├── 11-Quality/               # Contract and quality operations policies
├── Privacy-Policy.md     # Privacy policy
├── API-Integration-Guide.md       # API developer documentation
├── Migration-Guide.md   # Data migration guide
├── CHANGELOG.md           # Version change history
└── README.md              # This file
```

---

## Detailed Document List

### 00-Planning

| Document | Description | Version |
|----------|-------------|:-------:|
| [Service Plan](./00-Planning/Service-Planning-Document.md) | Project overview, MVP scope, KPI | v1.0 |
| [Business Policy](./00-Planning/Business-Policy-Document.md) | Business rules and policy definitions | v1.0 |

### 01-Requirements Analysis

| Document | Description | Version |
|----------|-------------|:-------:|
| [Requirements Specification - SRS](./01-Requirements-Analysis/Software-Requirements-Specification-SRS.md) | Detailed definition of functional and non-functional requirements | v1.0 |
| [Use Case Specification](./01-Requirements-Analysis/Use-Case-Specification.md) | Detailed specification of 9 core use cases | v1.0 |
| [Requirements Traceability Matrix - RTM](./01-Requirements-Analysis/Requirements-Traceability-Matrix-RTM.md) | Requirement-design-test traceability | v1.0 |
| [Terminology Convention](./01-Requirements-Analysis/Terminology-Convention.md) | Project terminology and notation rules | v1.0 |

### 02-System Design

| Document | Description | Version |
|----------|-------------|:-------:|
| [System Architecture Design - SAD](./02-System-Design/System-Architecture-Design-SAD.md) | Overall architecture and technology stack decisions | v1.0 |
| [Database Design](./02-System-Design/Database-Design-Document.md) | ERD, table definitions, indexes | v1.0 |
| [API Design](./02-System-Design/API-Design-Document.md) | REST API endpoint specification | v1.0 |
| [Screen Design](./02-System-Design/Screen-Design-Document.md) | UI/UX screen design | v1.0 |

### 03-Detailed Design

| Document | Description | Version |
|----------|-------------|:-------:|
| [Detailed Design](./03-Detailed-Design/Detailed-Design-Document.md) | Module-level detailed design | v1.0 |

### 04-Implementation

| Document | Description | Version |
|----------|-------------|:-------:|
| [Implementation Guide](./04-Implementation/Implementation-Guide.md) | Code structure, execution, and verification guide | v1.0 |
| [Immediate Reflection and Operational Business Value - Implementation](./04-Implementation/Implementation-Immediate-Reflection-Operational-Business-Value.md) | Summary of implementation changes for immediate reflection and operational value | v0.1 |

### 05-Testing

| Document | Description | Version |
|----------|-------------|:-------:|
| [Test Plan](./05-Testing/Test-Plan.md) | Test strategy, environment, and schedule | v1.0 |
| [Test Cases](./05-Testing/Test-Cases.md) | Functional and non-functional test cases | v1.0 |
| [Test Result Report](./05-Testing/Test-Result-Report.md) | Test execution results | v1.0 |
| [Immediate Reflection and Operational Business Value - Test](./05-Testing/Test-Immediate-Reflection-Operational-Business-Value.md) | Verification results for immediate reflection and operational value | v0.1 |

### 06-Deployment

| Document | Description | Version |
|----------|-------------|:-------:|
| [Deployment Plan](./06-Deployment/Deployment-Plan.md) | Deployment procedure and rollback plan | v1.0 |
| [Operations Guide](./06-Deployment/Operations-Guide.md) | Monitoring, incident response, and backup | v1.0 |
| [Environment Variables and Security Notes](./06-Deployment/Environment-Variables-Security-Notes.md) | Environment variable and secret operations policy | v1.0 |

### 07-Maintenance

| Document | Description | Version |
|----------|-------------|:-------:|
| [Maintenance Plan](./07-Maintenance/Maintenance-Plan.md) | Maintenance policy and SLA | v1.0 |

### 08-Review

| Document | Description | Version |
|----------|-------------|:-------:|
| [UX Review](./08-Review/UX-Review-Document.md) | Heuristic evaluation and accessibility review | v1.0 |
| [Phase Review Checklist](./08-Review/Phase-Review-Checklist.md) | Five-phase review checklist | v1.0 |
| [Project Management Deliverables](./08-Review/Project-Management-Deliverables.md) | WBS, risk management, communication | v1.0 |
| [Cross-Analysis Proposal for docs-src](./08-Review/docs-src-Cross-Analysis-Proposal.md) | Cross-analysis of document-code consistency | v0.2 |
| [Implementation Verification Report](./08-Review/Implementation-Verification-Report.md) | Functional implementation verification results | v0.2 |

### 09-Operations Runbook

| Document | Description | Version |
|----------|-------------|:-------:|
| [Incident Response Runbook](./09-Operations-Runbook/Incident-Response-Runbook.md) | Incident severity, response procedure, rollback criteria | v0.1 |

### 11-Quality

| Document | Description | Version |
|----------|-------------|:-------:|
| [API Contract Operations Policy](./11-Quality/API-Contract-Operations-Policy.md) | OpenAPI, contract test, and Postman synchronization policy | v0.1 |

### Other Documents

| Document | Description | Version |
|----------|-------------|:-------:|
| [Privacy Policy](./Privacy-Policy.md) | Personal information collection, use, and protection policy | v1.0 |
| [API Integration Guide](./API-Integration-Guide.md) | API guide for external integrations | v1.0 |
| [Migration Guide](./Migration-Guide.md) | Data migration guide | v1.0 |
| [Changelog](./CHANGELOG.md) | Version-by-version change history | v0.1.4 |
| [Service Features](./Service-Features.md) | Implemented feature list used as the implementation baseline | v0.1.4 |
| [Release Notes v0.1.1](./releases/v0.1.1.md) | Release notes (v0.1.1) | v0.1.1 |
| [Release Notes v0.1.2](./releases/v0.1.2.md) | Release notes (v0.1.2) | v0.1.2 |
| [Release Notes v0.1.3](./releases/v0.1.3.md) | Release notes (v0.1.3) | v0.1.3 |
| [Release Notes v0.1.4](./releases/v0.1.4.md) | Release notes (v0.1.4) | v0.1.4 |

---

## Document Dependency Diagram

```text
┌─────────────────────────────────────────────────────────────────────┐
│                         00-Planning                                  │
│  Service Plan ─────────┐                                             │
│  Business Policy ──────┼──┐                                          │
└────────────────────────┼──┼──────────────────────────────────────────┘
                         │  │
                         ▼  ▼
┌─────────────────────────────────────────────────────────────────────┐
│                   01-Requirements Analysis                           │
│  SRS, Use Case Specification, RTM                                    │
└─────────────────────────────────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────────────┐
│  02-System Design ──────┐                                            │
│  (SAD, DB, API, Screens)├──→ 03-Detailed Design ───→ Development     │
└─────────────────────────┘                                            │
                         │                                             │
                         ▼                                             │
┌─────────────────────────────────────────────────────────────────────┐
│  05-Testing ───→ 06-Deployment ───→ 07-Maintenance                   │
│  (Plan/Cases/Results)  (Plan/Operations)   (Maintenance)             │
└─────────────────────────────────────────────────────────────────────┘
```

---

## Quick Start

### If You Are Reading the Project for the First Time

1. **[Service Plan](./00-Planning/Service-Planning-Document.md)** - The "why" and "what" of the project
2. **[Requirements Specification - SRS](./01-Requirements-Analysis/Software-Requirements-Specification-SRS.md)** - Concrete feature definitions
3. **[System Architecture Design - SAD](./02-System-Design/System-Architecture-Design-SAD.md)** - Technical structure
4. **[API Design](./02-System-Design/API-Design-Document.md)** - Development interfaces

### If You Are a Developer

1. **[API Integration Guide](./API-Integration-Guide.md)** - How to use the APIs
2. **[Detailed Design](./03-Detailed-Design/Detailed-Design-Document.md)** - Detailed module design
3. **[Test Cases](./05-Testing/Test-Cases.md)** - Test scenarios

### If You Are Responsible for Operations

1. **[Operations Guide](./06-Deployment/Operations-Guide.md)** - Monitoring and incident response
2. **[Deployment Plan](./06-Deployment/Deployment-Plan.md)** - Deployment procedure
3. **[Maintenance Plan](./07-Maintenance/Maintenance-Plan.md)** - Maintenance policy

### If You Are Building an External Integration

1. **[API Integration Guide](./API-Integration-Guide.md)** - API reference
2. **[Migration Guide](./Migration-Guide.md)** - Data migration method

---

## Documentation Writing Rules

### File Naming Rules

| Language | File Naming Convention | Example |
|----------|----------------------|---------|
| English documents | Use English file names (kebab-case) | `System-Architecture-Design-SAD.md` |
| Korean documents | Use Korean file names | `시스템아키텍처설계서-SAD.md` |

- Use hyphens (`-`) without spaces
- Record version information inside the document

### Document Format

- Use **Markdown (`.md`)**
- **YAML Front Matter** is optional
- **Mermaid** diagrams are supported
- Use **tables** actively

### Version Management

| Version | Meaning |
|:-------:|---------|
| v0.1 ~ v0.9 | Draft / under review |
| v1.0 | Initially approved |
| v1.1 ~ | Revised versions |

---

## Document Search Guide

### Find by Keyword

| What You Are Looking For | Search Location |
|--------------------------|-----------------|
| Functional requirements | 01-Requirements-Analysis/SRS.md |
| API specification | API-Integration-Guide.md, 02-System-Design/API-Design-Document.md |
| DB schema | 02-System-Design/Database-Design-Document.md |
| Business rules | 00-Planning/Business-Policy-Document.md |
| Test method | 05-Testing/Test-Cases.md |
| Deployment method | 06-Deployment/Deployment-Plan.md |
| Incident response | 06-Deployment/Operations-Guide.md |

---

## Document Governance

### Owners

| Role | Owner | Contact |
|------|-------|---------|
| Document lead | Kwon Younghae | - |
| Planning documents | Kwon Younghae | - |
| Technical documents | Kwon Younghae | - |
| Operations documents | Kwon Younghae | - |

### Document Change Process

```text
Change Request → Review → Revise → Verify → Approve → Publish
```

1. **Change Request:** GitHub Issue or direct proposal
2. **Review:** Stakeholder review
3. **Revise:** Document update
4. **Verify:** Accuracy check
5. **Approve:** Final approval
6. **Publish:** Document rollout

---

**Last update:** 2026-03-17  
**Document version:** v1.1  
**Author:** Kwon Younghae / Planning and Development
