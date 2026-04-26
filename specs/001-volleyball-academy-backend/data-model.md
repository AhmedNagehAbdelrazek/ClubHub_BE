# Data Model: Multi‑Sport Club & Court Management System

## Modeling Conventions

- Database: PostgreSQL via Sequelize.
- Naming: snake_case tables/columns, plural table names.
- IDs: UUID or big integer (implementation choice to be fixed per migration style), consistent across relations.
- Timestamps: `created_at`, `updated_at` on all tables.
- Soft delete (`deleted_at`) for recoverable entities (e.g., surveys/events/content where business requires restore/history).

## Core Entities

### 1) `users`

**Purpose**: Platform identity and authentication principal.

**Key fields**:
- `id` (PK)
- `name` (required, 2..100 chars)
- `phone` (required, unique, normalized)
- `dob` (nullable)
- `gender` (nullable enum)
- `password_hash` (required)
- `profile_picture_url` (nullable)
- `global_role` (enum: `user`, `super_admin`; default `user`)
- `is_active` (boolean, default true)

**Validation rules**:
- Phone uniqueness and format validation.
- Password policy enforced at write boundary (min length + upper/lower/digit).

### 2) `clubs`

**Purpose**: Organizational unit under the single owning organization.

**Key fields**:
- `id` (PK)
- `name` (required, unique per org)
- `logo_url` (nullable)
- `location` (required)
- `settings` (JSONB: policy flags such as booking points toggle)
- `is_active` (boolean)

### 3) `sports`

**Purpose**: Sport master data.

**Key fields**:
- `id` (PK)
- `name` (required, unique)
- `icon_url` (nullable)
- `players_per_team` (required, integer > 0)

### 4) `club_sports`

**Purpose**: Many-to-many relation between clubs and sports.

**Key fields**:
- `club_id` (FK → clubs)
- `sport_id` (FK → sports)

**Constraints**:
- Composite unique (`club_id`, `sport_id`).

### 5) `courts`

**Purpose**: Bookable/schedulable facilities belonging to clubs.

**Key fields**:
- `id` (PK)
- `club_id` (FK → clubs, required)
- `name` (required)
- `capacity` (required, integer > 0)
- `hourly_price` (required, decimal >= 0)
- `surface_type` (nullable)
- `location_description` (nullable)
- `is_indoor` (boolean)
- `is_active` (boolean)

**Constraints**:
- Unique court name per club (`club_id`, `name`).

### 6) `court_supported_sports`

**Purpose**: Many-to-many relation between courts and sports.

**Key fields**:
- `court_id` (FK → courts)
- `sport_id` (FK → sports)

**Constraints**:
- Composite unique (`court_id`, `sport_id`).

### 7) `memberships`

**Purpose**: Club-scoped user membership and role.

**Key fields**:
- `id` (PK)
- `user_id` (FK → users)
- `club_id` (FK → clubs)
- `status` (enum: `pending`, `approved`, `rejected`, `deactivated`)
- `club_role` (enum: `member`, `club_admin`; default `member`)
- `joined_at` (nullable until approved)
- `decision_at` (nullable)
- `decision_by` (FK → users, nullable)

**Constraints**:
- One membership record per user/club pair (`user_id`, `club_id`) with status updates over time.

### 8) `court_bookings`

**Purpose**: User-initiated court reservations.

**Key fields**:
- `id` (PK)
- `club_id` (FK → clubs; denormalized for indexing/scoping)
- `court_id` (FK → courts)
- `user_id` (FK → users)
- `sport_id` (FK → sports, nullable if booking doesn’t bind sport)
- `start_time` (required)
- `end_time` (required, > start)
- `status` (enum: `confirmed`, `cancelled`, `completed`)
- `notes` (nullable)
- `requires_admin_approval` (boolean, default false)

**Validation rules**:
- No overlap on same court with active occupancy windows.
- Time ranges are treated as `[start, end)`.

### 9) `matches`

**Purpose**: Scheduled matches tied to court + sport.

**Key fields**:
- `id` (PK)
- `club_id` (FK → clubs)
- `court_id` (FK → courts)
- `sport_id` (FK → sports)
- `name` (required)
- `start_time`, `end_time` (required)
- `required_players` (required, integer > 1)
- `registration_open_time` (required)
- `status` (enum: `scheduled`, `cancelled`, `postponed`, `completed`)
- `winner_team` (nullable)
- `score_summary` (nullable)

**Validation rules**:
- Court must support selected sport.
- Overlap prevention on same court for active statuses.

### 10) `match_registrations`

**Purpose**: Player registration and waitlist tracking per match.

**Key fields**:
- `id` (PK)
- `match_id` (FK → matches)
- `user_id` (FK → users)
- `status` (enum: `main`, `waiting`, `withdrawn`, `confirmed`)
- `registration_time` (required)
- `withdrawn_at` (nullable)

**Constraints**:
- Unique (`match_id`, `user_id`).

### 11) `trainings`

**Purpose**: Scheduled training sessions tied to court + sport.

**Key fields**:
- Similar to `matches` with training-specific metadata (`capacity`, optional trainer fields).
- `status` (enum: `scheduled`, `cancelled`, `completed`).

### 12) `training_registrations`

**Purpose**: Member registration and waitlist for trainings.

**Key fields**:
- `id` (PK)
- `training_id` (FK → trainings)
- `user_id` (FK → users)
- `status` (enum: `main`, `waiting`, `withdrawn`, `confirmed`)

### 13) `events`

**Purpose**: Club events with optional court association.

**Key fields**:
- `id` (PK)
- `club_id` (FK → clubs)
- `court_id` (nullable FK → courts)
- `title` (required)
- `description` (nullable)
- `location_text` (nullable)
- `start_time`, `end_time` (required)
- `capacity` (nullable)
- `status` (enum: `scheduled`, `cancelled`, `completed`)
- `payment_status_mode` (enum/flag placeholder)

### 14) `event_participants`

**Purpose**: User participation list for events.

**Key fields**:
- `id` (PK)
- `event_id` (FK → events)
- `user_id` (FK → users)
- `status` (enum: `main`, `waiting`, `cancelled`)

### 15) `points_ledger`

**Purpose**: Immutable points transactions per user/club.

**Key fields**:
- `id` (PK)
- `user_id` (FK → users)
- `club_id` (FK → clubs)
- `amount` (signed integer)
- `source` (enum: `manual`, `match_win`, `attendance`, `booking`, `redemption`)
- `reason` (text)
- `reference_type` / `reference_id` (nullable polymorphic link)
- `created_at`

### 16) `rewards`

**Purpose**: Club reward catalog for redemption.

**Key fields**:
- `id` (PK)
- `club_id` (FK → clubs)
- `name` (required)
- `points_cost` (required, integer > 0)
- `description` (nullable)
- `is_active` (boolean)

### 17) `redemptions`

**Purpose**: User redemption requests requiring admin decision.

**Key fields**:
- `id` (PK)
- `reward_id` (FK → rewards)
- `user_id` (FK → users)
- `club_id` (FK → clubs)
- `status` (enum: `pending`, `approved`, `rejected`)
- `requested_at`
- `decided_at` (nullable)
- `decided_by` (nullable FK → users)

### 18) `player_ratings`

**Purpose**: Per-player evaluation history after matches.

**Key fields**:
- `id` (PK)
- `club_id` (FK → clubs)
- `match_id` (FK → matches)
- `player_id` (FK → users)
- `rated_by` (FK → users)
- `stars` (integer 1..5)
- `comment` (nullable)

### 19) Content & survey entities

- `static_pages` (`club_id`, `type`, `title`, `content_html`, `attachment_url`)
- `external_links` (`club_id`, `store_url`, `maps_url`, `whatsapp_url`, `instagram_url`, ...)
- `surveys` (`club_id`, `title`, `is_anonymous`, `status`)
- `survey_questions` (`survey_id`, `type`, `prompt`, `options_json`)
- `survey_responses` (`survey_id`, `question_id`, `user_id nullable`, `value_text/value_number/value_json`)
- `faqs` and `private_questions` for club-scoped support content.

### 20) Notifications

- `notifications` (`id`, `club_id nullable`, `title`, `message`, `target_type`, `payload_json`, `sent_at`)
- `notification_recipients` (`notification_id`, `user_id`, `delivered_at`, `read_at`) for per-user delivery/read tracking.

## Relationship Summary

- User ↔ Club: many-to-many via `memberships`.
- Club ↔ Sport: many-to-many via `club_sports`.
- Court belongs to Club; Court ↔ Sport many-to-many via `court_supported_sports`.
- Booking/Match/Training/Event all belong to Club and reference Court when court-bound.
- Match/Training/Event participant tables link users to activities with status fields.
- Points, rewards, redemptions, surveys, content, notifications are club-scoped.

## State Transitions

### Membership

`pending` → `approved` | `rejected`  
`approved` → `deactivated`  
`deactivated` → `approved`

### Court Booking

`confirmed` → `cancelled`  
`confirmed` → `completed`

### Match

`scheduled` → `cancelled` | `postponed` | `completed`  
`postponed` → `scheduled` | `cancelled`

### Match Registration / Training Registration / Event Participation

`waiting` ↔ `main` (auto-promotion/demotion rules)  
`main` → `withdrawn` (match/training) or `cancelled` (event)

### Redemption

`pending` → `approved` | `rejected`

### Notification Recipient State

`delivered` → `read`

## Integrity & Indexing Notes

- Composite uniqueness:
  - memberships (`user_id`, `club_id`)
  - registrations (`match_id`, `user_id`) and equivalents for training/events
  - join tables (`club_id`, `sport_id`), (`court_id`, `sport_id`)
- Suggested indexes:
  - time-range query support on schedule tables by (`court_id`, `start_time`, `end_time`, `status`)
  - membership lookup by (`user_id`, `club_id`, `status`)
  - notifications by (`user_id`, `read_at`, `created_at`)
- Conflict handling:
  - scheduling writes must run in transactions with overlap checks and deterministic `409 Conflict` responses.
