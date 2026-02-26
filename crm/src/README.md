# CRM Service (Generated)

## 실행 방법

1. 환경 변수 설정

```bash
cp .env.example .env
```

2. 패키지 설치

```bash
npm install
```

3. DB 마이그레이션

```bash
npm run prisma:migrate
npm run prisma:generate
```

4. 로컬 실행

```bash
npm run dev
```

## 제공 API
- `GET /healthz`
- `GET /api/v1/health`
- `POST /api/v1/auth/{register,login,refresh,logout}`
- `GET /api/v1/auth/me`
- `GET|POST|PATCH|DELETE /api/v1/contacts`
- `GET /api/v1/contacts/:id/activities`
- `POST /api/v1/contacts/:id/activities`
- `GET|POST|PATCH|DELETE /api/v1/deals`
- `PATCH /api/v1/deals/:id/stage`
- `GET|POST /api/v1/activities`
- `GET|POST /api/v1/tasks`
- `PATCH /api/v1/tasks/:id/complete`
- `GET /api/v1/dashboard/{summary,pipeline-stats}`
- `GET /api/v1/reports/{weekly,monthly}`
- `GET /api/v1/ai/{lead-score/:contactId,recommendations/:contactId}`
