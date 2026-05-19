---

description: "Task list for implementing Multi‑Sport Club & Court Management System"
---

# Tasks: Multi‑Sport Club & Court Management System

**Input**: Design documents from `/specs/001-volleyball-academy-backend/`  
**Prerequisites**: `plan.md` (required), `spec.md` (required), `research.md`, `data-model.md`, `contracts/openapi.yaml`, `quickstart.md`

**Tests**: Included because the feature specification defines user scenarios/testing expectations and measurable reliability criteria (e.g., concurrency correctness, RBAC enforcement).

**Organization**: Tasks are grouped by user story to enable independent implementation, validation, and incremental delivery.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies on incomplete tasks)
- **[Story]**: User story label (`[US1]`, `[US2]`, ...)
- Each task includes an exact file path

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Prepare project tooling and scaffolding for migration-first, contract-driven delivery.

 - [X] T001 Create feature scaffolding files in `migrations/.gitkeep`, `seeders/.gitkeep`, and `docs/openapi/README.md`
 - [X] T002 Configure migration/seed scripts and Sequelize CLI mapping in `package.json` and `.sequelizerc`
 - [X] T003 [P] Add environment template entries for new modules in `.env.example`
 - [X] T004 [P] Add Jest project-level config for unit/integration suites in `jest.config.js` and update setup in `tests/setup/testEnv.js`
 - [X] T005 [P] Bootstrap Swagger serving endpoint wiring in `app.js` and baseline spec include in `docs/openapi/base.yaml`
 - [X] T006 Normalize repository ignores for generated docs/migration artifacts in `.gitignore`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core platform primitives that MUST complete before user story implementation.

**⚠️ CRITICAL**: No user story phase should start before this phase is complete.

 - [X] T007 Implement API version prefix aggregation (`/api/v1`) in `app.js` and `Routes/index.js`
 - [X] T008 Create shared success response helper in `utils/httpResponse.js`
 - [X] T009 [P] Standardize error envelope and status/code mapping in `middlewares/globalErrorHandler.js` and `utils/ApiError.js`
 - [X] T010 [P] Harden JWT bearer validation and auth error paths in `middlewares/protect.js`
 - [X] T011 [P] Implement role-based guard middleware in `middlewares/roleGuard.js`
 - [X] T012 [P] Implement club scope guard middleware in `middlewares/clubScopeGuard.js`
 - [X] T013 Add shared pagination/query parsing utility in `utils/pagination.js`
 - [X] T014 [P] Refactor central model registration/associations in `Models/index.js`
 - [X] T015 Switch DB bootstrap to migration-first behavior in `config/database.js` and `server.js`
 - [X] T016 [P] Implement shared schedule conflict utility in `Services/scheduleConflictService.js`
 - [X] T017 [P] Normalize validator error formatting in `middlewares/validatorMiddleware.js`
 - [X] T018 Add reusable authenticated test helpers in `tests/helpers/auth.js` and `tests/setup/testEnv.js`

**Checkpoint**: Foundation complete — user story work can now proceed.

---

## Phase 3: User Story 1 – Registration & Admin Approval (Priority: P1) 🎯 MVP

**Goal**: Create secure registration plus initial club membership application/approval workflow.

**Independent Test**: A new user can register, apply to join a club, and an admin can approve the membership with correct status transitions.

 - [X] T019 [P] [US1] Add integration tests for registration + membership apply/approve flow in `tests/integration/auth/registerMembership.integration.test.js`
 - [X] T020 [US1] Extend registration fields/validation in `Models/user.js`
 - [X] T021 [P] [US1] Create membership model and associations in `Models/Membership.js` and `Models/index.js`
 - [X] T022 [US1] Implement registration workflow in `Services/authService.js` and `Controllers/authController.js`
 - [X] T023 [US1] Implement membership apply/decision APIs in `Controllers/membershipController.js` and `Routes/membershipRoutes.js`
 - [X] T024 [US1] Add registration and membership validators in `utils/validators/authValidator.js` and `utils/validators/membershipValidator.js`

---

## Phase 4: User Story 2 – Login & Role‑Based Access Control (Priority: P1)

**Goal**: Enforce login and role/scope-based authorization across protected routes.

**Independent Test**: Valid users receive JWT; guest/member/admin access matrix yields expected 401/403 behavior including cross-club denial for club admins.

 - [X] T025 [P] [US2] Add integration tests for login and RBAC denial matrix in `tests/integration/auth/rbac.integration.test.js`
 - [X] T026 [US2] Implement role/scope aware JWT login payload in `Services/authService.js`
 - [X] T027 [US2] Apply route-level role guards in `Routes/authRoutes.js`, `Routes/clubRoutes.js`, `Routes/courtRoutes.js`, `Routes/bookingRoutes.js`, `Routes/matchRoutes.js`, and `Routes/index.js`
 - [X] T028 [P] [US2] Enforce club-admin scope checks in `middlewares/clubScopeGuard.js`, `Services/clubService.js`, `Services/courtService.js`, `Services/bookingService.js`, and `Services/matchService.js`
 - [X] T029 [US2] Add permission matrix constants in `config/constants.js`
 - [X] T030 [US2] Align auth/RBAC contract definitions in `specs/001-volleyball-academy-backend/contracts/openapi.yaml`

---

## Phase 5: User Story 3 – Password Reset (Priority: P1)

**Goal**: Provide OTP-based verification and secure password reset lifecycle.

**Independent Test**: User can request OTP/reset token, verify, reset password, and old credentials become invalid as expected.

 - [X] T031 [P] [US3] Add integration tests for OTP and reset flow in `tests/integration/auth/passwordReset.integration.test.js`
 - [X] T032 [US3] Implement OTP generation/expiry persistence in `Services/authService.js` and `Models/user.js`
 - [X] T033 [US3] Implement forgot/reset token lifecycle in `Services/authService.js` and `Controllers/authController.js`
 - [X] T034 [P] [US3] Add auth endpoint rate limiting middleware in `middlewares/rateLimitAuth.js` and wire in `Routes/authRoutes.js`
 - [X] T035 [US3] Add password reset validators in `utils/validators/authValidator.js`

---

## Phase 6: User Story 15 – Multi‑Sport Club & Court Management (Priority: P1)

**Goal**: Enable club/sport/court CRUD and conflict-safe court bookings.

**Independent Test**: Admin can create clubs/sports/courts; users can book courts; overlapping and sport-incompatible scheduling is rejected.

 - [X] T036 [P] [US15] Add integration tests for club/sport/court CRUD and booking conflicts in `tests/integration/courts/clubCourtBooking.integration.test.js`
 - [X] T037 [US15] Create club/sport/court core models in `Models/Club.js`, `Models/Sport.js`, `Models/ClubSport.js`, `Models/Court.js`, and `Models/CourtSupportedSport.js`
 - [X] T038 [US15] Create booking model/associations in `Models/CourtBooking.js` and `Models/index.js`
 - [X] T039 [US15] Add core domain migrations in `migrations/001-create-clubs.js`, `migrations/002-create-sports.js`, `migrations/003-create-club-sports.js`, `migrations/004-create-courts.js`, `migrations/005-create-court-supported-sports.js`, and `migrations/006-create-court-bookings.js`
 - [X] T040 [US15] Implement club and court services with compatibility checks in `Services/clubService.js` and `Services/courtService.js`
 - [X] T041 [US15] Implement transactional booking overlap enforcement in `Services/bookingService.js` and `Services/scheduleConflictService.js`
 - [X] T042 [US15] Expose club/sport/court/booking endpoints in `Controllers/clubController.js`, `Controllers/courtController.js`, `Controllers/bookingController.js`, `Routes/clubRoutes.js`, `Routes/courtRoutes.js`, and `Routes/bookingRoutes.js`
 - [X] T043 [P] [US15] Add validators for club/sport/court/booking payloads in `utils/validators/clubValidator.js`, `utils/validators/courtValidator.js`, and `utils/validators/bookingValidator.js`

---

## Phase 7: User Story 4 – Admin Member Management (Priority: P2)

**Goal**: Allow admins to manage memberships and member lifecycle by scope.

**Independent Test**: Admin can approve/reject/activate/deactivate members within authorized clubs; super_admin can operate across clubs.

- [ ] T044 [P] [US4] Add integration tests for admin membership decisions in `tests/integration/memberships/adminMembershipManagement.integration.test.js`
- [ ] T045 [US4] Implement membership decision workflows in `Services/membershipService.js`
- [ ] T046 [US4] Implement admin membership APIs in `Controllers/membershipController.js` and `Routes/membershipRoutes.js`
- [ ] T047 [US4] Add membership transition validators in `utils/validators/membershipValidator.js`

---

## Phase 8: User Story 5 – Match Scheduling & Management (Priority: P2)

**Goal**: Schedule matches on courts, enforce conflicts, and capture results.

**Independent Test**: Admin can schedule non-overlapping compatible matches and submit results for completed matches.

- [ ] T048 [P] [US5] Add integration tests for match scheduling/results/conflicts in `tests/integration/matches/matchScheduling.integration.test.js`
- [ ] T049 [US5] Create match model and associations in `Models/Match.js` and `Models/index.js`
- [ ] T050 [US5] Add match migration with court/sport constraints in `migrations/007-create-matches.js`
- [ ] T051 [US5] Implement match service for scheduling and result capture in `Services/matchService.js`
- [ ] T052 [US5] Implement match controllers/routes in `Controllers/matchController.js` and `Routes/matchRoutes.js`
- [ ] T053 [P] [US5] Implement snake-draft utility in `utils/teamDraft.js` and integrate in `Services/matchService.js`
- [ ] T054 [US5] Add match validators in `utils/validators/matchValidator.js`

---

## Phase 9: User Story 6 – Match Registration, Waiting List & Penalties (Priority: P2)

**Goal**: Manage match registrations with waitlist auto-promotion and withdrawal penalties.

**Independent Test**: Users register until capacity, overflow joins waitlist, withdrawal promotes waitlisted users, and penalties are tracked.

- [ ] T055 [P] [US6] Add integration tests for waitlist promotion and penalties in `tests/integration/matches/matchRegistrationWaitlist.integration.test.js`
- [ ] T056 [US6] Create registration model/migration in `Models/MatchRegistration.js` and `migrations/008-create-match-registrations.js`
- [ ] T057 [US6] Implement registration/waitlist/penalty logic in `Services/matchRegistrationService.js`
- [ ] T058 [US6] Implement registration endpoints in `Controllers/matchRegistrationController.js` and `Routes/matchRoutes.js`
- [ ] T059 [US6] Add registration validators in `utils/validators/matchRegistrationValidator.js`

---

## Phase 10: User Story 7 – Training Sessions (Priority: P2)

**Goal**: Provide court-bound training session scheduling and registration.

**Independent Test**: Admin can create training sessions with capacity, users can register, and waitlist behavior works like matches.

- [ ] T060 [P] [US7] Add integration tests for training creation/registration/waitlist in `tests/integration/trainings/trainingSessions.integration.test.js`
- [ ] T061 [US7] Create training models/migrations in `Models/Training.js`, `Models/TrainingRegistration.js`, `migrations/009-create-trainings.js`, and `migrations/010-create-training-registrations.js`
- [ ] T062 [US7] Implement training service workflows in `Services/trainingService.js`
- [ ] T063 [US7] Implement training controllers/routes/validators in `Controllers/trainingController.js`, `Routes/trainingRoutes.js`, and `utils/validators/trainingValidator.js`

---

## Phase 11: User Story 8 – Events & Participation (Priority: P2)

**Goal**: Manage club events with capacity-aware participation and waitlist.

**Independent Test**: Users can join events until capacity, overflow to waitlist, and event status/payment placeholder fields are maintained.

- [ ] T064 [P] [US8] Add integration tests for event sign-up and waitlist in `tests/integration/events/eventsParticipation.integration.test.js`
- [ ] T065 [US8] Create event models/migrations in `Models/Event.js`, `Models/EventParticipant.js`, `migrations/011-create-events.js`, and `migrations/012-create-event-participants.js`
- [ ] T066 [US8] Implement event service with payment placeholder handling in `Services/eventService.js`
- [ ] T067 [US8] Implement event controllers/routes/validators in `Controllers/eventController.js`, `Routes/eventRoutes.js`, and `utils/validators/eventValidator.js`

---

## Phase 12: User Story 14 – Admin Panel Support APIs (Priority: P2)

**Goal**: Provide admin-oriented APIs with club-aware visibility for panel use.

**Independent Test**: `club_admin` receives scoped data while `super_admin` can view global operational data.

- [ ] T068 [P] [US14] Add integration tests for admin panel scoping in `tests/integration/admin/adminPanelScoping.integration.test.js`
- [ ] T069 [US14] Implement admin aggregate/list services in `Services/adminService.js` and `Controllers/adminController.js`
- [ ] T070 [US14] Register admin routes with guards in `Routes/adminRoutes.js` and `Routes/index.js`
- [ ] T071 [US14] Add admin query validators in `utils/validators/adminValidator.js`

---

## Phase 13: User Story 9 – CMS Static Content & External Links (Priority: P3)

**Goal**: Support club-scoped static pages and curated external links.

**Independent Test**: Admin can CRUD content/links per club with sanitized HTML and attachment support for annual plan pages.

- [ ] T072 [P] [US9] Add integration tests for CMS content and links CRUD in `tests/integration/content/cmsContent.integration.test.js`
- [ ] T073 [US9] Create content models/migrations in `Models/StaticPage.js`, `Models/ExternalLink.js`, `migrations/013-create-static-pages.js`, and `migrations/014-create-external-links.js`
- [ ] T074 [US9] Implement content service/controllers/routes in `Services/contentService.js`, `Controllers/contentController.js`, and `Routes/contentRoutes.js`
- [ ] T075 [US9] Add HTML sanitization and attachment handling in `middlewares/uploadMiddleware.js` and `utils/sanitizeHtml.js`

---

## Phase 14: User Story 10 – Player Evaluation (Priority: P3)

**Goal**: Capture 1–5 star player evaluations after matches with visibility controls.

**Independent Test**: Admin can rate players post-match, players can view their own ratings, and others remain hidden by policy.

- [ ] T076 [P] [US10] Add integration tests for player rating visibility in `tests/integration/ratings/playerEvaluation.integration.test.js`
- [ ] T077 [US10] Create player rating model/migration in `Models/PlayerRating.js` and `migrations/015-create-player-ratings.js`
- [ ] T078 [US10] Implement rating services/controllers/routes in `Services/playerRatingService.js`, `Controllers/playerRatingController.js`, and `Routes/playerRatingRoutes.js`
- [ ] T079 [US10] Add rating validators and visibility guards in `utils/validators/playerRatingValidator.js` and `middlewares/roleGuard.js`

---

## Phase 15: User Story 11 – Motivational Points System (Priority: P3)

**Goal**: Manage points accrual, rewards catalog, and redemption approval workflow.

**Independent Test**: Points are recorded with source tags, users can request reward redemption, and admins can approve/reject requests.

- [ ] T080 [P] [US11] Add integration tests for points and redemptions in `tests/integration/points/pointsRedemption.integration.test.js`
- [ ] T081 [US11] Create points/reward/redemption models+migrations in `Models/PointsLedger.js`, `Models/Reward.js`, `Models/Redemption.js`, `migrations/016-create-points-ledger.js`, `migrations/017-create-rewards.js`, and `migrations/018-create-redemptions.js`
- [ ] T082 [US11] Implement points and redemption services in `Services/pointsService.js` and `Services/redemptionService.js`
- [ ] T083 [US11] Implement points/reward/redemption controllers/routes/validators in `Controllers/pointsController.js`, `Routes/pointsRoutes.js`, and `utils/validators/pointsValidator.js`

---

## Phase 16: User Story 12 – Surveys & Feedback (Priority: P3)

**Goal**: Support club surveys, basic aggregation, FAQs, and private questions.

**Independent Test**: Admin can publish surveys and retrieve aggregate summaries; users can submit responses and private questions.

- [ ] T084 [P] [US12] Add integration tests for survey response and aggregation in `tests/integration/surveys/surveysFeedback.integration.test.js`
- [ ] T085 [US12] Create survey/feedback models+migrations in `Models/Survey.js`, `Models/SurveyQuestion.js`, `Models/SurveyResponse.js`, `Models/FAQ.js`, `Models/PrivateQuestion.js`, `migrations/019-create-surveys.js`, `migrations/020-create-survey-questions.js`, `migrations/021-create-survey-responses.js`, `migrations/022-create-faqs.js`, and `migrations/023-create-private-questions.js`
- [ ] T086 [US12] Implement survey and feedback services in `Services/surveyService.js` and `Services/feedbackService.js`
- [ ] T087 [US12] Implement survey/FAQ/private-question controllers/routes/validators in `Controllers/surveyController.js`, `Routes/surveyRoutes.js`, and `utils/validators/surveyValidator.js`

---

## Phase 17: User Story 13 – Push Notifications (Priority: P3)

**Goal**: Deliver targeted notifications with durable in-app history and real-time fanout.

**Independent Test**: Admin/system events create persisted notifications, recipients can list unread/read items, and connected users receive Socket.IO events.

- [ ] T088 [P] [US13] Add integration tests for notification targeting and retrieval in `tests/integration/notifications/notifications.integration.test.js`
- [ ] T089 [US13] Create notification models/migrations in `Models/Notification.js`, `Models/NotificationRecipient.js`, `migrations/024-create-notifications.js`, and `migrations/025-create-notification-recipients.js`
- [ ] T090 [US13] Implement notification persistence and targeting service in `Services/notificationService.js`
- [ ] T091 [US13] Implement notification APIs and validators in `Controllers/notificationController.js`, `Routes/notificationRoutes.js`, and `utils/validators/notificationValidator.js`
- [ ] T092 [US13] Implement authenticated Socket.IO room fanout in `socketServer.js` and `sockets/notificationSocket.js`

---

## Phase 18: User Story 16 – Points & Booking Interaction (Priority: P3)

**Goal**: Award booking-based points when club settings permit.

**Independent Test**: Completing eligible bookings creates `points_ledger` records with `source=booking`; disabled clubs do not receive booking-based points.

- [ ] T093 [P] [US16] Add integration tests for booking-based points in `tests/integration/points/bookingPoints.integration.test.js`
- [ ] T094 [US16] Extend booking completion points hooks in `Services/bookingService.js` and `Services/pointsService.js`
- [ ] T095 [US16] Add/validate booking points toggle handling in `Models/Club.js`, `Services/clubService.js`, and `Controllers/clubController.js`

---

## Phase 19: Polish & Cross-Cutting Concerns

**Purpose**: Complete hardening, performance, documentation, and smoke validation.

- [ ] T096 [P] Add performance indexes and tuning migration in `migrations/026-add-schedule-and-notification-indexes.js`
- [ ] T097 [P] Harden security middleware defaults in `app.js` and `config/constants.js`
- [ ] T098 Reconcile OpenAPI contract coverage with delivered endpoints in `specs/001-volleyball-academy-backend/contracts/openapi.yaml`
- [ ] T099 [P] Add cross-story smoke suite in `tests/integration/smoke/endToEndSmoke.integration.test.js`
- [ ] T100 Validate quickstart and update developer guidance in `specs/001-volleyball-academy-backend/quickstart.md` and `README.md`

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1 (Setup)**: starts immediately.
- **Phase 2 (Foundational)**: depends on Phase 1 and blocks all story phases.
- **Phase 3+ (Story phases)**: depend on Phase 2 completion.
- **Phase 19 (Polish)**: depends on all targeted story phases.

### User Story Delivery Order (recommended)

1. **P1**: US1 → US2 → US3 → US15
2. **P2**: US4 → US5 → US6 → US7 → US8 → US14
3. **P3**: US9 → US10 → US11 → US12 → US13 → US16

### Story Dependency Notes

- **US1** depends on foundational auth/model setup only.
- **US2** depends on US1 user identity paths and foundational guards.
- **US3** depends on US1/US2 auth primitives.
- **US15** depends on US2 RBAC and foundational scheduling utility.
- **US4** depends on US1 membership model and US2 RBAC.
- **US5** depends on US15 courts/sports.
- **US6** depends on US5 match domain.
- **US7** depends on US15 court domain.
- **US8** depends on US15 club/court context.
- **US14** depends on US2 RBAC and at least one domain module (US4/US5/US8).
- **US9** depends on US2 RBAC only.
- **US10** depends on US5 matches.
- **US11** depends on US15 (club context) and integrates with US5/US7 events.
- **US12** depends on US2 RBAC only.
- **US13** depends on US2 auth/RBAC and domain emitters.
- **US16** depends on US11 points and US15 bookings.

---

## Parallel Opportunities

### Cross-Phase Parallelizable Items

- Setup: T003, T004, T005 can run concurrently after T001/T002 planning.
- Foundational: T009, T010, T011, T012, T014, T016, T017 can be split among contributors.
- Polish: T096, T097, T099 can run in parallel.

### Per-Story Parallel Examples

- **US1**: T019 and T021 can run in parallel.
- **US2**: T025 and T028 can run in parallel.
- **US3**: T031 and T034 can run in parallel.
- **US15**: T036 and T043 can run in parallel after model scaffolding starts.
- **US4**: T044 can run while T045 is drafted.
- **US5**: T048 and T053 can run in parallel.
- **US6**: T055 can run while T056 model skeleton is created.
- **US7**: T060 can run while T061 model files are scaffolded.
- **US8**: T064 can run while T065 model files are scaffolded.
- **US14**: T068 and T071 can run in parallel.
- **US9**: T072 and T075 can run in parallel.
- **US10**: T076 and T079 can run in parallel.
- **US11**: T080 and T081 can run in parallel.
- **US12**: T084 and T085 can run in parallel.
- **US13**: T088 and T092 can run in parallel.
- **US16**: T093 and T095 can run in parallel.

---

## Implementation Strategy

### MVP First (Minimum Valuable Increment)

1. Complete **Phase 1** and **Phase 2**.
2. Complete **US1 only** (Phase 3).
3. Validate registration + membership approval end-to-end.
4. Demo/deploy MVP slice before expanding scope.

### Incremental Expansion

1. Add remaining **P1** stories (US2, US3, US15).
2. Add **P2** operational stories (US4–US8, US14).
3. Add **P3** enhancement stories (US9–US13, US16).
4. Finish with **Phase 19** cross-cutting hardening.

### Team Parallel Strategy

- Team jointly completes Setup + Foundational.
- Then split by story pods:
  - Pod A: auth/membership (US1–US4)
  - Pod B: court/match/training/event (US15, US5–US8)
  - Pod C: content/points/surveys/notifications (US9–US13, US16)
- Merge only after each story’s independent test criteria pass.

---

## Notes

- All tasks follow strict checklist format: checkbox + task ID + optional `[P]` + story label where required + explicit file path.
- `[USx]` labels are applied only to user story phases.
- Story phases are designed to be independently verifiable and incrementally shippable.
- Execute in order unless a task is explicitly marked `[P]` and dependencies are satisfied.
