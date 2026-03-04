# Docs-Src 교차분석 제안서

> 문서(docs)와 소스(src) 구현을 교차 분석하여 발견된 문제점 및 추가 제안 사항

| 항목 | 내용 |
|------|------|
| **프로젝트명** | VIVE CRM |
| **분석일** | 2026-02-26 |
| **분석 범위** | docs/ 전체, src/ 구현 |
| **참조 문서** | SRS, UCS, RTM, API설계서, DB설계서, openapi-v1.yaml |

---

## 정합성 재검토 (2026-03-04)

아래 항목은 `apps/api` 소스 기준 재검토 결과이며, 본 문서의 2026-02-26 초기 분석 결과보다 우선합니다.

| 항목 | 초기 기록 | 재검토 결과 |
|------|-----------|-------------|
| PATCH `/api/v1/auth/me` | 미구현 | 구현됨 (`modules/auth`) |
| POST `/api/v1/contacts/import` | 미구현 | 구현됨 (`modules/contacts`) |
| Contacts 확장 필드(source/tags/memo/jobTitle) | 미지원 | 구현됨 (`modules/contacts`) |
| GET `/api/v1/deals/pipeline` | groupBy 통계만 | stages+deals+summary 형태 구현됨 (`modules/deals`) |
| GET `/api/v1/ai/recommendations` | 미구현 | 구현됨 (`modules/ai`) |
| GET `/api/v1/ai/recommendations/today` | 미구현 | 구현됨 (`modules/ai`) |
| GET `/api/v1/dashboard/activities` | 미구현 | 구현됨 (`modules/dashboard`) |
| GET `/api/v1/reports/activities` | 미구현 | 구현됨 (`modules/reports`) |
| GET/PATCH/DELETE `/api/v1/tasks/:id` | 미구현 | 구현됨 (`modules/tasks`) |
| 고객 수 100명 제한(BR-002-03) | 미구현 | 구현됨 (`modules/contacts`) |

재검토 후 남은 핵심 갭은 다음 3가지입니다.

1. OpenAPI와 일부 실제 경로 차이 (`/ai/rescore/:contactId` vs 문서 경로)
2. 인앱/이메일 알림의 운영 수준 고도화 (스케줄러, 전송 상태 추적)
3. NFR 품질 지표(SLI/SLO, 감사로그 범위, 커버리지 목표) 운영 문서화

---

## 1. 요약

| 구분 | 항목 수 | 비고 |
|------|---------|------|
| 문서-구현 불일치 | 18건 | 스키마, API, 비즈니스 로직 |
| 미구현 API/기능 | 12건 | 문서에 정의되었으나 구현 없음 |
| 우선 제안 (P1) | 8건 | 핵심 기능/데이터 정합성 |
| 권장 제안 (P2) | 10건 | 확장성·운영 요구사항 |
| 선택 제안 (P3) | 4건 | 개선 사항 |

---

## 2. 데이터 모델(Prisma) ↔ DB설계서 불일치

### 2.1 Contact 모델

| 필드 | DB설계서 | Prisma 현재 | 조치 제안 |
|------|----------|-------------|-----------|
| source | VARCHAR(50) | ❌ 없음 | 추가 (유입 경로: website, referral, ad 등) |
| tags | JSONB | ❌ 없음 | 추가 (태그 배열, 최대 10개) |
| memo | TEXT | ❌ 없음 | 추가 |
| jobTitle | VARCHAR(100) | ❌ 없음 | 추가 |
| lastContactAt | TIMESTAMP | ❌ 없음 | 추가 (활동 등록 시 자동 갱신) |
| leadGrade | S/A/B/C/D (SRS 기준) | HOT/WARM/COLD (enum) | SRS와 맞추어 A/B/C/D 로 정렬 권장 |

### 2.2 Deal 모델

| 필드 | DB설계서 | Prisma 현재 | 조치 제안 |
|------|----------|-------------|-----------|
| description | TEXT | ❌ 없음 | 추가 |
| isWon | BOOLEAN | ❌ 없음 | WON/LOST로 대체 가능하나, 집계 시 명시적 필드 권장 |
| actualCloseDate | DATE | ❌ 없음 | WON/LOST 전환 시 기록 |
| contactId | 필수 (FK) | 선택(optional) | SRS 기준 contactId 필수로 변경 권장 |
| stage | lead, opportunity, proposal, negotiation, closed_won, closed_lost | LEAD, QUALIFIED, PROPOSAL, NEGOTIATION, WON, LOST | 문서와 용어 정합 필요: `opportunity`↔`QUALIFIED` 매핑 또는 문서 수정 |

### 2.3 Activity 모델

| 필드 | DB설계서 | Prisma 현재 | 조치 제안 |
|------|----------|-------------|-----------|
| subject | VARCHAR(200) | title로 구현 | 문서와 매핑 관계만 명확히 하면 됨 |
| content | TEXT | note로 구현 | 동일 |
| activityAt | TIMESTAMP | performedAt | 동일 |
| type | call, email, meeting, note, **task**, **deal_stage** | NOTE, CALL, EMAIL, MEETING | `deal_stage`(딜 단계 변경) 활동 유형 추가 검토 |

### 2.4 User 모델

| 필드 | DB설계서 | Prisma 현재 | 조치 제안 |
|------|----------|-------------|-----------|
| preferences | JSONB | ❌ 없음 | P2: 사용자 설정(시간대, 알림 등) |
| deletedAt | TIMESTAMP | ❌ 없음 | P2: 소프트 삭제 지원 |
| company | 회원가입 시 선택 | ❌ 없음 | API설계서 register Body에 명시, 스키마·로직 추가 |

### 2.5 LeadScore / LeadScoreHistory

| 항목 | DB설계서 | Prisma 현재 | 조치 제안 |
|------|----------|-------------|-----------|
| grade | S/A/B/C/D | summary (string) | grade 필드 추가, SRS 기준 점수 구간(A≥80, B 60–79, C 40–59, D<40) 반영 |
| factors | JSONB (계산 요인) | summary만 사용 | P2: 상세 요인(기본정보, 소스, 활동, 딜이력 등) JSONB로 저장 |

---

## 3. API 미구현 및 경로/스펙 불일치

### 3.1 인증 (Auth)

| API | 문서 정의 | 구현 상태 | 제안 |
|-----|-----------|-----------|------|
| PATCH `/api/v1/auth/me` | 내 정보 수정 | ❌ 미구현 | P1: 프로필 수정 엔드포인트 추가 |
| POST register `company` | 선택 입력 | ❌ 미지원 | P2: company 필드 추가 |

### 3.2 고객 (Contacts)

| API | 문서 정의 | 구현 상태 | 제안 |
|-----|-----------|-----------|------|
| POST `/api/v1/contacts/import` | CSV 일괄 등록 | ❌ 미구현 | P1: FR-002 대안 흐름(AF-002-01) |
| create/patch 필드 | source, tags, memo, jobTitle | ❌ 미지원 | P1: 스키마 확장 후 API 반영 |

### 3.3 딜 (Deals)

| API | 문서 정의 | 구현 상태 | 제안 |
|-----|-----------|-----------|------|
| GET `/api/v1/deals/pipeline` | 칸반 형태(stages + deals 배열) | groupBy 통계만 반환 | P1: 스테이지별 딜 목록 포함 응답 구조로 변경 |

**문서 예시 응답:**
```json
{
  "data": {
    "stages": [
      { "id": "lead", "name": "리드", "deals": [{ "id": "...", "title": "...", ... }] },
      ...
    ],
    "summary": { "totalDeals": 15, "totalAmount": 250000000 }
  }
}
```

### 3.4 AI

| API | 문서 정의 | 구현 상태 | 제안 |
|-----|-----------|-----------|------|
| POST `/api/v1/ai/contacts/{id}/rescore` | 리드 스코어 재계산 | ❌ 미구현 | P1: 수동 재계산 트리거 |
| GET `/api/v1/ai/recommendations` | 전체 추천 (contactId 없음) | ❌ 없음 | P1: “오늘의 추천” 등 전체 목록 |
| GET `/api/v1/ai/recommendations/today` | 오늘의 추천 행동 | ❌ 미구현 | P1: UC-005, FR-005 |
| 경로 | `/ai/contacts/{id}/lead-score` | `/ai/lead-score/{contactId}` | OpenAPI와 코드 경로 정합 권장 |

### 3.5 대시보드

| API | 문서 정의 | 구현 상태 | 제안 |
|-----|-----------|-----------|------|
| GET `/api/v1/dashboard/activities` | 최근 활동 | ❌ 미구현 | P2: API설계서 4.6절 |
| summary 지표 | 신규 고객(주간), AI 추천 행동 수 | ❌ 미포함 | P1: `newContactsThisWeek`, `todayRecommendationsCount` 추가 |
| overdueActivities | - | 활동 scheduledAt < now 건수 | 지표 정의와 구현 불일치, “미완료·초과 작업” 등으로 재정의 필요 |

### 3.6 리포트

| API | 문서 정의 | 구현 상태 | 제안 |
|-----|-----------|-----------|------|
| GET `/api/v1/reports/activities` | 활동 통계 | ❌ 미구현 | P2: FR-009 활동 요약 |
| weekly / monthly | 스테이지별 딜 이동, 성공률 등 | 현재 createdAt 기준 집계 | FR-009 항목(파이프라인 변화, 성공률, 리드 스코어 분포 등) 반영 |
| GET `/api/v1/reports/weekly-export` | CSV export | 501 (의도적 미구현) | 문서·README와 일치, 추후 구현 시 스펙 유지 |

### 3.7 작업 (Tasks)

| API | 문서 정의 | 구현 상태 | 제안 |
|-----|-----------|-----------|------|
| GET `/api/v1/tasks/{id}` | 작업 상세 | ❌ 미구현 | P1: CRUD 완성 |
| PATCH `/api/v1/tasks/{id}` | 작업 수정 | ❌ 미구현 | P1 |
| DELETE `/api/v1/tasks/{id}` | 작업 삭제 | ❌ 미구현 | P1 (소프트 삭제 권장) |

---

## 4. 비즈니스 로직 불일치

### 4.1 고객 등록 시 (FR-002, UC-002)

| 규칙 | 문서 | 구현 | 제안 |
|------|------|------|------|
| AI 리드 스코어 자동 계산 | 등록/수정 시 자동 | GET lead-score 시에만 계산 | P1: create/patch 후 배치 또는 즉시 스코어 계산 호출 |
| 타임라인 “등록” 활동 자동 기록 | 등록 시 | ❌ 없음 | P1: contact create 시 Activity type=NOTE 등으로 자동 생성 |
| 이메일/전화번호 중복 검사 | BR-002-02 | ❌ 없음 | P1: create 시 동일 user 내 중복 검사 |

### 4.2 연락처 lastContactAt

| 규칙 | 문서 | 구현 | 제안 |
|------|------|------|------|
| 활동 등록 시 lastContactAt 갱신 | DB 트리거나 앱 로직 | ❌ 없음 | P1: Activity create 시 Contact.lastContactAt 업데이트 |

### 4.3 고객 수 제한

| 규칙 | 문서 | 구현 | 제안 |
|------|------|------|------|
| 무료 플랜 100명 제한 | BR-002-03 | ❌ 없음 | P2: contact create 전 count 체크, 422 응답 |

### 4.4 비밀번호 정책

| 규칙 | 문서 (FR-001, BR-001-02) | 구현 | 제안 |
|------|---------------------------|------|------|
| 영문+숫자+특수문자 포함 | 명시 | min(8)만 검사 | P2: Zod regex 또는 refine 추가 |

### 4.5 리드 스코어 등급

| 규칙 | SRS | 구현 | 제안 |
|------|-----|------|------|
| A≥80, B 60–79, C 40–59, D<40 | 명시 | 단순 수식 (20 + activity*7 + …) | P1: 점수 구간에 따른 grade 자동 산정 및 저장 |

---

## 5. 비기능 요구사항 (NFR) 갭

| NFR | 내용 | 구현 | 제안 |
|-----|------|------|------|
| NFR-005 | 감사 로깅 (전수 기록) | ❌ 없음 | P2: audit log 테이블 및 미들웨어 |
| NFR-003 | RBAC (역할 기반) | USER/ADMIN 구분만 | P2: 리소스별 권한 매트릭스 확장 |
| NFR-001 | API 응답시간 < 500ms | 측정 없음 | P3: response-time 미들웨어·모니터링 |
| NFR-008 | 테스트 커버리지 70%+ | 현재 12 tests | P2: 리포트·대시보드·AI 등 추가 테스트 |

---

## 6. 알림(FR-007) 미구현

| 채널 | 문서 | 구현 | 제안 |
|------|------|------|------|
| 인앱 알림 | Y (MVP) | ❌ 없음 | P2: 알림 테이블 + 조회 API |
| 이메일 알림 | Y (MVP) | ❌ 없음 | P2: 작업 마감일 등 트리거 시 이메일 발송 |
| BR-007-01 (마감일 당일 9시 알림) | 명시 | ❌ 없음 | P2: cron/scheduler 연동 |

---

## 7. 우선순위별 제안 정리

### P1 (필수·우선)

1. **Contact 스키마 확장** – source, tags, memo, jobTitle, lastContactAt 추가  
2. **PATCH /auth/me** – 프로필 수정 API 구현  
3. **POST /contacts/import** – CSV 일괄 등록  
4. **GET /deals/pipeline** – 스테이지별 딜 배열 포함 칸반 형식 응답  
5. **Tasks CRUD** – GET/PATCH/DELETE `/tasks/{id}` 구현  
6. **AI 전체 추천 API** – `GET /ai/recommendations`, `GET /ai/recommendations/today`  
7. **고객 등록 시** – 리드 스코어 자동 계산, 타임라인 “등록” 활동, lastContactAt 갱신  
8. **리드 스코어 등급** – SRS 기준 A/B/C/D 자동 산정

### P2 (권장)

9. PATCH /auth/me 시 `company` 등 User 확장 필드  
10. 대시보드 `newContactsThisWeek`, `todayRecommendationsCount`  
11. GET `/dashboard/activities`  
12. GET `/reports/activities` 및 FR-009 리포트 항목 보강  
13. 감사 로깅 (NFR-005)  
14. 고객 100명 제한 (BR-002-03)  
15. 비밀번호 정책(영문+숫자+특수문자) 검증 강화  
16. 알림 기반 구조 (인앱/이메일) 설계

### P3 (선택)

17. API 응답시간 모니터링  
18. 테스트 커버리지 70% 목표  
19. OpenAPI ↔ 실제 라우트 경로·스키마 정합  
20. reports 테이블 및 캐싱 전략

---

## 8. 문서 갱신 제안

| 문서 | 제안 |
|------|------|
| RTM | 구현 완료된 FR/NFR에 대한 구현 상태를 “완료”로 반영 |
| openapi-v1.yaml | AI 경로(`/lead-score/{contactId}` 등)와 실제 구현 정합 |
| API설계서 | Deal stage 코드(QUALIFIED vs opportunity 등) 정의 보강 |
| DB설계서 | Prisma 스키마와 동기화된 컬럼·타입 명시 |

---

## 9. 결론

- 문서와 구현 사이에 **데이터 모델·API·비즈니스 로직**에서 상당한 갭이 있으며, 우선 **P1 8건**을 처리하면 문서-SRS와의 정합성이 크게 개선됩니다.  
- **P2 8건**은 운영·확장성·보안 측면에서 권장됩니다.  
- 변경 시 **openapi-v1.yaml**, **contract:audit** 스크립트, **RTM**을 함께 갱신하여 계약 일관성을 유지하는 것이 좋습니다.

---

> **문서 끝** | docs-src-교차분석-제안서 | 2026-02-26
