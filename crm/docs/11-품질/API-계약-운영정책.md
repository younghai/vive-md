# API 계약 운영 정책

> OpenAPI, 라우트 구현, Postman, 계약 검증 결과를 항상 같은 상태로 유지하기 위한 운영 기준

## 1. 목적

- API 문서와 실제 구현의 불일치로 인한 회귀/연동 장애를 최소화
- 릴리스 전 계약 검증을 필수 품질 게이트로 고정

## 2. 계약 단일 소스

- 단일 소스: `crm/docs/openapi-v1.yaml`
- 파생 산출물:
  - `crm/docs/postman/crm-v1.postman_collection.json`
  - API 연동 문서 (`crm/docs/API-연동가이드.md`)

## 3. 변경 시 필수 절차

1. API 라우트 변경 (추가/수정/삭제)
2. `openapi-v1.yaml` 동시 갱신
3. Postman 컬렉션 재생성
4. 계약 검증 실행
5. 문서 갱신 (`API-연동가이드.md`, 필요 시 RTM)

## 4. 필수 검증 커맨드

```bash
cd crm/apps/api
npm run build
npm test
npm run contract:audit
npm run postman:generate
```

## 5. PR 체크리스트

- [ ] OpenAPI 경로/스키마가 코드와 일치한다.
- [ ] `contract:audit`가 통과한다.
- [ ] Postman 컬렉션이 최신 상태다.
- [ ] Breaking Change 여부를 판단하고 `CHANGELOG`에 반영했다.
- [ ] 연동 영향(프론트/외부 API 사용자)을 명시했다.

## 6. 버전 및 변경 정책

- Minor: 하위 호환되는 엔드포인트/필드 추가
- Patch: 버그 수정(응답 호환성 유지)
- Major: 하위 호환 파괴 변경

Breaking Change 예시:
- 필수 필드 삭제/타입 변경
- 응답 구조의 상위 키 변경
- 인증 요구 조건 상향

## 7. 릴리스 승인 기준

- 계약 검증 100% 통과
- 핵심 API smoke test 통과
- 최소 1명 이상의 문서 리뷰 승인
- 릴리스 노트에 변경 엔드포인트와 마이그레이션 영향 기재

## 8. 관련 문서

- `../02-시스템설계/API설계서.md`
- `../API-연동가이드.md`
- `../CHANGELOG.md`
- `../09-운영런북/장애대응-런북.md`

