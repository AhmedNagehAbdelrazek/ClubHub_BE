# Quickstart: Multi‑Sport Club & Court Management Backend

## 1) Prerequisites

- Node.js 20 LTS (recommended)
- npm 10+
- PostgreSQL 14+
- (Optional) AWS S3 bucket credentials for production-like file handling
- (Optional) Brevo API key for email/SMS flows

## 2) Environment setup

Create/update `.env` in repository root with at least:

- `NODE_ENV=development`
- `PORT=3000`
- `DATABASE_URL=postgres://...` (or equivalent split DB vars used by config)
- `JWT_SECRET=...`
- `JWT_EXPIRES_IN=...`
- `CORS_ORIGIN=...`
- `UPLOAD_PATH=./uploads`
- `BREVO_API_KEY=...` (if email/SMS enabled)
- `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `AWS_REGION`, `S3_BUCKET` (if S3 enabled)

## 3) Install dependencies

From repo root:

- `npm install`

## 4) Database bootstrap

For current baseline (before migration-first rollout is completed):

- Start PostgreSQL and ensure DB exists.
- Start app once to verify connectivity and model initialization.

For migration-first phase (recommended target state):

- `npx sequelize-cli db:migrate`
- `npx sequelize-cli db:seed:all` (if seeders are provided)

## 5) Run application

Development mode:

- `npm run dev`

Production-like run:

- `npm start`

Expected services:

- HTTP API from `server.js`
- Socket.IO initialized via `socketServer.js`

## 6) Run tests

- `npm test`

Recommended additional suites as implementation expands:

- Unit tests: `tests/unit/**`
- Integration tests: `tests/integration/**`
- Concurrency tests for schedule overlap prevention

## 7) API contract usage

- Contract file: `specs/001-volleyball-academy-backend/contracts/openapi.yaml`
- Generate/preview docs via Swagger tooling already present in dependencies.

## 8) Minimal smoke checklist

1. Register and login user (`/api/v1/auth/register`, `/api/v1/auth/login`).
2. Create club/sport/court as admin.
3. Create a court booking.
4. Attempt overlapping booking on same court and verify `409 Conflict`.
5. Confirm notification record and Socket.IO event path for targeted recipients.
