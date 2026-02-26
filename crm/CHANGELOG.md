# Changelog

## Release Tags

- Tag format: `vMAJOR.MINOR.PATCH`
- Current release tag: `v0.1.1`
- Example:
  - `git tag -a v0.1.1 -m "release: v0.1.1"`
  - `git push origin v0.1.1`

## 0.1.1 - 2026-02-26

### Added

- Added OpenAPI path for `GET /api/v1/reports/weekly-export` with `501` response.
- Added Postman collection generator script: `scripts/generate-postman.ts`.
- Added Postman local environment file: `docs/postman/crm-local.postman_environment.json`.
- Added CI workflow to run `npm test` and `npm run contract:audit` on push/PR.

### Changed

- Fixed route contract normalization for dynamic paths (`{id}` vs `:id`) in tests.
- Improved `GET /api/v1/auth/me` to return `401` when auth context is missing.
- Fixed `scripts/contract-audit.ts` path resolution for app import.
- Updated JWT utility imports for ESM compatibility (`jsonwebtoken` default import).
- Filtered middleware-only `ALL` routes in contract audit output.
- Added `npm run build` step to CI verification job.
