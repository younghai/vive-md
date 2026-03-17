# API Integration Guide

> **Version:** v1.0  
> **Created on:** 2026-02-24  
> **Author:** Kwon Younghae / Planning and Development  
> **API version:** v1

---

## Table of Contents

1. [Overview](#1-overview)
2. [Getting Started](#2-getting-started)
3. [Authentication](#3-authentication)
4. [API Reference](#4-api-reference)
5. [Webhook](#5-webhook)
6. [Error Handling](#6-error-handling)
7. [SDKs and Examples](#7-sdks-and-examples)
8. [Change History](#8-change-history)

---

## 1. Overview

### 1.1 What Is the VIVE CRM API?

The VIVE CRM API is a RESTful API that allows external systems to integrate with VIVE CRM to synchronize contact data and automate sales activities.

### 1.2 Key Use Cases

| Use Case | Description |
|----------|-------------|
| **Website integration** | Automatically create leads when inquiry forms are submitted |
| **Email marketing** | Record email open and click data in the CRM |
| **Calendar integration** | Automatically register meeting schedules as CRM activities |
| **ERP/accounting integration** | Automatically create orders when deals are closed |
| **Customer support** | Sync ticket systems with CRM customer information |

### 1.3 API Specification

| Item | Value |
|------|-------|
| **Protocol** | HTTPS |
| **Data format** | JSON |
| **Authentication** | Bearer Token (JWT) |
| **Base URL** | `https://api.vive-crm.com/v1` |
| **Content-Type** | `application/json` |

---

## 2. Getting Started

### 2.1 Issuing an API Key

1. Log in to VIVE CRM
2. Go to `Settings > API Management`
3. Click "Create New API Key"
4. Select the key name and permission scopes
5. Copy the generated API key (`⚠️` shown only once)

### 2.2 Permission Scopes

| Scope | Description |
|-------|-------------|
| `contacts:read` | Read contact information |
| `contacts:write` | Create, update, and delete contact information |
| `deals:read` | Read deal information |
| `deals:write` | Create, update, and delete deals |
| `activities:read` | Read activity records |
| `activities:write` | Create and update activity records |
| `tasks:read` | Read tasks |
| `tasks:write` | Create, update, and delete tasks |
| `reports:read` | Read report data |
| `webhooks:manage` | Manage webhook settings |

---

## 3. Authentication

### 3.1 Bearer Token Authentication

All API requests must include a Bearer Token in the `Authorization` header.

```http
Authorization: Bearer {your_api_key}
```

### 3.2 Authentication Examples

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

## 4. API Reference

### 4.1 Contacts

#### List Contacts

```http
GET /contacts
```

**Query Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|:--------:|-------------|
| `page` | integer | No | Page number (default: `1`) |
| `limit` | integer | No | Items per page (default: `20`, max: `100`) |
| `search` | string | No | Search by name, email, or company name |
| `tag` | string | No | Filter by tag |
| `lead_score_min` | integer | No | Minimum lead score |
| `lead_score_max` | integer | No | Maximum lead score |
| `created_after` | date | No | Created after (`YYYY-MM-DD`) |
| `created_before` | date | No | Created before (`YYYY-MM-DD`) |

**Response:**

```json
{
  "data": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "name": "Hong Gil-dong",
      "email": "hong@example.com",
      "phone": "010-1234-5678",
      "company": "ABC Corporation",
      "job_title": "Sales Team Lead",
      "tags": ["VIP", "New"],
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

#### Get Contact Details

```http
GET /contacts/{id}
```

#### Create a Contact

```http
POST /contacts
```

**Request Body:**

```json
{
  "name": "Hong Gil-dong",
  "email": "hong@example.com",
  "phone": "010-1234-5678",
  "company": "ABC Corporation",
  "job_title": "Sales Team Lead",
  "tags": ["New"],
  "source": "website",
  "memo": "Inquiry submitted through the website"
}
```

#### Update a Contact

```http
PUT /contacts/{id}
```

#### Delete a Contact

```http
DELETE /contacts/{id}
```

### 4.2 Deals

#### List Deals

```http
GET /deals
```

**Query Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|:--------:|-------------|
| `stage` | string | No | Pipeline stage (`lead`, `opportunity`, `proposal`, `negotiation`, `closed_won`, `closed_lost`) |
| `contact_id` | uuid | No | Retrieve deals for a specific contact only |
| `min_amount` | decimal | No | Minimum amount |
| `max_amount` | decimal | No | Maximum amount |

**Response:**

```json
{
  "data": [
    {
      "id": "660e8400-e29b-41d4-a716-446655440001",
      "title": "ABC Corporation ERP Implementation",
      "contact_id": "550e8400-e29b-41d4-a716-446655440000",
      "contact_name": "Hong Gil-dong",
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

#### Create a Deal

```http
POST /deals
```

**Request Body:**

```json
{
  "title": "New Project",
  "contact_id": "550e8400-e29b-41d4-a716-446655440000",
  "amount": 10000000,
  "currency": "KRW",
  "stage": "lead",
  "expected_close_date": "2026-03-15",
  "memo": "Targeting contract signing within March"
}
```

#### Move a Deal Stage

```http
PATCH /deals/{id}/stage
```

**Request Body:**

```json
{
  "stage": "opportunity",
  "reason": "Needs have been confirmed"
}
```

### 4.3 Activities

#### Create an Activity Record

```http
POST /activities
```

**Request Body:**

```json
{
  "contact_id": "550e8400-e29b-41d4-a716-446655440000",
  "deal_id": "660e8400-e29b-41d4-a716-446655440001",
  "type": "email",
  "subject": "Proposal Sent",
  "content": "The ERP implementation proposal was sent by email.",
  "scheduled_at": "2026-02-24T10:00:00Z"
}
```

**Activity Types:**

| Type | Description |
|------|-------------|
| `email` | Email sent/received |
| `call` | Phone call |
| `meeting` | Meeting |
| `memo` | Memo |
| `task` | Task completed |

### 4.4 AI Features

#### Calculate Lead Score

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
  "recommendation": "High purchase probability. An immediate phone consultation is recommended."
}
```

#### Recommend Next Actions

```http
GET /ai/next-actions
```

**Query Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|:--------:|-------------|
| `contact_id` | uuid | No | Recommendations for a specific contact |
| `limit` | integer | No | Number of recommendations (default: `5`) |

**Response:**

```json
{
  "data": [
    {
      "contact_id": "550e8400-e29b-41d4-a716-446655440000",
      "contact_name": "Hong Gil-dong",
      "recommended_action": "call",
      "priority": "high",
      "reason": "No contact for three days, A-grade customer",
      "suggested_time": "2026-02-25T14:00:00Z"
    }
  ]
}
```

---

## 5. Webhook

### 5.1 Webhook Overview

Through webhooks, events that occur in VIVE CRM can be delivered to external systems in real time.

### 5.2 Supported Events

| Event | Description |
|-------|-------------|
| `contact.created` | When a contact is created |
| `contact.updated` | When contact information is updated |
| `deal.created` | When a deal is created |
| `deal.updated` | When a deal is updated |
| `deal.stage_changed` | When a deal stage changes |
| `activity.created` | When an activity record is created |
| `task.created` | When a task is created |
| `task.completed` | When a task is completed |

### 5.3 Register a Webhook

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

### 5.4 Webhook Payload

```json
{
  "event": "contact.created",
  "timestamp": "2026-02-24T10:30:00Z",
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "name": "Hong Gil-dong",
    "email": "hong@example.com",
    "created_at": "2026-02-24T10:30:00Z"
  }
}
```

### 5.5 Webhook Verification

Tampering can be verified with the `X-ViveCRM-Signature` header included in webhook requests.

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

## 6. Error Handling

### 6.1 HTTP Status Codes

| Code | Meaning | Description |
|:----:|---------|-------------|
| 200 | OK | Request succeeded |
| 201 | Created | Resource created successfully |
| 204 | No Content | Deletion succeeded (no response body) |
| 400 | Bad Request | Invalid request format |
| 401 | Unauthorized | Authentication failed |
| 403 | Forbidden | Insufficient permissions |
| 404 | Not Found | Resource not found |
| 422 | Unprocessable Entity | Validation failed |
| 429 | Too Many Requests | Rate limit exceeded |
| 500 | Internal Server Error | Server error |

### 6.2 Error Response Format

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "The request data is invalid.",
    "details": [
      {
        "field": "email",
        "message": "The email format is invalid."
      }
    ]
  }
}
```

### 6.3 Rate Limiting

| Category | Limit |
|----------|-------|
| General API | 100 requests per minute |
| AI feature API | 20 requests per minute |
| Webhook delivery | 1,000 requests per minute |

When the rate limit is exceeded, a `429 Too Many Requests` response is returned together with the `Retry-After` header.

---

## 7. SDKs and Examples

### 7.1 Official SDKs

| Language / Platform | Package Name | Installation |
|---------------------|--------------|--------------|
| JavaScript/Node.js | `@vivecrm/sdk` | `npm install @vivecrm/sdk` |
| Python | `vivecrm` | `pip install vivecrm` |
| PHP | `vivecrm/sdk` | `composer require vivecrm/sdk` |

### 7.2 Node.js SDK Example

```javascript
import { ViveCRM } from '@vivecrm/sdk';

const crm = new ViveCRM({
  apiKey: 'YOUR_API_KEY'
});

// Create a contact
const contact = await crm.contacts.create({
  name: 'Hong Gil-dong',
  email: 'hong@example.com',
  company: 'ABC Corporation'
});

// Create a deal
const deal = await crm.deals.create({
  title: 'New Project',
  contact_id: contact.id,
  amount: 10000000,
  stage: 'lead'
});
```

### 7.3 Zapier Integration

VIVE CRM integrates with 5,000+ apps through Zapier.

**Supported triggers:**
- When a contact is created or updated
- When a deal stage changes
- When a task is completed

**Supported actions:**
- Create or update a contact
- Create or update a deal
- Create an activity record

---

## 8. Change History

| Version | Date | Description |
|---------|------|-------------|
| v1.0 | 2026-04-15 | Initial public release |

---

## Contact and Support

- **Technical support:** `api-support@vive-crm.com`
- **Documentation feedback:** `docs-feedback@vive-crm.com`
- **API status page:** `https://status.vive-crm.com`
