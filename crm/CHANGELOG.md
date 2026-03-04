# Changelog

## Release Tags

- Tag format: `vMAJOR.MINOR.PATCH`
- Current release tag: `v0.1.4`
- Example:
  - `git tag -a v0.1.4 -m "release: v0.1.4"`
  - `git push origin v0.1.4`

---

## 0.1.4 - 2026-02-26

### Added (테스트 커버리지 확보 및 OpenAPI 완성)

- **테스트**: `lib/leadScore` 단위 테스트 17개 (scoreToGrade, calculateLeadScore 경계값 포함)
- **테스트**: `auth` 라우트 통합 테스트 13개 (register 검증/중복/성공, login, me, PATCH /me)
- **테스트**: `contacts` 라우트 통합 테스트 15개 (목록, 생성/중복/한도, 단건/권한, 삭제)
- **테스트**: `tasks` 라우트 통합 테스트 18개 (CRUD + complete + 알림 자동생성)
- **테스트**: `notifications` 라우트 통합 테스트 8개 (목록, 읽음처리, 전체읽음)
- **OpenAPI**: `PATCH /auth/me`, `GET|PATCH|DELETE /tasks/{id}`, `POST /contacts/import` 경로 추가
- **OpenAPI**: `POST /ai/rescore/{contactId}`, `GET /ai/recommendations`, `GET /ai/recommendations/today` 경로 추가
- **OpenAPI**: `GET|PATCH /notifications/*` 3개 경로 추가
- **OpenAPI**: `GET /dashboard/activities`, `GET /reports/activities` 경로 추가
- **OpenAPI**: `Notification` 스키마, `DashboardSummary` 신규 필드(`newContactsThisWeek`, `todayRecommendationsCount`) 추가

### Stats

- 총 테스트: 83개 (11 파일) — 전부 통과
- Contract audit: Documented 46 / Implemented 51 — 통과

---

## 0.1.3 - 2026-02-26

### Added (P2 미구현 항목 구현)

- **대시보드**: `newContactsThisWeek`, `todayRecommendationsCount` summary 지표
- **GET /dashboard/activities**: 최근 활동 목록 (limit 파라미터)
- **GET /reports/activities**: 활동 통계 (유형별 건수)
- **리포트**: weekly/monthly에 `successRate`, `pipelineStageChanges`, `leadScoreDistribution` 추가
- **Deal**: `description`, `actualCloseDate` 스키마·API. WON/LOST 전환 시 actualCloseDate 자동 기록
- **고객 100명 제한 (BR-002-03)**: create·import 시 422 응답
- **비밀번호 정책**: 영문+숫자+특수문자 각 1자 이상 검증 (회원가입)
- **Notification 모델**: 인앱 알림. 작업 생성 시 dueDate 있으면 알림 자동 생성
- **GET /notifications**: 알림 목록 (unreadOnly)
- **PATCH /notifications/:id/read**, **PATCH /notifications/read-all**
- **AuditLog 모델 + 미들웨어**: API 요청 전수 기록 (NFR-005)

### Migration

`npx prisma migrate dev --name add_notification_audit_deal_fields` 또는 `npx prisma db push`

---

## 0.1.2 - 2026-02-26

### Added (P1 우선 적용 + 비즈니스 로직)

- **Prisma 스키마**: Contact에 `source`, `tags`, `memo`, `jobTitle`, `lastContactAt` 추가. User에 `company`, LeadScore에 `grade` 추가.
- **PATCH /api/v1/auth/me**: 프로필 수정 (name, company). 회원가입 시 `company` 선택 입력.
- **POST /api/v1/contacts/import**: CSV 일괄 등록 (Content-Type: text/csv).
- **GET /api/v1/deals/pipeline**: 칸반 형식 응답 (stages + deals 배열, summary).
- **Tasks CRUD**: GET/PATCH/DELETE `/api/v1/tasks/:id` 구현.
- **AI**: GET `/api/v1/ai/recommendations`, GET `/api/v1/ai/recommendations/today`, POST `/api/v1/ai/rescore/:contactId`.
- **리드 스코어**: A/B/C/D 등급 자동 산정 (SRS 기준).
- **고객 등록 시**: AI 리드 스코어 자동 계산, 타임라인 "등록" 활동 자동 기록.
- **활동 등록 시**: Contact `lastContactAt` 자동 갱신.
- **이메일/전화번호 중복 검사**: 연락처 생성·수정 시 (동일 사용자 내).

### Changed

- 고객 PATCH 시 리드 스코어 자동 재계산.
- AI lead-score 엔드포인트가 `recalcAndSaveLeadScore` 사용, grade 반환.

### Migration

DB 스키마 변경 적용: `npx prisma migrate dev --name add_contact_user_leadscore_fields` 또는 `npx prisma db push`

---

## 0.1.1 - 2026-02-26

### Added

- Added OpenAPI path for `GET /api/v1/reports/weekly-export` with `501` response.
- Added Postman collection generator script: `scripts/generate-postman.ts`.
- Added Postman local environment file: `docs/postman/crm-local.postman_environment.json`.
- Added CI workflow to run `npm test` and `npm run contract:audit` on push/PR.

### Changed

- Fixed route contract normalization for dynamic paths (`{id}` vs `:id`) in tests.
- Improved `GET /api/v1/auth/me` to return `401` when auth context is missing.
- Fixed `scripts/contract-audit.ts` path resolution for app import.
- Updated JWT utility imports for ESM compatibility (`jsonwebtoken` default import).
- Filtered middleware-only `ALL` routes in contract audit output.
- Added `npm run build` step to CI verification job.
