# Feature Specification: Multi‑Sport Club & Court Management System

**Feature Branch:** `001-volleyball-academy-backend`  
**Created:** 2026-04-17  
**Last Updated:** 2026-04-26  
**Status:** Final Draft  
**Input:** Backend for a sports academy mobile app that manages multiple clubs, multiple sports (volleyball, football, swimming, etc.), courts/facilities, court bookings, matches, trainings, events, points, player evaluations, content, surveys, and notifications.  
**Scope:** Single organisation owning multiple clubs; multi‑sport with structured court booking and gamification; role‑based access including club admins.

## User Scenarios & Testing *(mandatory)*

### User Story 1 – Registration & Admin Approval (P1)
A new user signs up with phone + personal details and becomes a platform user.  
They can then join one or more clubs as a member, or interact with clubs (e.g., book a court) without membership.

**Acceptance Scenarios:**
1. **Given** an unregistered person, **When** they submit valid registration details, **Then** a `user` account is created, and they receive a `user_id`.
2. **Given** a registered user, **When** they apply to join a club (optional), **Then** a `membership` record is created with status `pending` (awaiting admin approval if required).
3. **Given** an admin (club_admin or super_admin), **When** they approve the membership, **Then** the user becomes an approved member of that club.

---

### User Story 2 – Login & Role‑Based Access Control (P1)
Roles: `guest`, `pending_member` (if club membership pending), `approved_member` (per club), `club_admin` (manages one club), `super_admin` (global oversight).

**Permission Matrix:**
- `guest`: view public content, matches, events, trainings (filtered by club if needed).
- `pending_member`: same as guest + limited actions (e.g., view own club applications).
- `approved_member`: register for matches/events/trainings, book courts, view own profile/points, receive notifications for their clubs.
- `club_admin`: full CRUD on courts, bookings, matches, trainings, events, members, points, and content for their assigned club(s).
- `super_admin`: same as club_admin but for all clubs, plus manage club creation and global settings.

**Acceptance Scenarios:**
1. **Given** valid credentials, **When** calling `POST /api/auth/login`, **Then** a JWT with roles/scopes is returned.
2. **Given** a guest, **When** accessing a member‑only endpoint, **Then** 401 Unauthorized.
3. **Given** a club_admin of club A, **When** trying to modify club B, **Then** 403 Forbidden.

---

### User Story 3 – Password Reset (P1)
*(unchanged: OTP flow; rate‑limited; bcrypt hashing)*

---

### User Story 4 – Admin Member Management (P2)
Admins can manage memberships per club: approve, reject, activate, deactivate.  
Admin can view all users and their memberships across clubs (super_admin) or within their club (club_admin).

---

### User Story 5 – Match Scheduling & Management (P2)
- Matches are always tied to a **court** and thus to a **club**.
- Statuses: `scheduled`, `cancelled`, `postponed`, `completed`.
- Basic match history: winner and score.
- Team formation: snake draft by rating; odd‑count benching.
- Manual adjustment: swap players between teams (no drag‑and‑drop).

**Acceptance Scenarios:**
1. **Given** a court with volleyball sport allowed, **When** admin creates a match on that court, **Then** the match is created.
2. **Given** a match scheduled on a court, **When** another admin tries to create another match overlapping on the same court, **Then** the system rejects with `409 Conflict`.
3. **Given** a completed match, **When** admin enters result, **Then** the match record stores winner and score.

---

### User Story 6 – Match Registration, Waiting List & Penalties (P2)
- Members register for matches belonging to their clubs (or as non‑members if explicitly allowed).
- Waiting‑list auto‑promotion on withdrawal.
- Simple penalty: track withdrawal count; flag warning/ban if threshold exceeded (per club configurable).

---

### User Story 7 – Training Sessions (P2)
- Training sessions are also court‑bound, with capacity.
- Registration with waiting list (same as matches).
- Attendance tracking deferred to later.

---

### User Story 8 – Events & Participation (P2)
- Events tied to a club (may use court or external location).
- Capacity with waiting list.
- Direct sign‑up (no admin approval).
- Payment schema present (status placeholder); no payment integration for v1.

---

### User Story 9 – CMS: Static Content & External Links (P3)
- Club‑scoped content: “About Us”, “Our Message”, internal system pages, annual plans.
- Rich text via sanitised HTML. Annual plan supports file attachments (PDF/image).
- External links (store, maps, WhatsApp, Instagram) are per club.

---

### User Story 10 – Player Evaluation (P3)
- 1‑5 star rating, updated after matches.
- Own rating visible to player; other players’ ratings hidden by default (configurable).
- No extra criteria for v1.

---

### User Story 11 – Motivational Points System (P3)
- Points are tied to a user within a club.
- Earning: manual (admin) + automatic for match win, attendance, and optionally court bookings.
- Redemption requires admin approval.
- Reward catalogue managed by admins per club.

---

### User Story 12 – Surveys & Feedback (P3)
- Surveys with optional anonymity, text, multiple choice, and rating scale questions.
- Basic aggregation (counts, averages) for admins; no export in v1.
- FAQs and private questions per club.

---

### User Story 13 – Push Notifications (P3)
- Club‑scoped: send to members of a club, match participants, or users with bookings.
- In‑app notification centre stores history (30‑90 days).
- No user preferences in v1.

---

### User Story 14 – Admin Panel (P2)
Web‑based panel for all admin endpoints, respecting the scoping (club_admin sees only their club).

---

### User Story 15 – Multi‑Sport Club & Court Management (P1)
Admins create clubs, define sports, add courts/facilities, manage court bookings by members, and enforce availability.

**Acceptance Scenarios:**
1. **Given** a super_admin, **When** they create a new club with name, location, and logo, **Then** the club appears.
2. **Given** a club, **When** a club_admin adds a sport with `players_per_team`, **Then** that sport is linked.
3. **Given** a sport linked to a club, **When** a court is created with `supported_sports` (many‑to‑many), capacity, and hourly price, **Then** it becomes available for scheduling.
4. **Given** a registered user (member or not), **When** they attempt to book a court for a time slot, **Then** the system creates a `CourtBooking` with status `confirmed` (auto‑confirm by default; optional admin approval later).
5. **Given** an existing booking/match/training on a court, **When** another booking or activity attempts to overlap, **Then** the system rejects it.
6. **Given** a club_admin, **When** they view court usage, **Then** they see the schedule (start/end times and types).
7. **Given** a match on a court requiring volleyball, **When** admin tries to schedule a football match on the same court (if not supported), **Then** the system rejects due to sport incompatibility.

---

### User Story 16 – Points & Booking Interaction (P3)
Users earn points automatically for match wins, attendance, and optionally for court bookings. Manual points by admins are also allowed. Points are always scoped to a club.

**Acceptance Scenario:**
1. **Given** a court booking by a user, **When** the booking is completed, **Then** the system may award points if that club has enabled booking‑based points (configurable). Points ledger records `source=booking`.

---

### Edge Cases (final)
- **Duplicate phone registration:** 409 Conflict.
- **Expired OTP:** rejection, new request required.
- **Match registration open time in past:** prevents registration.
- **Withdrawal after final roster:** apply penalty if threshold exceeded; promote from waiting list.
- **Insufficient points for redemption:** 400 Bad Request.
- **Survey with responses deleted:** soft‑delete, preserve data.
- **Concurrent match‑slot filling:** transactional, one main‑list slot awarded.
- **Deactivated user:** preserves points, cannot redeem until reactivated.
- **Court double‑booking:** transactional conflict detection; overlapping times for same court rejected.
- **Court capacity:** match/training cannot exceed court capacity (if enforced).
- **Sport incompatibility:** activity must match court’s supported sports.
- **Multiple club memberships:** user can join multiple clubs; membership status per club; permissions scoped accordingly.

## Requirements *(mandatory)*

### Functional Requirements

#### Authentication & RBAC
- **FR‑001:** User registration with name, phone, DOB, gender, password (min 8‑10 chars, 1 upper, 1 lower, 1 digit), optional profile picture (file upload, URL storage).
- **FR‑002:** Password hashing with bcrypt, rate‑limited login/reset endpoints.
- **FR‑003:** JWT authentication with roles: `guest`, `pending_member`, `approved_member`, `club_admin`, `super_admin`.
- **FR‑004:** OTP‑based password reset flow.
- **FR‑005:** Role‑based middleware enforcing permissions (guest: view public content; approved_member: register/book; club_admin: manage own club; super_admin: global).

#### Member & Membership Management
- **FR‑010:** Users can apply to join a club (membership record with status `pending`). Admins approve/reject.
- **FR‑011:** Admins can view members per club, deactivate/reactivate.
- **FR‑012:** A user can be a member of multiple clubs independently; no “transfer” needed.

#### Club, Sport & Court Management
- **FR‑100:** CRUD clubs (name, logo, location).
- **FR‑101:** CRUD sports (name, icon, `players_per_team`). Structured master data.
- **FR‑102:** Link sports to clubs (many‑to‑many, through `ClubSport`).
- **FR‑103:** CRUD courts per club. Attributes: name, club_id, `supported_sports` (many‑to‑many), capacity, `hourly_price`, location description, surface type (optional).
- **FR‑104:** System must prevent overlapping activities (matches, trainings, bookings) on the same court. Conflict detection based on time range.
- **FR‑105:** Every match, training, or court booking must reference a court; system validates that activity sport is compatible with court’s supported sports.

#### Court Booking (New)
- **FR‑110:** Registered users (members or non‑members) can create a `CourtBooking` for a specific court and time slot. Status `confirmed` by default, `cancelled` if withdrawn. Optional admin approval flag.
- **FR‑111:** Booking times must not overlap with any existing confirmed booking, match, or training on the same court.
- **FR‑112:** Booking attributes: user_id, court_id, start_time, end_time, status, optional notes.

#### Match Management
- **FR‑120:** Matches are created within a club and assigned to a court. Fields: name, date, time, required players, registration open time, fixed players.
- **FR‑121:** Match statuses: `scheduled`, `cancelled`, `postponed`, `completed`.
- **FR‑122:** Member registration and waiting list with auto‑promotion; withdrawal penalty tracking (flag if threshold exceeded).
- **FR‑123:** Final roster approval by admin.
- **FR‑124:** Team formation using snake draft by player ratings; manual swap allowed.
- **FR‑125:** Match result storage (winner, score) for completed matches.

#### Training Management
- **FR‑130:** Training sessions court‑bound, with capacity, registration and waiting list (same as matches).

#### Event Management
- **FR‑140:** Events with capacity, waiting list, direct sign‑up, and payment status placeholder.

#### Player Evaluation
- **FR‑150:** Admin assigns 1‑5 star rating per player after matches. Visible to the player only (others hidden by default).
- **FR‑151:** Ratings updated event‑driven (after match completion).

#### Motivational Points System
- **FR‑160:** Points scoped to (user, club). Ledger tracks source: `manual`, `match_win`, `attendance`, `booking`.
- **FR‑161:** Automatic awarding for match wins and attendances; configurable for bookings. Manual awarding by admin.
- **FR‑162:** Redemption via admin approval; reward catalogue CRUD per club.

#### CMS & External Links
- **FR‑170:** Club‑scoped static pages (About, Our Message, Internal System, Annual Plan). Rich text (HTML) and file upload support for annual plans.
- **FR‑171:** Club‑scoped external links (store, maps, WhatsApp, Instagram).

#### Surveys & Feedback
- **FR‑180:** Surveys with optional anonymity, question types (text, multiple choice, rating scale). Basic aggregation for admins.
- **FR‑181:** FAQ and private Q&A per club.

#### Notifications
- **FR‑190:** In‑app notification centre, stored in DB. History retention 30‑90 days.
- **FR‑191:** Push notifications triggered by match registration opening, new events, membership approval, match cancellation. Admin can send targeted messages to club members, booking users, or specific roles.

#### Admin Panel
- **FR‑200:** Web panel for super_admin and club_admin, with data scoping.

### Key Entities
- **User**: id, name, phone, DOB, gender, password_hash, profile_picture_url, createdat.
- **Club**: id, name, logo_url, location, settings.
- **Sport**: id, name, icon_url, players_per_team.
- **ClubSport**: club_id, sport_id.
- **Court**: id, club_id, name, capacity, hourly_price, surface_type, indoor/outdoor.
- **CourtSupportedSport**: court_id, sport_id (many‑to‑many).
- **Membership**: id, user_id, club_id, status (pending, approved, rejected, deactivated), joined_at.
- **CourtBooking**: id, court_id, user_id, start_time, end_time, status (confirmed, cancelled), createdat.
- **Match**: id, club_id, court_id, sport_id, name, date, time, required_players, registration_open_time, status, fixed_player_ids.
- **MatchRegistration**: id, match_id, user_id, status (main, waiting, withdrawn, confirmed), registration_time.
- **Training**: same pattern as Match.
- **Event**: similar with optional court.
- **PointsLedger**: id, user_id, club_id, amount, reason, source (manual, match_win, attendance, booking), timestamp.
- **Reward**: id, club_id, name, points_cost, description.
- **Redemption**: id, user_id, reward_id, status (pending, approved, rejected), createdat.
- **Survey**, **Question**, **SurveyResponse**, **FAQ**, **PrivateQuestion**, **StaticPage**, **ExternalLinks** – all club‑scoped (except global optional).
- **Notification**: id, club_id (nullable), target_type, target_users[], title, message, sent_at.

## Success Criteria *(mandatory)*

- **SC‑001:** Registration completion in < 2 minutes.
- **SC‑002:** Login response < 1 second.
- **SC‑003:** 100% of admin endpoints reject non‑admin roles.
- **SC‑004:** Match registration with waiting list handles 50 concurrent requests without race conditions.
- **SC‑005:** Admin creates a match in < 3 minutes.
- **SC‑006:** Push notifications delivered within 30s for 95% of recipients.
- **SC‑007:** Public GET endpoints respond p95 < 300 ms under expected load (100‑300 concurrent).
- **SC‑008:** System uptime 99.5%.
- **SC‑009:** No critical/high OWASP vulnerabilities.
- **SC‑010:** Admin panel usability: perform one action per domain in < 5 minutes after training.
- **SC‑011:** Admin can create club, sport, two courts, and schedule a match on one within 5 minutes.
- **SC‑012:** Double‑booking prevention 100% effective under concurrent attempts.
- **SC‑013:** Supports 50 clubs, 10 sports per club, 20 courts per club without performance degradation.
- **SC‑014:** Court booking conflict detection accurate to the minute; overlapping bookings rejected.

## Assumptions
- Single organisation owning multiple clubs (not a multi‑tenant SaaS marketplace).
- PostgreSQL primary database, Redis for caching optional.
- File storage for profile pictures and annual plan attachments (URLs in DB).
- Arabic + English with i18n structure; other languages deferred.
- No social login, payment gateway, or deep WhatsApp integration in v1.
- Attendance tracking deferred; court booking by members included.
- Points earning for bookings is configurable per club; default off.

## Out of Scope (v1)
- Social login.
- Payment gateway integration.
- WhatsApp Business API.
- Advanced analytics/export for surveys.
- Drag‑and‑drop team formation UI.
- Content versioning.
- Multi‑tenancy for independent organisations.
- Attendance tracking (training/event).
