# CRM Service 기능 정리 (구현 기준)

## 개요

이 문서는 현재 `crm-service` 코드 구현 기준으로 제공되는 주요 기능을 정리한 문서입니다.  
문서 기준/기획 문서의 표현이 일부 달라도, 실제 운영 기준은 API 구현을 기준으로 판단합니다.

**현재 버전**: v0.1.4 (2026-02-26)

## 1. 핵심 서비스 범위

- 백엔드 API 버전: `v1`
- 프레임워크: Hono + TypeScript + Prisma + PostgreSQL
- 인증 방식: JWT
- 기본 라우트: `/api/v1/*`
- 공개 헬스체크: `/healthz`, `/api/v1/health`
- 서비스 루트/문서 노출: `/`, `/api/v1`, `/docs`, `/docs/openapi.yaml`

## 2. 인증/계정

### 기능
- 회원가입 (email, password, name, company)
- 로그인(토큰 발급)
- 프로필 수정 (PATCH /auth/me)
- 토큰 기반 인증 미들웨어를 통한 보호 라우트 접근 제어

### 동작
- `Authorization` 기반 인증이 필요한 엔드포인트가 분리됨
- 인증 경로(`GET /`, `POST /api/v1/auth/register`, `POST /api/v1/auth/login`)는 공개 처리
- 사용자 식별 기준으로 리소스 접근 제한(소유권 검증) 적용
- 비밀번호 정책: 영문+숫자+특수문자 각 1자 이상 (v0.1.3+)

## 3. 연락처(Contacts) 관리

- 연락처 생성/조회/수정/삭제 (소프트 삭제)
- 연락처 단건/목록 조회 (페이지네이션, 검색, 필터링)
- 확장 속성: source, tags, memo, jobTitle, lastContactAt
- CSV 일괄 등록 (POST /contacts/import)
- 이메일/전화번호 중복 검사
- 고객 100명 제한 (묣료 플랜)
- 복구 API (POST /contacts/:id/restore)

## 4. 딜(Deal, 영업기회) 관리

- 딜 생성/조회/수정/삭제
- 파이프라인/단계(Stage) 관리 기반 구조 (LEAD → QUALIFIED → PROPOSAL → NEGOTIATION → WON/LOST)
- `Contact`와 연계된 영업기회 추적
- 금액/확률/예상 마감일 등 기본 영업 정보 관리
- 칸반 보드 API (GET /deals/pipeline)
- 단계 이동 시 이력 자동 기록 (DealStageHistory)
- 복구 API (POST /deals/:id/restore)

## 5. 활동(Activity) 관리

- 활동 생성/조회/수정/삭제
- 특정 연락처/딜 맥락에서의 이력 추적
- 활동 메모/타입 기반 데이터 기록 (NOTE, CALL, EMAIL, MEETING)
- 활동 등록 시 lastContactAt 자동 갱신
- 고객 등록 시 "등록" 활동 자동 기록

## 6. 작업(Task) 관리

- 작업 생성/조회/수정/삭제
- 작업 완료 처리(완료 상태 토글)
- 연락처/딜 연계 기반 업무 할당/추적
- 우선순위(높음/중간/낮음) 및 마감일 관리
- 마감일 기반 알림 자동 생성
- 복구 API (POST /tasks/:id/restore)

## 7. 대시보드/통계

- `/api/v1/dashboard/summary`
  - totalContacts, totalDeals, wonDeals, openTasks
  - newContactsThisWeek, todayRecommendationsCount
- `/api/v1/dashboard/pipeline-stats`
- `/api/v1/dashboard/activities` (최근 활동)
- 월간/주간 리포트 성격의 조회 API 기반 집계(리포트 모듈)

## 8. AI 관련 기능

- 리드 스코어 조회 API (GET /ai/lead-score/:contactId)
- 리드 스코어 재계산 (POST /ai/rescore/:contactId)
- 추천 액션/다음 단계 제안 API
  - GET /ai/recommendations
  - GET /ai/recommendations/today
  - GET /ai/recommendations/:contactId
- 기존 데이터 기반의 부가 분석 API
- A/B/C/D 등급 자동 산정 (A≥80, B 60-79, C 40-59, D<40)

## 9. 알림(Notification)

- 인앱 알림 시스템
- 작업 마감일 알림 자동 생성
- 알림 목록 조회 (읽음/안읽음 필터)
- 일괄 읽음 처리

## 10. 리포트

- 주간/월간 리포트 (GET /reports/weekly, /reports/monthly)
- 활동 통계 (GET /reports/activities)
- 성공률, 파이프라인 변화, 리드 스코어 분포
- CSV Export (501 - 의도적 미구현)

## 11. 운영/문서/품질 관련 기능

- OpenAPI v1 문서 제공
  - `docs/openapi-v1.yaml`
  - `/docs/openapi.yaml` 노출
  - `/docs`(ReDoc) 제공
- Postman 생성 스크립트
  - `npm run postman:generate`
  - `docs/postman/*.json` 활용
- 계약 검증
  - `npm run contract:audit`
- 공통 미들웨어
  - 에러 응답 표준화
  - 요청 ID/감사 로그/레이트리밋 등의 운영성 기능

## 12. 배포/실행 관련

- 환경 변수 기반 실행
- 로컬/운영 템플릿 분리
  - `.env.local`용: `.env.local.example`
  - `.env.production`용: `.env.production.example`
- Docker 미사용 `localhost` 실행 가이드 정렬

## 13. 품질 보증 포인트

- 헬스체크 API 응답(`200`) 기준으로 서비스 기동 확인
- OpenAPI 경로와 실제 라우트 정합 검사
- 단위/통합 테스트 83개 (100% 통과)
  - auth: 13개
  - contacts: 15개
  - tasks: 18개
  - notifications: 8개
  - lib/leadScore: 17개
  - etc: 12개

## 14. 구현 완료 기능 요약 (v0.1.4 기준)

### ✅ P1 (핵심 우선순위) - 전체 구현 완료

| 기능 | 구현 여부 | 비고 |
|------|----------|------|
| 사용자 권한 제어(RBAC) | ✅ | USER/ADMIN 역할 구분, 관리자 API |
| Refresh Token + 갱신 토큰 회전 | ✅ | 구현 완료 |
| Soft Delete + 복구 API | ✅ | contacts, deals, tasks 모두 지원 |
| 로그인 실패/권한 위반 감사 로그 | ✅ | AuditLog 모델 + 미들웨어 |
| Contact 스키마 확장 | ✅ | source, tags, memo, jobTitle, lastContactAt |
| PATCH /auth/me | ✅ | 프로필 수정 |
| POST /contacts/import | ✅ | CSV 일괄 등록 |
| GET /deals/pipeline | ✅ | 칸반 형태 응답 |
| Tasks CRUD | ✅ | GET/PATCH/DELETE /tasks/:id |
| AI 추천 API | ✅ | /ai/recommendations, /today |
| 리드 스코어 등급 | ✅ | A/B/C/D 자동 산정 |
| 비밀번호 정책 | ✅ | 영문+숫자+특수문자 (v0.1.3) |
| 고객 100명 제한 | ✅ | 무료 플랜 제한 (v0.1.3) |

### P2 (차기 릴리즈)

| 기능 | 구현 여부 | 비고 |
|------|----------|------|
| 통합 검색 및 필터 성능 강화 | ⚠️ | 기본 검색은 구현, 고급 검색 미구현 |
| CSV/엑셀 대량 Import/Export | ⚠️ | Import 구현, Export 미구현 |
| 작업/딜 기한 알림(이메일/웹훅) | ⚠️ | 인앱 알림 구현, 이메일 미구현 |
| `/api/v1/health/ready`, `/api/v1/health/live`, `/api/v1/metrics` | ❌ | 미구현 |

### P3 (중장기)

| 기능 | 구현 여부 | 비고 |
|------|----------|------|
| 리드 스테이지 자동 전환 규칙 | ❌ | 미구현 |
| 조직 단위(멀티테넌트) | ❌ | 미구현 |
| 협업 메모/코멘트/태그 기능 | ❌ | 기본 태그는 구현, 협업 기능 미구현 |
| 대시보드 지표 고도화 | ⚠️ | 기본 지표 구현, 고급 분석 미구현 |

---

**마지막 업데이트**: 2026-02-26  
**문서 버전**: v0.1.4
