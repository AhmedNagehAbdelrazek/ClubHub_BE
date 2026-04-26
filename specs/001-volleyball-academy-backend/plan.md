# Implementation Plan: Multi‑Sport Club & Court Management System

**Branch**: `001-volleyball-academy-backend` | **Date**: 2026-04-26 | **Spec**: `specs/001-volleyball-academy-backend/spec.md`  
**Input**: Feature specification from `/specs/001-volleyball-academy-backend/spec.md`

**Note**: This plan is produced by `/speckit.plan` and is the active execution context for subsequent `/speckit.tasks` work.

## Summary

Build a production-grade Node.js/Express backend for ClubHub that supports multi-club, multi-sport operations with court scheduling, bookings, matches, trainings, events, points, surveys, and notifications, while preserving current repository conventions. The implementation approach is a single-service architecture using Sequelize + PostgreSQL, strict layered boundaries (Routes → Controllers → Services → Models), club-scoped RBAC, transactional conflict prevention for court occupancy, and OpenAPI-first endpoint contracts.

## Technical Context

**Language/Version**: JavaScript on Node.js 20 LTS (CommonJS module system)  
**Primary Dependencies**: Express 5.2.1, Sequelize 6.37.8, pg 8.20.0, Socket.IO 4.8.3, jsonwebtoken 9.0.3, bcrypt 6.0.0, express-validator 7.3.1, multer 2.1.1, AWS SDK S3 3.1021.0, Jest 30.3.0, Supertest 7.2.2  
**Storage**: PostgreSQL (primary transactional DB), local `uploads/` in development, S3-backed file storage in production  
**Testing**: Jest + Supertest (unit/integration), including race-condition integration tests for schedule conflicts  
**Target Platform**: Linux-hosted API service (container or VM), consumed by mobile app + admin panel  
**Project Type**: Monolithic web-service with REST APIs and Socket.IO real-time channels  
**Performance Goals**: Login < 1s, public GET p95 < 300ms, push delivery for 95% recipients < 30s, overlap prevention under concurrent requests  
**Constraints**: Strict club-scoped RBAC, conflict-free court scheduling across bookings/matches/trainings, secure input validation, CommonJS-only consistency, stable response envelopes  
**Scale/Scope**: Up to 50 clubs, 10 sports per club, 20 courts per club, multi-membership users, high-write scheduling workflows  
**Open Clarifications**: None — all planning clarifications are resolved in `research.md`

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### Pre-Phase 0 Gate Assessment

| Gate | Status | Evidence |
|------|--------|----------|
| Approved stack alignment | PASS | Plan uses Node.js + Express + Sequelize + PostgreSQL + Socket.IO from constitution |
| Layered architecture preservation | PASS | New functionality is constrained to existing `Routes/`, `Controllers/`, `Services/`, `Models/`, `middlewares/`, and `utils/validators/` layout |
| Security-first design | PASS | JWT auth + role guards + express-validator + centralized `ApiError`/global error handling retained |
| Data integrity & migration discipline | PASS | Planning assumes migration-first schema changes, explicit FK/index strategy, and transactional conflict control |
| Testing and quality baseline | PASS | Jest + Supertest coverage strategy, plus concurrency tests for overlap/race paths |
| Documentation/environment governance | PASS | Contract artifact (`contracts/openapi.yaml`) + quickstart + `.env`-documented variables |

**Gate Result**: PASS. No constitutional violations identified.

### Post-Phase 1 Re-check

| Gate | Status | Evidence |
|------|--------|----------|
| Design artifacts remain constitution-compliant | PASS | `research.md`, `data-model.md`, `contracts/openapi.yaml`, and `quickstart.md` follow stack, structure, and security mandates |
| No unjustified complexity introduced | PASS | Single-service structure retained; no extra architectural layers added |

**Post-Design Gate Result**: PASS.

## Project Structure

### Documentation (this feature)

```text
specs/001-volleyball-academy-backend/
├── plan.md              # This file (/speckit.plan output)
├── research.md          # Phase 0 decisions
├── data-model.md        # Phase 1 entity/relationship design
├── quickstart.md        # Phase 1 execution guide
├── contracts/
│   └── openapi.yaml     # Phase 1 API contract
└── tasks.md             # Phase 2 output (/speckit.tasks)
```

### Source Code (repository root)

```text
config/
Controllers/
middlewares/
Models/
Routes/
Services/
sockets/
tests/
uploads/
utils/
app.js
server.js
socketServer.js

# Planned additions for this feature (within existing structure)
Controllers/          # clubController.js, courtController.js, bookingController.js, etc.
Models/               # Club.js, Sport.js, Court.js, Membership.js, CourtBooking.js, Match.js, ...
Routes/               # clubRoutes.js, courtRoutes.js, bookingRoutes.js, matchRoutes.js, ...
Services/             # clubService.js, bookingService.js, matchService.js, notificationService.js, ...
middlewares/          # roleGuard.js, clubScopeGuard.js (if split)
utils/validators/     # clubValidator.js, courtValidator.js, bookingValidator.js, ...
tests/unit/           # service + utility tests
tests/integration/    # route + scheduling concurrency tests
migrations/           # sequelize migration files (new)
seeders/              # bootstrap data (roles/sports/clubs) (new)
docs/                 # swagger artifacts (new)
```

**Structure Decision**: Keep a single backend service rooted at repository top-level, expanding only within the existing Node.js folder conventions and adding `migrations/`, `seeders/`, and `docs/` as supporting directories.

## Complexity Tracking

No constitutional violations or exception requests at planning time.
