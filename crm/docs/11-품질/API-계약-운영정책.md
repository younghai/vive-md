# API 계약 운영 정책

> OpenAPI, 라우트 구현, Postman, 계약 검증 결과를 항상 같은 상태로 유지하기 위한 운영 기준

| 항목 | 내용 |
|------|------|
| **문서 버전** | v1.1 |
| **작성일** | 2026-02-24 |
| **수정일** | 2026-03-17 |
| **작성자** | 권영해 / 기획·개발 |

---

## 변경 이력

| 버전 | 날짜 | 작성자 | 변경 내용 |
|------|------|--------|-----------|
| v0.1 | 2026-02-24 | 권영해 | 초안 작성 |
| v1.1 | 2026-03-17 | 권영해 | API 보안 정책, 인증/CSRF 명세 추가 |

---

## 1. 목적

- API 문서와 실제 구현의 불일치로 인한 회귀/연동 장애를 최소화
- 릴리스 전 계약 검증을 필수 품질 게이트로 고정
- **API 보안 정책(CSRF, Rate Limit, 인증)을 계약에 명확히 반영**

---

## 2. 계약 단일 소스

- 단일 소스: `crm/docs/openapi-v1.yaml`
- 파생 산출물:
  - `crm/docs/postman/crm-v1.postman_collection.json`
  - API 연동 문서 (`crm/docs/API-연동가이드.md`)

---

## 3. 변경 시 필수 절차

1. API 라우트 변경 (추가/수정/삭제)
2. **보안 정책 변경 시 OpenAPI securitySchemes 업데이트**
3. `openapi-v1.yaml` 동시 갱신
4. Postman 컬렉션 재생성
5. 계약 검증 실행
6. 문서 갱신 (`API-연동가이드.md`, 필요 시 RTM)

---

## 4. API 보안 계약

### 4.1 인증 방식

```yaml
# openapi-v1.yaml
securitySchemes:
  bearerAuth:
    type: http
    scheme: bearer
    bearerFormat: JWT
    description: |
      Access Token (JWT)을 Bearer 스키마로 전달.
      토큰은 메모리에만 저장하며, localStorage 미사용.
  cookieAuth:
    type: apiKey
    in: cookie
    name: refreshToken
    description: |
      HttpOnly, Secure, SameSite=Strict 쿠키로 전달되는 Refresh Token.
      JavaScript에서 접근 불가.
```

### 4.2 CSRF 방어

```yaml
# openapi-v1.yaml - 민감 엔드포인트
paths:
  /api/v1/contacts:
    post:
      security:
        - bearerAuth: []
      parameters:
        - name: X-CSRF-Token
          in: header
          required: true
          schema:
            type: string
          description: CSRF 방어 토큰 (민감 작업 시 필요)
```

| 엔드포인트 | CSRF Token 필요 | 사유 |
|-----------|----------------|------|
| POST /auth/* | ❌ | 인증 전 요청 |
| GET /* | ❌ | 읽기 전용 |
| POST/PUT/PATCH/DELETE /contacts | ✅ | 상태 변경 |
| POST/PUT/PATCH/DELETE /deals | ✅ | 상태 변경 |
| POST/PUT/PATCH/DELETE /tasks | ✅ | 상태 변경 |
| POST /billing/* | ✅ | 결제 관련 |
| POST /admin/* | ✅ | 관리자 기능 |

### 4.3 Rate Limit 헤더

```yaml
# 응답 헤더 명세
headers:
  X-RateLimit-Limit:
    description: 분당 최대 요청 수
    schema:
      type: integer
  X-RateLimit-Remaining:
    description: 남은 요청 수
    schema:
      type: integer
  X-RateLimit-Reset:
    description: 제한 초기화 시간(Unix timestamp)
    schema:
      type: integer
  Retry-After:
    description: 429 응답 시 재시도 대기 시간(초)
    schema:
      type: integer
```

### 4.4 보안 응답 코드

| 상태 코드 | 의미 | 사용 상황 |
|-----------|------|-----------|
| 400 | Bad Request | 요청 파라미터 검증 실패 |
| 401 | Unauthorized | 인증 토큰 누락/만료 |
| 403 | Forbidden | 권한 부족 또는 CSRF 검증 실패 |
| 429 | Too Many Requests | Rate Limit 초과 |
| 419 | Authentication Timeout | 세션 만료 (30분 비활동) |

---

## 5. 필수 검증 커맨드

```bash
cd crm/apps/api
npm run build
npm test
npm run contract:audit
npm run postman:generate
```

---

## 6. PR 체크리스트

- [ ] OpenAPI 경로/스키마가 코드와 일치한다.
- [ ] **보안 정책(CSRF, Rate Limit, 인증)이 OpenAPI에 명시되었다.**
- [ ] `contract:audit`가 통과한다.
- [ ] Postman 컬렉션이 최신 상태다.
- [ ] Breaking Change 여부를 판단하고 `CHANGELOG`에 반영했다.
- [ ] 연동 영향(프론트/외부 API 사용자)을 명시했다.
- [ ] **보안 변경 시 보안 검토가 완료되었다.**

---

## 7. 버전 및 변경 정책

- Minor: 하위 호환되는 엔드포인트/필드 추가
- Patch: 버그 수정(응답 호환성 유지)
- Major: 하위 호환 파괴 변경

Breaking Change 예시:
- 필수 필드 삭제/타입 변경
- 응답 구조의 상위 키 변경
- 인증 요구 조건 상향
- **보안 정책 변경 (CSRF 필수화 등)**

---

## 8. 릴리스 승인 기준

- 계약 검증 100% 통과
- 핵심 API smoke test 통과
- **보안 검증 통과 (CSRF, Rate Limit, 인증)**
- 최소 1명 이상의 문서 리뷰 승인
- 릴리스 노트에 변경 엔드포인트와 마이그레이션 영향 기재

---

## 9. API 보안 검증 체크리스트

### 9.1 인증 검증

- [ ] Access Token이 메모리에만 저장되고 localStorage에 저장되지 않는다
- [ ] Refresh Token이 HttpOnly, Secure, SameSite=Strict 쿠키로 설정된다
- [ ] Refresh Token이 JSON 응답으로 날라가지 않는다
- [ ] Access Token 만료 시 자동으로 Refresh Token으로 갱신된다
- [ ] 30분 비활동 시 세션이 만료된다

### 9.2 CSRF 검증

- [ ] 상태 변경 요청(POST/PUT/PATCH/DELETE)에 CSRF 방어가 적용된다
- [ ] Sec-Fetch-Site 헤더가 검증된다
- [ ] Origin/Referer 헤더가 검증된다
- [ ] 민감 작업에 CSRF Token이 필요하다
- [ ] CSRF Token이 세션과 연결되어 있다

### 9.3 Rate Limit 검증

- [ ] Redis 기반 Rate Limit이 적용된다
- [ ] 응답 헤더에 Rate Limit 정보가 포함된다
- [ ] 429 응답 시 Retry-After 헤더가 포함된다
- [ ] Rate Limit 위반이 감사 로그에 기록된다

### 9.4 보안 헤더 검증

- [ ] Content-Security-Policy 헤더가 설정된다
- [ ] X-Frame-Options: DENY가 설정된다
- [ ] X-Content-Type-Options: nosniff가 설정된다
- [ ] Strict-Transport-Security 헤더가 설정된다

---

## 10. 관련 문서

- `../02-시스템설계/API설계서.md`
- `../API-연동가이드.md`
- `../CHANGELOG.md`
- `../09-운영런북/장애대응-런북.md`
- `../00-기획/비즈니스정책서.md` (보안 정책)

---

**마지막 업데이트**: 2026-03-17  
**문서 버전**: v1.1
