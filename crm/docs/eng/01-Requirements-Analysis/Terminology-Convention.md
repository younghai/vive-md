# Terminology Convention

> **This document defines the terminology and notation rules that must be followed across all documents in this project.**
> When writing or modifying documents, the rules below must be followed strictly. If a new term appears, it must be registered in this document first and only then used elsewhere.

| Item | Value |
|------|-------|
| **Project name** | VIVE CRM |
| **Document version** | v1.0 |
| **Created on** | 2026-02-24 |
| **Last updated** | 2026-02-24 |

---

## 1. Notation Principles

| # | Principle | Correct Example | Incorrect Example |
|---|-----------|-----------------|------------------|
| 1 | Use **English abbreviations** in their original form. Do not transliterate or translate them into Korean. | `CRM`, `AI`, `API` | ~~씨알엠~~, ~~에이아이~~ |
| 2 | On the **first occurrence**, include the full name of the abbreviation in parentheses. After that, use only the abbreviation. | "AI (Artificial Intelligence)-based..." → afterwards "AI" | Repeating the full name every time |
| 3 | If a **Korean term** has been officially fixed, use Korean as the primary notation and include the English term in parentheses on first use. | "리드(Lead)" | Mixing ~~리드~~ and ~~Lead~~ |
| 4 | **Do not use multiple expressions for the same concept.** One concept must have one term only. | Standardize on "고객" | Mixing ~~클리언트~~ and ~~커스토머~~ |
| 5 | **Use the service name in its exact form only.** No abbreviations or variations. | VIVE CRM | ~~Vive~~, ~~VIVECRM~~ |
| 6 | For **compound-word spacing**, follow the "notation" column in the glossary. | "리드 스코어" | ~~리드스코어~~ |
| 7 | Use only `P0/P1/P2` for **priority notation** | `P0`, `P1`, `P2` | ~~High/Medium/Low~~, ~~Must/Should/Nice~~ |

---

## 2. Glossary

### 2.1 Service-Specific Terms

| ID | Term (Notation) | Full English Name | Definition | Notes |
|----|------------------|------------------|------------|-------|
| T-001 | VIVE CRM | - | Service name of this project. An AI-based customer management platform | **Official name. No abbreviation allowed** |
| T-002 | 리드 | Lead | A potential customer. An individual or company with sales opportunity potential | On first occurrence, include "리드(Lead)" |
| T-003 | 딜 | Deal | A sales opportunity. A unit of sales activity aimed at closing a contract with a specific customer | |
| T-004 | 파이프라인 | Pipeline | The visual flow of sales stages (Lead → Opportunity → Proposal → Negotiation → Contract) | |
| T-005 | 스테이지 | Stage | Each stage in the pipeline | "단계" may also be used |
| T-006 | 리드 스코어 | Lead Score | A numeric score representing a customer's likelihood to purchase (`0-100`) | |
| T-007 | 터치포인트 | Touchpoint | Every point of contact with a customer (email, phone, meeting, etc.) | |
| T-008 | 팔로업 | Follow-up | A follow-up action with a customer | |
| T-009 | 다음 행동 | Next Action | The next sales activity recommended by AI | |
| T-010 | 활동 | Activity | A sales activity (email sent, phone call, meeting, memo, etc.) | |

### 2.2 Technical Terms

| ID | Term (Notation) | Full English Name | Definition | Notes |
|----|------------------|------------------|------------|-------|
| T-100 | CRM | Customer Relationship Management | Customer relationship management | |
| T-101 | AI | Artificial Intelligence | Artificial intelligence | |
| T-102 | API | Application Programming Interface | An interface contract for communication between software systems | |
| T-103 | SaaS | Software as a Service | Subscription-based cloud software service | |
| T-104 | RBAC | Role-Based Access Control | Role-based access control | |
| T-105 | JWT | JSON Web Token | A token format used for authentication | |
| T-106 | MRR | Monthly Recurring Revenue | Monthly recurring revenue | |
| T-107 | SRS | Software Requirements Specification | Software requirements specification | |

### 2.3 Business and Metric Terms

| ID | Term (Notation) | Full English Name | Definition | Notes |
|----|------------------|------------------|------------|-------|
| T-200 | MVP | Minimum Viable Product | The minimum product that can validate the core hypothesis | |
| T-201 | PMF | Product-Market Fit | The state in which a product satisfies market demand | |
| T-202 | KPI | Key Performance Indicator | Key performance indicator | |
| T-203 | Retention | - | The rate at which users revisit the service, categorized as D1/D7/D30 | Use the original term without Korean translation |
| T-204 | North Star Metric | - | A single metric representing the service's core value | Use the original term without Korean translation |
| T-205 | Core Loop | - | The core action flow that users repeatedly perform | Use the original term without Korean translation |
| T-206 | Freemium | Free + Premium | A revenue model combining a free base offering with a paid premium tier | |
| T-207 | CAC | Customer Acquisition Cost | Customer acquisition cost | |
| T-208 | LTV | Lifetime Value | Customer lifetime value | |
| T-209 | Conversion Rate | - | Conversion rate | |

### 2.4 Priority Notation

| Notation | Meaning | Context of Use |
|----------|---------|----------------|
| `P0` | Must Have | Must be included in the MVP. Without it, the service cannot stand |
| `P1` | Should Have | Recommended for inclusion in the MVP. Needed for the core experience but not the absolute minimum |
| `P2` | Nice to Have | Include in the MVP if time allows. Core value can still be validated without it |

---

## 3. Procedure for Adding or Changing Terms

1. If a new term is needed → assign an ID and register it in the appropriate category of this document
2. Apply the notation principles in Section 1 and finalize the notation
3. **Reflect it consistently across all project documents** (if older documents use different wording, update them)
4. When deleting or changing a term → record it in the change history and apply it across all documents

### ID Scheme

| Range | Category |
|-------|----------|
| `T-001 ~ T-099` | Service-specific terms |
| `T-100 ~ T-199` | Technical terms |
| `T-200 ~ T-299` | Business and metric terms |
| `T-300 ~` | Reserved for future extension |

---

## Change History

| Date | Description | Changed By |
|------|-------------|------------|
| 2026-02-24 | Initial glossary created | Kwon Younghae |
