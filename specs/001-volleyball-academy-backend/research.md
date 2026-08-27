# Phase 0 Research: Multi‑Sport Club & Court Management System

## Scope & Clarification Status

All Technical Context uncertainties are resolved for planning. No unresolved `NEEDS CLARIFICATION` items remain.

## Decisions

### 1) Scheduling conflict prevention across bookings/matches/trainings

**Decision**: Use a canonical occupancy model and transactional overlap validation for all court-bound activities, with PostgreSQL-backed guarantees and `409 Conflict` mapping on overlap violations.

**Rationale**: The feature requires conflict prevention across multiple activity types on the same court. A unified occupancy strategy avoids duplicated overlap logic and supports correct behavior under concurrency.

**Alternatives considered**:
- Per-entity overlap checks only in application code (rejected: race-prone under concurrent requests).
- Locks without canonical occupancy abstraction (rejected: harder to reason about across entity types).
- Separate scheduling services/microservices (rejected: unnecessary complexity for current monolith).

### 2) Club-scoped RBAC model

**Decision**: Enforce authorization using two layers: (a) global role (`super_admin` vs regular user) and (b) per-club membership/admin state in membership-related tables, validated in service-layer scope checks.

**Rationale**: The specification requires users to belong to multiple clubs with independent status/permissions, while allowing super-admin global access.

**Alternatives considered**:
- Single role field only on user (rejected: cannot represent per-club permissions).
- JWT-only authorization claims for club scopes (rejected: stale claims risk and token bloat).
- Policy engine adoption at this stage (rejected: deferred; current requirements can be satisfied with middleware + services).

### 3) API contract style

**Decision**: Define REST contracts via OpenAPI 3.0 with consistent success/error envelopes and explicit RBAC/security requirements per endpoint.

**Rationale**: The project already includes Swagger dependencies and needs stable contracts for both mobile and admin clients.

**Alternatives considered**:
- Ad-hoc endpoint docs in README (rejected: low maintainability).
- Contract generation from code-first decorators only (rejected: unnecessary framework migration).
- GraphQL (rejected: outside current stack direction).

### 4) Notification architecture

**Decision**: Keep durable in-app notifications in database and use Socket.IO for real-time fanout via authenticated rooms (user-level and club-level targeting).

**Rationale**: Push and in-app history are required; users may be offline, so persistence is mandatory while real-time updates improve UX.

**Alternatives considered**:
- Socket-only ephemeral notifications (rejected: no durable history).
- Full event bus introduction now (rejected: overkill for this phase).
- Polling-only notifications (rejected: poor responsiveness).

### 5) Migration-first database evolution

**Decision**: Use Sequelize migrations for all schema changes (models, constraints, indexes), and avoid relying on implicit runtime schema mutation for production feature rollout.

**Rationale**: The feature introduces many entities and constraints; deterministic migration history is needed for CI/CD and rollback safety.

**Alternatives considered**:
- `sync({ alter: true })` in production paths (rejected: nondeterministic and risky).
- Manual DB edits without migrations (rejected: unreproducible and error-prone).

### 6) Validation and error-handling standardization

**Decision**: Use `express-validator` schemas at route layer, service-level business validation for cross-entity rules, and centralized `ApiError` + `globalErrorHandler` for consistent error serialization.

**Rationale**: The constitution mandates layered separation and secure validation; this approach keeps routes thin and business rules testable.

**Alternatives considered**:
- Controller-heavy validation/business logic (rejected: violates layering).
- Model hooks for all business rules (rejected: reduced clarity for cross-domain workflows).

### 7) Testing strategy for concurrency-critical workflows

**Decision**: Add integration tests (Jest + Supertest) that issue concurrent scheduling/booking requests against the test database and assert deterministic overlap prevention.

**Rationale**: Core success criteria include concurrency correctness; only integration tests can validate transactional behavior end-to-end.

**Alternatives considered**:
- Unit tests only with mocked ORM (rejected: cannot prove race-condition safety).
- Manual load testing only (rejected: insufficient CI signal for correctness).

### 8) Incremental delivery strategy

**Decision**: Implement P1 domains first (auth/RBAC, clubs/sports/courts, bookings, scheduling constraints), then layer P2/P3 domains (events, points, surveys, notifications, admin panel support) on same architecture.

**Rationale**: Keeps deliverables independently testable and aligned with feature priorities in the spec.

**Alternatives considered**:
- Big-bang all-domain implementation (rejected: high integration risk).
- Frontend-first sequencing (rejected: this repository is backend-focused).
