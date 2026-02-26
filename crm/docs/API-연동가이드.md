# API 연동 가이드 (API Integration Guide)

> **버전:** v1.0  
> **작성일:** 2026-02-24  
> **작성자:** 조훈상 / 기획·개발  
> **API 버전:** v1

---

## 목차

1. [개요](#1-개요)
2. [시작하기](#2-시작하기)
3. [인증](#3-인증)
4. [API 레퍼런스](#4-api-레퍼런스)
5. [Webhook](#5-webhook)
6. [에러 처리](#6-에러-처리)
7. [SDK 및 예제](#7-sdk-및-예제)
8. [변경 이력](#8-변경-이력)

---

## 1. 개요

### 1.1 VIVE CRM API란?

VIVE CRM API는 외부 시스템과 VIVE CRM을 연동하여 고객 데이터를 동기화하고, 영업 활동을 자동화할 수 있는 RESTful API입니다.

### 1.2 주요 사용 사례

| 사용 사례 | 설명 |
|-----------|------|
| **웹사이트 연동** | 문의 폼 제출 시 자동으로 리드 생성 |
| **이메일 마케팅** | 이메일 오픈/클릭 데이터를 CRM에 기록 |
| **캘린더 연동** | 미팅 일정을 CRM 활동으로 자동 등록 |
| **ERP/회계 연동** | 계약 체결 시 자동으로 주문 생성 |
| **고객 지원** | 티켓 시스템과 CRM 고객 정보 연동 |

### 1.3 API 스펙

| 항목 | 내용 |
|------|------|
| **프로토콜** | HTTPS |
| **데이터 형식** | JSON |
| **인증 방식** | Bearer Token (JWT) |
| **Base URL** | `https://api.vive-crm.com/v1` |
| **Content-Type** | `application/json` |

---

## 2. 시작하기

### 2.1 API 키 발급

1. VIVE CRM에 로그인
2. 설정 > API 관리 이동
3. "새 API 키 생성" 클릭
4. 키 이름과 권한 범위 선택
5. 생성된 API 키 복사 (⚠️ 한 번만 표시됨)

### 2.2 권한 범위 (Scopes)

| Scope | 설명 |
|-------|------|
| `contacts:read` | 고객 정보 조회 |
| `contacts:write` | 고객 정보 생성/수정/삭제 |
| `deals:read` | 딜 정보 조회 |
| `deals:write` | 딜 생성/수정/삭제 |
| `activities:read` | 활동 기록 조회 |
| `activities:write` | 활동 기록 생성/수정 |
| `tasks:read` | 작업 조회 |
| `tasks:write` | 작업 생성/수정/삭제 |
| `reports:read` | 리포트 데이터 조회 |
| `webhooks:manage` | Webhook 설정 관리 |

---

## 3. 인증

### 3.1 Bearer Token 인증

모든 API 요청에는 `Authorization` 헤더에 Bearer Token을 포함해야 합니다.

```http
Authorization: Bearer {your_api_key}
```

### 3.2 인증 예제

#### cURL

```bash
curl -X GET "https://api.vive-crm.com/v1/contacts" \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json"
```

#### JavaScript (fetch)

```javascript
const response = await fetch('https://api.vive-crm.com/v1/contacts', {
  method: 'GET',
  headers: {
    'Authorization': 'Bearer YOUR_API_KEY',
    'Content-Type': 'application/json'
  }
});

const data = await response.json();
```

#### Python

```python
import requests

headers = {
    'Authorization': 'Bearer YOUR_API_KEY',
    'Content-Type': 'application/json'
}

response = requests.get('https://api.vive-crm.com/v1/contacts', headers=headers)
data = response.json()
```

---

## 4. API 레퍼런스

### 4.1 고객 (Contacts)

#### 고객 목록 조회

```http
GET /contacts
```

**Query Parameters:**

| 파라미터 | 타입 | 필수 | 설명 |
|----------|------|:----:|------|
| `page` | integer | No | 페이지 번호 (기본값: 1) |
| `limit` | integer | No | 페이지당 항목 수 (기본값: 20, 최대: 100) |
| `search` | string | No | 이름, 이메일, 회사명 검색 |
| `tag` | string | No | 태그로 필터링 |
| `lead_score_min` | integer | No | 최소 리드 스코어 |
| `lead_score_max` | integer | No | 최대 리드 스코어 |
| `created_after` | date | No | 생성일 이후 (YYYY-MM-DD) |
| `created_before` | date | No | 생성일 이전 (YYYY-MM-DD) |

**Response:**

```json
{
  "data": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "name": "홍길동",
      "email": "hong@example.com",
      "phone": "010-1234-5678",
      "company": "ABC 주식회사",
      "job_title": "영업팀장",
      "tags": ["VIP", "신규"],
      "lead_score": 85,
      "lead_grade": "A",
      "source": "website",
      "created_at": "2026-02-24T10:30:00Z",
      "updated_at": "2026-02-24T10:30:00Z"
    }
  ],
  "meta": {
    "current_page": 1,
    "per_page": 20,
    "total_pages": 5,
    "total_count": 100
  }
}
```

#### 고객 상세 조회

```http
GET /contacts/{id}
```

#### 고객 생성

```http
POST /contacts
```

**Request Body:**

```json
{
  "name": "홍길동",
  "email": "hong@example.com",
  "phone": "010-1234-5678",
  "company": "ABC 주식회사",
  "job_title": "영업팀장",
  "tags": ["신규"],
  "source": "website",
  "memo": "웹사이트 통해 문의"
}
```

#### 고객 수정

```http
PUT /contacts/{id}
```

#### 고객 삭제

```http
DELETE /contacts/{id}
```

### 4.2 딜 (Deals)

#### 딜 목록 조회

```http
GET /deals
```

**Query Parameters:**

| 파라미터 | 타입 | 필수 | 설명 |
|----------|------|:----:|------|
| `stage` | string | No | 파이프라인 단계 (lead, opportunity, proposal, negotiation, closed_won, closed_lost) |
| `contact_id` | uuid | No | 특정 고객의 딜만 조회 |
| `min_amount` | decimal | No | 최소 금액 |
| `max_amount` | decimal | No | 최대 금액 |

**Response:**

```json
{
  "data": [
    {
      "id": "660e8400-e29b-41d4-a716-446655440001",
      "title": "ABC 주식회사 ERP 도입",
      "contact_id": "550e8400-e29b-41d4-a716-446655440000",
      "contact_name": "홍길동",
      "amount": 50000000,
      "currency": "KRW",
      "stage": "proposal",
      "probability": 60,
      "expected_close_date": "2026-03-31",
      "created_at": "2026-02-20T09:00:00Z",
      "updated_at": "2026-02-24T14:00:00Z"
    }
  ],
  "meta": {
    "current_page": 1,
    "per_page": 20,
    "total_pages": 3,
    "total_count": 45
  }
}
```

#### 딜 생성

```http
POST /deals
```

**Request Body:**

```json
{
  "title": "신규 프로젝트",
  "contact_id": "550e8400-e29b-41d4-a716-446655440000",
  "amount": 10000000,
  "currency": "KRW",
  "stage": "lead",
  "expected_close_date": "2026-03-15",
  "memo": "3월 중 계약 목표"
}
```

#### 딜 단계 이동

```http
PATCH /deals/{id}/stage
```

**Request Body:**

```json
{
  "stage": "opportunity",
  "reason": "니즈 확인 완료"
}
```

### 4.3 활동 (Activities)

#### 활동 기록 생성

```http
POST /activities
```

**Request Body:**

```json
{
  "contact_id": "550e8400-e29b-41d4-a716-446655440000",
  "deal_id": "660e8400-e29b-41d4-a716-446655440001",
  "type": "email",
  "subject": "견적서 발송",
  "content": "ERP 도입 견적서를 이메일로 발송했습니다.",
  "scheduled_at": "2026-02-24T10:00:00Z"
}
```

**Activity Types:**

| 타입 | 설명 |
|------|------|
| `email` | 이메일 발송/수신 |
| `call` | 전화 통화 |
| `meeting` | 미팅 |
| `memo` | 메모 |
| `task` | 작업 완료 |

### 4.4 AI 기능

#### 리드 스코어 계산

```http
POST /ai/lead-score
```

**Request Body:**

```json
{
  "contact_id": "550e8400-e29b-41d4-a716-446655440000"
}
```

**Response:**

```json
{
  "contact_id": "550e8400-e29b-41d4-a716-446655440000",
  "score": 85,
  "grade": "A",
  "factors": {
    "info_completeness": 20,
    "source_quality": 15,
    "activity_history": 25,
    "deal_history": 25,
    "industry_match": 15
  },
  "recommendation": "높은 구매 가능성. 즉시 전화 상담 권장."
}
```

#### 다음 행동 추천

```http
GET /ai/next-actions
```

**Query Parameters:**

| 파라미터 | 타입 | 필수 | 설명 |
|----------|------|:----:|------|
| `contact_id` | uuid | No | 특정 고객에 대한 추천 |
| `limit` | integer | No | 추천 개수 (기본값: 5) |

**Response:**

```json
{
  "data": [
    {
      "contact_id": "550e8400-e29b-41d4-a716-446655440000",
      "contact_name": "홍길동",
      "recommended_action": "call",
      "priority": "high",
      "reason": "3일간 연락 없음, A등급 고객",
      "suggested_time": "2026-02-25T14:00:00Z"
    }
  ]
}
```

---

## 5. Webhook

### 5.1 Webhook 개요

Webhook을 통해 VIVE CRM에서 발생하는 이벤트를 실시간으로 외부 시스템에 전달할 수 있습니다.

### 5.2 지원하는 이벤트

| 이벤트 | 설명 |
|--------|------|
| `contact.created` | 고객 생성 시 |
| `contact.updated` | 고객 정보 수정 시 |
| `deal.created` | 딜 생성 시 |
| `deal.updated` | 딜 수정 시 |
| `deal.stage_changed` | 딜 단계 변경 시 |
| `activity.created` | 활동 기록 생성 시 |
| `task.created` | 작업 생성 시 |
| `task.completed` | 작업 완료 시 |

### 5.3 Webhook 등록

```http
POST /webhooks
```

**Request Body:**

```json
{
  "url": "https://your-app.com/webhook/vive-crm",
  "events": ["contact.created", "deal.stage_changed"],
  "secret": "your_webhook_secret_key",
  "is_active": true
}
```

### 5.4 Webhook 페이로드

```json
{
  "event": "contact.created",
  "timestamp": "2026-02-24T10:30:00Z",
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "name": "홍길동",
    "email": "hong@example.com",
    "created_at": "2026-02-24T10:30:00Z"
  }
}
```

### 5.5 Webhook 검증

Webhook 요청의 `X-ViveCRM-Signature` 헤더로 위변조를 검증할 수 있습니다.

```javascript
const crypto = require('crypto');

function verifyWebhook(payload, signature, secret) {
  const expectedSignature = crypto
    .createHmac('sha256', secret)
    .update(payload)
    .digest('hex');
  
  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(expectedSignature)
  );
}
```

---

## 6. 에러 처리

### 6.1 HTTP 상태 코드

| 코드 | 의미 | 설명 |
|:----:|------|------|
| 200 | OK | 요청 성공 |
| 201 | Created | 리소스 생성 성공 |
| 204 | No Content | 삭제 성공 (응답 본문 없음) |
| 400 | Bad Request | 요청 형식 오류 |
| 401 | Unauthorized | 인증 실패 |
| 403 | Forbidden | 권한 부족 |
| 404 | Not Found | 리소스 없음 |
| 422 | Unprocessable Entity | 유효성 검증 실패 |
| 429 | Too Many Requests | Rate Limit 초과 |
| 500 | Internal Server Error | 서버 오류 |

### 6.2 에러 응답 형식

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "요청 데이터가 유효하지 않습니다.",
    "details": [
      {
        "field": "email",
        "message": "올바른 이메일 형식이 아닙니다."
      }
    ]
  }
}
```

### 6.3 Rate Limiting

| 구분 | 제한 |
|------|------|
| 일반 API | 분당 100회 |
| AI 기능 API | 분당 20회 |
| Webhook 발송 | 분당 1000회 |

Rate Limit 초과 시 `429 Too Many Requests` 응답과 함께 `Retry-After` 헤더가 반환됩니다.

---

## 7. SDK 및 예제

### 7.1 공식 SDK

| 언어/플랫폼 | 패키지명 | 설치 |
|-------------|----------|------|
| JavaScript/Node.js | `@vivecrm/sdk` | `npm install @vivecrm/sdk` |
| Python | `vivecrm` | `pip install vivecrm` |
| PHP | `vivecrm/sdk` | `composer require vivecrm/sdk` |

### 7.2 Node.js SDK 예제

```javascript
import { ViveCRM } from '@vivecrm/sdk';

const crm = new ViveCRM({
  apiKey: 'YOUR_API_KEY'
});

// 고객 생성
const contact = await crm.contacts.create({
  name: '홍길동',
  email: 'hong@example.com',
  company: 'ABC 주식회사'
});

// 딜 생성
const deal = await crm.deals.create({
  title: '신규 프로젝트',
  contact_id: contact.id,
  amount: 10000000,
  stage: 'lead'
});
```

### 7.3 Zapier 통합

VIVE CRM은 Zapier를 통해 5000+ 앱과 연동됩니다.

**지원 트리거:**
- 고객 생성/수정 시
- 딜 단계 변경 시
- 작업 완료 시

**지원 액션:**
- 고객 생성/수정
- 딜 생성/수정
- 활동 기록 생성

---

## 8. 변경 이력

| 버전 | 날짜 | 변경 내용 |
|------|------|-----------|
| v1.0 | 2026-04-15 | 최초 공개 |

---

## 문의 및 지원

- **기술 문의:** api-support@vive-crm.com
- **문서 피드백:** docs-feedback@vive-crm.com
- **API 상태 페이지:** https://status.vive-crm.com
