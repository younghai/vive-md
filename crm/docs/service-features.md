# CRM Service 기능 정리 (구현 기준)

## 개요

이 문서는 현재 `crm-service` 코드 구현 기준으로 제공되는 주요 기능을 정리한 문서입니다.  
문서 기준/기획 문서의 표현이 일부 달라도, 실제 운영 기준은 API 구현을 기준으로 판단합니다.

## 1. 핵심 서비스 범위

- 백엔드 API 버전: `v1`
- 프레임워크: Hono + TypeScript + Prisma + PostgreSQL
- 인증 방식: JWT
- 기본 라우트: `/api/v1/*`
- 공개 헬스체크: `/healthz`, `/api/v1/health`
- 서비스 루트/문서 노출: `/`, `/api/v1`, `/docs`, `/docs/openapi.yaml`

## 2. 인증/계정

### 기능
- 회원가입
- 로그인(토큰 발급)
- 토큰 기반 인증 미들웨어를 통한 보호 라우트 접근 제어

### 동작
- `Authorization` 기반 인증이 필요한 엔드포인트가 분리됨
- 인증 경로(`GET /`, `POST /api/v1/auth/register`, `POST /api/v1/auth/login`)는 공개 처리
- 사용자 식별 기준으로 리소스 접근 제한(소유권 검증) 적용

## 3. 연락처(Contacts) 관리

- 연락처 생성/조회/수정/삭제
- 연락처 단건/목록 조회
- 기본 속성(이름, 연락처, 회사 정보 등) 및 상태 기반 관리
- 사용자의 소유 데이터 단위로 접근 제어

## 4. 딜(Deal, 영업기회) 관리

- 딜 생성/조회/수정/삭제
- 파이프라인/단계(Stage) 관리 기반 구조
- `Contact`와 연계된 영업기회 추적
- 금액/확률/예상 마감일 등 기본 영업 정보 관리

## 5. 활동(Activity) 관리

- 활동 생성/조회/수정/삭제
- 특정 연락처/딜 맥락에서의 이력 추적
- 활동 메모/타입 기반 데이터 기록

## 6. 작업(Task) 관리

- 작업 생성/조회/수정/삭제
- 작업 완료 처리(완료 상태 토글)
- 연락처/딜 연계 기반 업무 할당/추적

## 7. 대시보드/통계

- `/api/v1/dashboard/summary`
- `/api/v1/dashboard/pipeline-stats`
- 월간/주간 리포트 성격의 조회 API 기반 집계(리포트 모듈)

## 8. AI 관련 기능

- 리드 스코어 조회 API
- 추천 액션/다음 단계 제안 API
- 기존 데이터 기반의 부가 분석 API

## 9. 운영/문서/품질 관련 기능

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

## 10. 배포/실행 관련

- 환경 변수 기반 실행
- 로컬/운영 템플릿 분리
  - `.env.local`용: `.env.local.example`
  - `.env.production`용: `.env.production.example`
- Docker 미사용 `localhost` 실행 가이드 정렬

## 11. 품질 보증 포인트

- 헬스체크 API 응답(`200`) 기준으로 서비스 기동 확인
- OpenAPI 경로와 실제 라우트 정합 검사
- 기본 단위/계약 테스트 유지

## 12. 추가 제안 기능 (우선순위)

### P1 (핵심 우선순위)

- 사용자 권한 제어(RBAC) 도입
  - 난이도: 중간
- Refresh Token + 갱신 토큰 회전
  - 난이도: 중간
- Soft Delete + 복구 API(`deletedAt`) 추가
  - 난이도: 낮음
- 로그인 실패/권한 위반/중요 변경 감사 로그 분류 보강
  - 난이도: 낮음

#### 구현 반영 상태(요청 기반)
- ✅ Access Token 권한 즉시 반영: 인증 미들웨어에서 DB 최신 `role`로 재확인
- ✅ 관리자 역할 관리 API 구현:
  - `GET /api/v1/auth/admin/users`
  - `PATCH /api/v1/auth/admin/users/:id/role`
- ✅ Soft Delete 복구 API 구현:
  - `POST /api/v1/contacts/:id/restore`
  - `POST /api/v1/deals/:id/restore`
  - `POST /api/v1/tasks/:id/restore`

### P2 (차기 릴리즈)

- 통합 검색 및 필터 성능 강화(이름/이메일/전화/회사 인덱스)
  - 난이도: 중간
- CSV/엑셀 대량 Import/Export
  - 난이도: 중간~높음
- 작업/딜 기한 알림(이메일/웹훅)
  - 난이도: 높음
- `/api/v1/health/ready`, `/api/v1/health/live`, `/api/v1/metrics`
  - 난이도: 낮음

### P3 (중장기)

- 리드 스테이지 자동 전환 규칙(워크플로우 기반)
  - 난이도: 중간
- 조직 단위(멀티테넌트) 및 조직 간 데이터 분리
  - 난이도: 높음
- 협업 메모/코멘트/태그 기능
  - 난이도: 중간
- 대시보드 지표 고도화(전월 대비/목표 대비)
  - 난이도: 중간
