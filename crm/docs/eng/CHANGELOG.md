# Changelog

> All notable changes are documented in this file.

This format follows [Keep a Changelog](https://keepachangelog.com/en/1.0.0/) and versioning follows [Semantic Versioning](https://semver.org/).

---

## [Unreleased]

### Changed
- Updated the document index consistency by linking newly added documents in `README.md`
- Reflected a re-review of the code baseline in the docs-src and implementation verification documents

---

## [1.0.0] - 2026-04-15 (Planned)

### Added

#### User Authentication
- Email-based sign-up and login
- JWT-based authentication system (Access Token, Refresh Token)
- Password reset feature

#### Contact Management
- Create, read, update, and delete customer information (CRUD)
- 360-degree customer profile view
- Tag-based customer classification
- Bulk CSV import and export
- Duplicate customer detection and merge

#### Sales Pipeline (Deals)
- Kanban-style pipeline management
- Five-stage sales pipeline (Lead → Opportunity → Proposal → Negotiation → Contract)
- Deal amount and expected close date management
- Drag-and-drop stage movement
- Revenue forecasting by pipeline

#### AI Features
- AI lead scoring (0-100, grades A/B/C/D)
- Next action recommendations (email/call/meeting/rest)
- Success probability prediction
- Revenue forecast reports

#### Activity Management
- Logging for email, call, meeting, and note activities
- Automatic customer timeline generation
- Performance analysis by activity type

#### Tasks and Notifications
- Follow-up task registration
- Due date-based notifications
- Priority settings (high/medium/low)
- Email and in-app notifications

#### Dashboard
- Core KPI summary (total customers, new customers, pipeline status)
- Lead score distribution chart
- Today's recommended action list
- Pending task alerts

#### Reports
- Weekly and monthly activity reports
- Sales performance analysis
- Pipeline trend analysis
- Lead score trend tracking

#### Subscription and Billing
- Freemium structure (free tier limited to 100 customers)
- Pro Starter plan (KRW 29,000/month)
- Pro Business plan (KRW 49,000/month)
- Annual billing discount (17%)

### Security

- TLS 1.2+ encryption for all data transmission
- Passwords stored with bcrypt hashing
- JWT-based stateless authentication
- SQL injection prevention (Prisma ORM)
- XSS prevention (input escaping)
- Rate limiting applied

### Technical

- Next.js 14+ (App Router) frontend
- Hono (Node.js) backend API
- PostgreSQL (Supabase/Neon) database
- Redis (Upstash) for session and cache
- Prisma ORM
- Tailwind CSS + shadcn/ui
- OpenAI API integration

---

## [0.9.0] - 2026-04-01 (Beta)

### Added
- Beta release published
- Core features fully implemented
- Closed beta testing executed

### Fixed
- Multiple bug fixes and stability improvements

---

## [0.5.0] - 2026-03-15 (Alpha)

### Added
- Alpha release published
- Basic CRUD features implemented
- Simplified UI provided

---

## Upcoming Changes

### [1.1.0] - Planned for Q2 2026

#### Planned
- **Email integration:** Gmail and Outlook integration with automatic email logging
- **Calendar integration:** Google Calendar and Outlook Calendar integration
- **Mobile improvements:** Improved mobile web UX
- **Advanced reports:** Custom report builder
- **Data export:** Export with advanced filtering

### [2.0.0] - Planned for Q3 2026

#### Planned
- **Team collaboration:** Member management, permissions, assignment, and mentions
- **Web forms and lead capture:** Website-integrated lead capture forms
- **Automation (Workflow):** Rule-based automated task setup
- **Public API:** Public API for external integrations
- **Webhook:** Real-time event notifications
- **Multilingual support:** English UI support

### [2.1.0] - Planned for Q4 2026

#### Planned
- **Mobile apps:** Native iOS and Android apps
- **Offline support:** Offline mode and synchronization
- **Voice recognition:** Record activities by voice
- **AI coaching:** Personalized sales coaching features

---

## Versioning Rules

### Semantic Versioning

```text
[MAJOR].[MINOR].[PATCH]
```

| Version | Description | Example |
|---------|-------------|---------|
| **MAJOR** | Backward-incompatible changes | 1.0.0 → 2.0.0 |
| **MINOR** | Backward-compatible feature additions | 1.0.0 → 1.1.0 |
| **PATCH** | Backward-compatible bug fixes | 1.0.0 → 1.0.1 |

### Category Definitions

| Category | Description |
|----------|-------------|
| **Added** | New functionality added |
| **Changed** | Changes to existing functionality |
| **Deprecated** | Functionality to be removed soon |
| **Removed** | Removed functionality |
| **Fixed** | Bug fixes |
| **Security** | Security-related fixes |

---

## References

- [VIVE CRM Roadmap](./00-Planning/Service-Planning-Document.md)
- [Detailed Release Notes](./06-Deployment/Deployment-Plan.md)
- [API Change History](./API-Integration-Guide.md)

---

**VIVE CRM**  
Continuously improving for better sales management.
