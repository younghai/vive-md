# API 설계서

| 항목 | 내용 |
|------|------|
| **프로젝트명** | VIVE CRM |
| **문서 버전** | v1.0 |
| **작성일** | 2026-02-24 |
| **작성자** | 권영해 / 기획·개발 |
| **승인자** | 권영해 / 프로젝트 오너 |
| **문서 상태** | 초안 |

---

> **용어 규칙:** 본 문서는 [`용어규칙.md`](../01-요구사항분석/용어규칙.md)의 표기 원칙과 용어 사전을 준수한다. 새로운 용어 사용 시 반드시 해당 문서에 먼저 등록한다.

---

## 1. API 설계 원칙

### 1.1 RESTful 설계 규칙

| 규칙 | 설명 | 예시 |
|------|------|------|
| 자원 중심 URL | URL은 자원(명사)을 표현, 행위(동사)는 HTTP Method로 표현 | `GET /contacts` (O), `GET /getContacts` (X) |
| 복수형 사용 | 컬렉션 자원은 복수형 | `/contacts`, `/deals`, `/tasks` |
| 소문자 + 하이픈 | URL 경로는 소문자, 단어 구분은 하이픈(-) | `/lead-scores` (O), `/leadScores` (X) |
| 계층 관계 표현 | 부모-자식 관계는 경로로 표현 | `/contacts/{id}/activities` |
| 필터/정렬/페이징 | Query Parameter 사용 | `?status=active&sort=createdAt&order=desc` |
| 행위 자원 | 동사가 필요한 경우 명시적으로 사용 | `POST /auth/logout`, `POST /auth/refresh` |
| 슬래시 규칙 | 후행 슬래시 미사용 | `/contacts` (O), `/contacts/` (X) |

### 1.2 버저닝 전략

| 항목 | 내용 |
|------|------|
| 방식 | URL Path 버저닝 |
| 현재 버전 | `v1` |
| URL 패턴 | `/api/v1/[resource]` |
| 하위 호환성 | Minor 변경은 동일 버전 유지, Breaking Change 시 버전 업 |
| 지원 정책 | 이전 버전은 6개월간 유지 후 Deprecated |

### 1.3 네이밍 규칙

| 대상 | 규칙 | 예시 |
|------|------|------|
| URL 경로 | kebab-case, 복수형 명사 | `/contacts`, `/deals`, `/lead-scores` |
| Query Parameter | camelCase | `?pageSize=20&sortBy=createdAt` |
| Request/Response Body | camelCase | `{ "firstName": "...", "createdAt": "..." }` |
| Header | 표준 헤더 규칙 | `Authorization`, `Content-Type`, `X-Request-Id` |
| 에러 코드 | UPPER_SNAKE_CASE | `UNAUTHORIZED`, `VALIDATION_ERROR` |

---

## 2. 인증/인가

### 2.1 인증 방식

| 방식 | 용도 | 헤더 |
|------|------|------|
| Bearer Token (JWT) | 사용자 인증 (웹) | `Authorization: Bearer {access_token}` |
| Session Cookie | 웹 세션 유지 | 브라우저 쿠키 기반 |

### 2.2 JWT 토큰 구조

#### Access Token

| 항목 | 내용 |
|------|------|
| 알고리즘 | RS256 |
| 만료 시간 | 1시간 |
| Payload 필드 | `sub` (userId), `email`, `role`, `iat`, `exp` |

#### Refresh Token

| 항목 | 내용 |
|------|------|
| 저장 방식 | HttpOnly Secure Cookie |
| 만료 시간 | 14일 |
| 로테이션 | 사용 시 새 Refresh Token 발급 (Rotation 정책 적용) |
| 무효화 | 로그아웃 시 서버측 블랙리스트 등록 |

### 2.3 인가 (Authorization)

| 역할 | 코드 | 접근 가능 자원 | 설명 |
|------|------|---------------|------|
| 일반 사용자 | `USER` | 자신의 고객, 딜, 활동 | 일반 영업 사용자 |
| 관리자 | `ADMIN` | 모든 자원 + 사용자 관리 | 시스템 관리자 |

---

## 3. 공통 규격

### 3.1 요청 포맷

#### 공통 요청 헤더

| 헤더 | 필수 | 설명 | 예시 |
|------|------|------|------|
| `Content-Type` | 필수 (Body 있을 때) | 요청 본문 형식 | `application/json` |
| `Authorization` | 조걶 | 인증 토큰 | `Bearer eyJhbGci...` |
| `Accept` | 선택 | 응답 형식 | `application/json` |
| `X-Request-Id` | 선택 | 요청 추적 ID | `550e8400-e29b-41d4-...` |

### 3.2 응답 포맷

#### 단일 자원 응답

```json
{
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "email": "user@example.com",
    "name": "홍길동",
    "role": "USER",
    "createdAt": "2026-02-24T09:30:00Z",
    "updatedAt": "2026-02-24T09:30:00Z"
  }
}
```

#### 목록 응답 (페이지네이션)

```json
{
  "data": [
    { "id": "...", "name": "...", "createdAt": "..." },
    { "id": "...", "name": "...", "createdAt": "..." }
  ],
  "pagination": {
    "page": 1,
    "pageSize": 20,
    "totalItems": 150,
    "totalPages": 8,
    "hasNext": true,
    "hasPrevious": false
  }
}
```

#### 페이지네이션 요청 파라미터

| 파라미터 | 타입 | 기본값 | 설명 |
|----------|------|--------|------|
| `page` | integer | 1 | 현재 페이지 (1부터 시작) |
| `pageSize` | integer | 20 | 페이지당 항목 수 (최대 100) |
| `sort` | string | `createdAt` | 정렬 기준 필드 |
| `order` | string | `desc` | 정렬 방향 (`asc` / `desc`) |

### 3.3 에러 응답 포맷

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "입력값이 올바르지 않습니다",
    "details": [
      {
        "field": "email",
        "message": "유효한 이메일 형식이 아닙니다",
        "value": "invalid-email"
      }
    ],
    "timestamp": "2026-02-24T09:30:00Z",
    "path": "/api/v1/contacts",
    "requestId": "550e8400-e29b-41d4-a716-446655440000"
  }
}
```

### 3.4 HTTP 상태 코드 사용 규칙

| 상태 코드 | 의미 | 사용 상황 |
|-----------|------|-----------|
| `200 OK` | 성공 | GET 조회 성공, PUT/PATCH 수정 성공 |
| `201 Created` | 생성 성공 | POST로 자원 생성 성공 |
| `204 No Content` | 성공 (응답 본문 없음) | DELETE 삭제 성공, 로그아웃 성공 |
| `400 Bad Request` | 잘못된 요청 | 유효성 검증 실패, 잘못된 파라미터 |
| `401 Unauthorized` | 인증 필요 | 토큰 없음, 토큰 만료 |
| `403 Forbidden` | 권한 없음 | 인증은 되었으나 접근 권한 부족 |
| `404 Not Found` | 자원 없음 | 요청한 자원이 존재하지 않음 |
| `409 Conflict` | 충돌 | 중복 데이터 (이메일 중복 등) |
| `422 Unprocessable Entity` | 처리 불가 | 비즈니스 규칙 위반 (고객 수 초과 등) |
| `429 Too Many Requests` | 요청 초과 | Rate Limit 초과 |
| `500 Internal Server Error` | 서버 오류 | 예상치 못한 서버 오류 |
| `503 Service Unavailable` | 서비스 불가 | 서버 점검, 과부하 |

---

## 4. API 엔드포인트 목록

### 4.1 인증 API (Auth)

| Method | URL | 설명 | 인증 | 성공 코드 |
|--------|-----|------|------|-----------|
| POST | `/api/v1/auth/register` | 회원가입 | 불필요 | 201 |
| POST | `/api/v1/auth/login` | 로그인 | 불필요 | 200 |
| POST | `/api/v1/auth/logout` | 로그아웃 | Bearer | 204 |
| POST | `/api/v1/auth/refresh` | 토큰 갱신 | Refresh Token | 200 |
| GET | `/api/v1/auth/me` | 내 정보 조회 | Bearer | 200 |
| PATCH | `/api/v1/auth/me` | 내 정보 수정 | Bearer | 200 |

### 4.2 고객 API (Contacts)

| Method | URL | 설명 | 인증 | 성공 코드 |
|--------|-----|------|------|-----------|
| GET | `/api/v1/contacts` | 고객 목록 조회 | Bearer | 200 |
| POST | `/api/v1/contacts` | 고객 등록 | Bearer | 201 |
| GET | `/api/v1/contacts/{id}` | 고객 상세 조회 | Bearer | 200 |
| PATCH | `/api/v1/contacts/{id}` | 고객 수정 | Bearer | 200 |
| DELETE | `/api/v1/contacts/{id}` | 고객 삭제 | Bearer | 200 |
| GET | `/api/v1/contacts/{id}/activities` | 고객 활동 조회 | Bearer | 200 |
| POST | `/api/v1/contacts/{id}/activities` | 고객 활동 등록 | Bearer | 201 |
| POST | `/api/v1/contacts/import` | CSV 일괄 등록 | Bearer | 200 |

### 4.3 딜 API (Deals)

| Method | URL | 설명 | 인증 | 성공 코드 |
|--------|-----|------|------|-----------|
| GET | `/api/v1/deals` | 딜 목록 조회 | Bearer | 200 |
| POST | `/api/v1/deals` | 딜 등록 | Bearer | 201 |
| GET | `/api/v1/deals/{id}` | 딜 상세 조회 | Bearer | 200 |
| PATCH | `/api/v1/deals/{id}` | 딜 수정 | Bearer | 200 |
| DELETE | `/api/v1/deals/{id}` | 딜 삭제 | Bearer | 200 |
| PATCH | `/api/v1/deals/{id}/stage` | 스테이지 이동 | Bearer | 200 |
| GET | `/api/v1/deals/pipeline` | 파이프라인 보드 데이터 | Bearer | 200 |

### 4.4 AI 기능 API (AI)

| Method | URL | 설명 | 인증 | 성공 코드 |
|--------|-----|------|------|-----------|
| GET | `/api/v1/ai/contacts/{id}/lead-score` | 리드 스코어 조회 | Bearer | 200 |
| POST | `/api/v1/ai/contacts/{id}/rescore` | 리드 스코어 재계산 | Bearer | 200 |
| GET | `/api/v1/ai/recommendations` | 다음 행동 추천 목록 | Bearer | 200 |
| GET | `/api/v1/ai/recommendations/today` | 오늘의 추천 행동 | Bearer | 200 |

### 4.5 작업 API (Tasks)

| Method | URL | 설명 | 인증 | 성공 코드 |
|--------|-----|------|------|-----------|
| GET | `/api/v1/tasks` | 작업 목록 조회 | Bearer | 200 |
| POST | `/api/v1/tasks` | 작업 등록 | Bearer | 201 |
| GET | `/api/v1/tasks/{id}` | 작업 상세 조회 | Bearer | 200 |
| PATCH | `/api/v1/tasks/{id}` | 작업 수정 | Bearer | 200 |
| DELETE | `/api/v1/tasks/{id}` | 작업 삭제 | Bearer | 200 |
| PATCH | `/api/v1/tasks/{id}/complete` | 작업 완료 처리 | Bearer | 200 |

### 4.6 대시보드 API (Dashboard)

| Method | URL | 설명 | 인증 | 성공 코드 |
|--------|-----|------|------|-----------|
| GET | `/api/v1/dashboard/summary` | 대시보드 요약 데이터 | Bearer | 200 |
| GET | `/api/v1/dashboard/pipeline-stats` | 파이프라인 통계 | Bearer | 200 |
| GET | `/api/v1/dashboard/activities` | 최근 활동 | Bearer | 200 |

### 4.7 리포트 API (Reports)

| Method | URL | 설명 | 인증 | 성공 코드 |
|--------|-----|------|------|-----------|
| GET | `/api/v1/reports/weekly` | 주간 리포트 | Bearer | 200 |
| GET | `/api/v1/reports/monthly` | 월간 리포트 | Bearer | 200 |
| GET | `/api/v1/reports/activities` | 활동 통계 | Bearer | 200 |

---

## 5. API 상세 명세

### 5.1 POST /api/v1/auth/register - 회원가입

| 항목 | 내용 |
|------|------|
| **URL** | `/api/v1/auth/register` |
| **Method** | POST |
| **인증** | 불필요 |
| **설명** | 이메일과 비밀번호로 회원가입을 처리한다. |

#### Request Body

```json
{
  "email": "user@example.com",
  "password": "SecurePass123!",
  "name": "홍길동",
  "company": "ABC Corp"
}
```

#### Response Body - 성공 (201 Created)

```json
{
  "data": {
    "accessToken": "eyJhbGciOiJSUzI1NiIs...",
    "tokenType": "Bearer",
    "expiresIn": 3600,
    "user": {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "email": "user@example.com",
      "name": "홍길동",
      "role": "USER"
    }
  }
}
```

---

### 5.2 POST /api/v1/contacts - 고객 등록

| 항목 | 내용 |
|------|------|
| **URL** | `/api/v1/contacts` |
| **Method** | POST |
| **인증** | Bearer Token |
| **설명** | 새로운 고객을 등록하고 AI 리드 스코어를 자동 계산한다. |

#### Request Body

```json
{
  "name": "김철수",
  "email": "kim@company.com",
  "phone": "010-1234-5678",
  "company": "XYZ Inc",
  "jobTitle": "구매 담당자",
  "source": "website",
  "tags": ["B2B", "제조업"],
  "memo": "2월에 문의, 3월 견적 예정"
}
```

#### Response Body - 성공 (201 Created)

```json
{
  "data": {
    "id": "contact-uuid",
    "name": "김철수",
    "email": "kim@company.com",
    "phone": "010-1234-5678",
    "company": "XYZ Inc",
    "leadScore": 78,
    "leadGrade": "B",
    "createdAt": "2026-02-24T09:30:00Z"
  }
}
```

---

### 5.3 GET /api/v1/deals/pipeline - 파이프라인 보드

| 항목 | 내용 |
|------|------|
| **URL** | `/api/v1/deals/pipeline` |
| **Method** | GET |
| **인증** | Bearer Token |
| **설명** | 칸반 보드 형태로 파이프라인 데이터를 제공한다. |

#### Response Body - 성공 (200 OK)

```json
{
  "data": {
    "stages": [
      {
        "id": "lead",
        "name": "리드",
        "deals": [
          {
            "id": "deal-1",
            "title": "XYZ社 システム導入",
            "amount": 50000000,
            "contact": { "id": "c-1", "name": "김철수" },
            "probability": 20
          }
        ]
      },
      {
        "id": "opportunity",
        "name": "기회",
        "deals": [...]
      },
      {
        "id": "proposal",
        "name": "제안",
        "deals": [...]
      },
      {
        "id": "negotiation",
        "name": "협상",
        "deals": [...]
      }
    ],
    "summary": {
      "totalDeals": 15,
      "totalAmount": 250000000,
      "weightedAmount": 125000000
    }
  }
}
```

---

### 5.4 GET /api/v1/ai/recommendations/today - 오늘의 추천

| 항목 | 내용 |
|------|------|
| **URL** | `/api/v1/ai/recommendations/today` |
| **Method** | GET |
| **인증** | Bearer Token |
| **설명** | AI가 추천하는 오늘 우선순위 행동 목록을 제공한다. |

#### Response Body - 성공 (200 OK)

```json
{
  "data": {
    "recommendations": [
      {
        "id": "rec-1",
        "priority": 1,
        "actionType": "phone",
        "actionLabel": "전화 연락",
        "contact": { "id": "c-1", "name": "김철수", "company": "XYZ Inc" },
        "reason": "3일 전 이메일 발송, 아직 확인하지 않음. A등급 리드.",
        "suggestedTime": "오후 2시",
        "leadScore": 85
      },
      {
        "id": "rec-2",
        "priority": 2,
        "actionType": "email",
        "actionLabel": "이메일 발송",
        "contact": { "id": "c-2", "name": "박영희", "company": "ABC Corp" },
        "reason": "제안서 발송 후 1주일, 피드백 확인 필요.",
        "suggestedTime": "오전 10시",
        "leadScore": 72
      }
    ],
    "totalCount": 5
  }
}
```

---

## 6. 에러 코드 테이블

### 6.1 인증/인가 에러

| 에러 코드 | HTTP 상태 | 메시지 | 설명 | 대응 방안 |
|-----------|-----------|--------|------|-----------|
| `UNAUTHORIZED` | 401 | 인증이 필요합니다 | 토큰 없음 또는 만료 | 로그인 또는 토큰 갱신 |
| `FORBIDDEN` | 403 | 접근 권한이 없습니다 | 권한 부족 | 관리자에게 문의 |
| `INVALID_CREDENTIALS` | 401 | 이메일 또는 비밀번호가 일치하지 않습니다 | 로그인 실패 | 재입력 |
| `EMAIL_ALREADY_EXISTS` | 409 | 이미 등록된 이메일입니다 | 중복 가입 | 로그인 유도 |

### 6.2 유효성 검증 에러

| 에러 코드 | HTTP 상태 | 메시지 | 설명 | 대응 방안 |
|-----------|-----------|--------|------|-----------|
| `VALIDATION_ERROR` | 400 | 입력값이 올바르지 않습니다 | 필드 검증 실패 | details 확인 |
| `MISSING_REQUIRED_FIELD` | 400 | 필수 필드가 누락되었습니다 | 필수 값 미입력 | 필수 필드 입력 |
| `INVALID_FORMAT` | 400 | 입력 형식이 올바르지 않습니다 | 형식 불일치 | 올바른 형식으로 재입력 |

### 6.3 비즈니스 로직 에러

| 에러 코드 | HTTP 상태 | 메시지 | 설명 | 대응 방안 |
|-----------|-----------|--------|------|-----------|
| `CONTACT_LIMIT_EXCEEDED` | 422 | 무료 고객 등록 한도를 초과했습니다 | 100명 초과 | Pro 업그레이드 안내 |
| `RESOURCE_NOT_FOUND` | 404 | 요청한 자원을 찾을 수 없습니다 | 존재하지 않는 ID | ID 확인 |
| `INVALID_STAGE_TRANSITION` | 422 | 잘못된 단계 이동입니다 | 파이프라인 역행 시도 | 올바른 순서로 이동 |

### 6.4 시스템 에러

| 에러 코드 | HTTP 상태 | 메시지 | 설명 | 대응 방안 |
|-----------|-----------|--------|------|-----------|
| `INTERNAL_SERVER_ERROR` | 500 | 서버 내부 오류가 발생했습니다 | 예상치 못한 오류 | 잠시 후 재시도 |
| `SERVICE_UNAVAILABLE` | 503 | 서비스를 일시적으로 사용할 수 없습니다 | 서버 점검/과부하 | 잠시 후 재시도 |
| `RATE_LIMIT_EXCEEDED` | 429 | 요청 횟수가 초과되었습니다 | Rate Limit 초과 | 잠시 후 재시도 |

---

## 7. Rate Limiting 정책

### 7.1 전체 정책

| 항목 | 내용 |
|------|------|
| 적용 위치 | API Gateway (미들웨어) |
| 식별 기준 | User ID (인증 사용자) |
| 응답 헤더 | `X-RateLimit-Limit`, `X-RateLimit-Remaining`, `X-RateLimit-Reset` |
| 초과 시 응답 | `429 Too Many Requests` |
| 알고리즘 | Sliding Window |

### 7.2 사용자 등급별 제한

| 대상 | 무료 (Free) | Pro | 비고 |
|------|------------|-----|------|
| 전체 API (기본) | 100 req/min | 300 req/min | |
| AI 기능 | 50 req/day | 500 req/day | 리드 스코어, 추천 |
| CSV 임포트 | 1 req/day | 10 req/day | |

---

## 8. API 변경 관리

### 8.1 버저닝 정책

| 항목 | 내용 |
|------|------|
| 현재 버전 | `v1` |
| 버전 변경 기준 | Breaking Change 발생 시 Major 버전 증가 |
| Deprecation 기간 | 새 버전 릴리스 후 6개월 |
| Sunset 알림 | 헤더 `Sunset: [date]`, `Deprecation: true` |

### 8.2 Breaking Change 정의

| 변경 유형 | 예시 |
|-----------|------|
| 필드 삭제 | 기존 응답에서 필드 제거 |
| 필드 타입 변경 | string → integer |
| 필수 필드 추가 | 기존 선택 → 필수 |
| URL 변경 | 엔드포인트 경로 변경 |
| 에러 코드 변경 | 기존 에러 코드 변경/삭제 |

### 8.3 API 변경 로그

| 날짜 | 버전 | 변경 유형 | 변경 내용 | 영향 범위 |
|------|------|-----------|-----------|-----------|
| 2026-02-24 | v1 | 신규 | API 설계서 v1.0 초안 작성 | 전체 |

---

## 부록

### A. API 문서 자동화

| 항목 | 내용 |
|------|------|
| 도구 | OpenAPI 3.0 (Swagger) |
| 문서 URL | `/api-docs` |
| 스키마 파일 | `docs/openapi.yaml` |
| 자동 생성 | 코드 어노테이션 기반 자동 갱신 |

### B. 엔드포인트-요구사항 매핑

| 엔드포인트 | 관련 FR | 관련 UC | 관련 MVP |
|-----------|---------|---------|----------|
| `POST /auth/register` | FR-001 | UC-001 | MVP-007 |
| `POST /auth/login` | FR-001 | UC-001 | MVP-007 |
| `POST /contacts` | FR-002 | UC-002 | MVP-001 |
| `GET /contacts/{id}` | FR-002 | UC-002 | MVP-001 |
| `POST /deals` | FR-003 | UC-003 | MVP-002 |
| `GET /deals/pipeline` | FR-003 | UC-003 | MVP-002 |
| `GET /ai/contacts/{id}/lead-score` | FR-004 | UC-004 | MVP-003 |
| `GET /ai/recommendations/today` | FR-005 | UC-005 | MVP-004 |
| `POST /contacts/{id}/activities` | FR-006 | UC-006 | MVP-005 |
| `POST /tasks` | FR-007 | UC-007 | MVP-006 |
| `GET /dashboard/summary` | FR-008 | UC-008 | MVP-008 |
| `GET /reports/weekly` | FR-009 | UC-009 | MVP-009 |

### C. 참조 문서

| 문서 | 경로 |
|------|------|
| 서비스 기획서 | `docs/00-기획/서비스기획안.md` |
| 유스케이스 명세서 | `docs/01-요구사항분석/유스케이스명세서.md` |
| 요구사항 추적 매트릭스 (RTM) | `docs/01-요구사항분석/요구사항추적매트릭스-RTM.md` |
| 용어 규칙 | `docs/01-요구사항분석/용어규칙.md` |
