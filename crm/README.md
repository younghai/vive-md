# CRM Service

문서 기준으로 생성한 `CRM` 백엔드 API 스케폴딩입니다. (`/api/v1` 규격, Hono, Prisma, JWT, PostgreSQL)

## 빠른 실행

```bash
cp .env.example .env
npm install
npm run prisma:migrate   # 초기 마이그레이션
npm run prisma:generate
npm run dev
```

## 엔드포인트

- 인증: `/api/v1/auth/*`
- Contact: `/api/v1/contacts`
- Deal: `/api/v1/deals`
- Activity: `/api/v1/activities`
- Task: `/api/v1/tasks`
- Dashboard: `/api/v1/dashboard/{summary,pipeline-stats}`
- Reports: `/api/v1/reports/{weekly,monthly}`
- AI: `/api/v1/ai/{lead-score/:contactId,recommendations/:contactId}`

## 응답 형식

성공: `{ data: ... }`

오류: `{ error: { code, message, details, timestamp, path, requestId } }`

## 구현 범위

- `docs` 분석 기반 v1 우선순위: 인증/연락처/딜/활동/작업/대시보드/리포트/AI 스코어/추천
- 추가 요구사항(권한, 감사로그, 레이트리밋, 운영 지표)은 각 미들웨어와 엔티티 확장을 통해 단계적으로 확장 가능

## API 문서

- OpenAPI v1: [docs/openapi-v1.yaml](./docs/openapi-v1.yaml)
- Postman Collection: [docs/postman/crm-v1.postman_collection.json](./docs/postman/crm-v1.postman_collection.json)
- Postman Environment (Local): [docs/postman/crm-local.postman_environment.json](./docs/postman/crm-local.postman_environment.json)

## 테스트/계약 점검

```bash
npm test            # vitest 실행
npm run test:watch  # vitest watch
npm run contract:audit  # openapi-v1.yaml 과 실제 라우팅 정합 검사
npm run postman:generate # openapi-v1 기반 postman collection 생성
```

테스트 파일 위치: `tests/`
- `tests/routes/health.test.ts`
- `tests/lib/*.test.ts`
- `tests/contracts/route-contract.test.ts`

스크립트: `scripts/contract-audit.ts`

## 자동화

- CI Workflow: `.github/workflows/ci.yml`
  - `npm run build`
  - `npm test`
  - `npm run contract:audit`

## 변경 이력

- [CHANGELOG.md](./CHANGELOG.md)
  - release tag rule: `vMAJOR.MINOR.PATCH` (현재 `v0.1.1`)
- Release Notes: [docs/releases/v0.1.1.md](./docs/releases/v0.1.1.md)

## 현재 검증 상태 (2026-02-26)

- `npm test` 통과
  - Test Files: `6 passed`
  - Tests: `12 passed`
- `npm run contract:audit` 통과
  - Documented routes: `33`
  - Implemented routes: `33`

## 참고

- OpenAPI에 `/api/v1/reports/weekly-export`(미구현, `501`)가 반영되어 코드 라우트와 계약 문서가 일치합니다.
