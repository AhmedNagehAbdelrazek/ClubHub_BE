# Project Constitution: CourtHub – Multi‑Sport Club & Facility Management System

## 1. Project Identity
- **Name:** CourtHub (internal repo name may vary, but all docs reference "CourtHub").
- **Domain:** Backend API server for managing clubs, sports, courts, bookings, matches, training, events, motivational points, surveys, and notifications.
- **Users:** Super admins, club admins, approved members, pending members, and guests.
- **Language:** Node.js (CommonJS modules, not ESM, because your `package.json` and existing files use `require`).

## 2. Technology Stack (approved, mandatory)
- **Runtime:** Node.js (latest LTS compatible with your dependencies).
- **Web framework:** Express 5.x.
- **ORM:** Sequelize 6.x (`sequelize` + `pg` + `pg-hstore`).
- **Database:** PostgreSQL.
- **Authentication:** JWT (`jsonwebtoken`), bcrypt hashing.
- **Validation:** `express-validator`.
- **File uploads:** `multer` for local development; AWS S3 (`@aws-sdk/client-s3`) for production file storage.
- **Email/SMS:** Brevo (`@getbrevo/brevo`) via existing `EmailServices/Brevo`.
- **Real-time:** Socket.IO (`socket.io`) for notifications and chat.
- **Logging:** `morgan`.
- **Security:** `helmet`, `cors`.
- **Testing:** Jest (`jest`), Supertest (`supertest`).
- **Linting:** ESLint 10 (`@eslint/js`).
- **API docs:** Swagger (`swagger-jsdoc` + `swagger-ui-express`) – add to future phases.
- **Package manager:** npm (as per `package.json`).

## 3. Project Structure (existing – must be preserved)
The plan must respect and expand within this structure. No drastic re‑organizations unless explicitly required by a new feature and approved.

```
/
├── .github/                # CI/CD, Copilot instructions, Spec Kit agents & prompts
├── .specify/               # Spec Kit memory, templates, workflows
├── .vscode/                # Editor settings
├── config/
│   ├── config.js           # Environment‑specific configuration
│   ├── constants.js        # Application constants
│   └── database.js         # Sequelize instance & DB connection
├── Controllers/            # Route handlers (thin – delegate to Services)
├── middlewares/
│   ├── globalErrorHandler.js
│   ├── protect.js          # JWT authentication guard
│   ├── socketAuthentacation.js
│   ├── uploadMiddleware.js # Multer configuration
│   └── validatorMiddleware.js # Express‑validator error handler
├── Models/
│   ├── index.js            # Sequelize model initialization & associations
│   └── user.js             # (existing – will grow to many models)
├── Routes/
│   ├── index.js            # Route aggregation
│   └── authRoutes.js       # Authentication routes
├── Services/
│   ├── authService.js
│   └── EmailServices/
│       └── Brevo/
│           ├── SendEmail.js
│           └── SendSMS.js
├── sockets/
│   ├── chatSocket.js
│   └── notificationSocket.js
├── tests/
│   ├── helpers/
│   │   └── auth.js
│   ├── integration/
│   ├── setup/
│   │   └── testEnv.js
│   └── unit/
├── uploads/                # Local development file storage
├── utils/
│   ├── ApiError.js         # Custom error class
│   ├── dateRange.js
│   ├── GenerateOTP.js
│   ├── PickExistVars.js
│   ├── verifyCourseOwner.js
│   ├── verifyRole.js
│   └── validators/         # Reusable validation schemas
│       ├── authValidator.js
│       └── ...
├── app.js                  # Express app setup
├── server.js               # HTTP server + Socket.IO bootstrap
├── socketServer.js         # Socket.IO event handlers initialization
├── spec.md                 # Feature specification
├── package.json
├── .env
└── README.md
```

**Expansion rules:**
- Add new **Models** inside `./Models/` (one file per entity, e.g., `Club.js`, `Court.js`).
- Create new **Controllers** inside `./Controllers/` (e.g., `clubController.js`, `matchController.js`).
- Create new **Services** inside `./Services/` (e.g., `clubService.js`, `bookingService.js`).
- Add **Routes** in `./Routes/` (e.g., `clubRoutes.js`) and register them in `index.js`.
- Add **middleware** for new rules (e.g., `roleGuard.js`) in `./middlewares/`.
- Validation schemas go into `./utils/validators/`.
- Tests follow the same hierarchy inside `./tests/`.
- File naming: **camelCase** for files (e.g., `clubController.js`, `authRoutes.js`), **PascalCase** for Sequelize models (e.g., `Club.js`).

## 4. Coding Standards & Naming
- **Language:** JavaScript (CommonJS). Use `require`/`module.exports`. No `import`/`export`.
- **Functions:** Prefer `async/await` over raw promises. Wrap handlers in `express-async-handler` (already a dependency) or use explicit try/catch.
- **Naming conventions:**
  - Variables & functions: camelCase (`getUserById`, `matchDate`).
  - Classes (Sequelize models, services): PascalCase (`Club`, `AuthService`).
  - Constants: UPPER_SNAKE_CASE (`MAX_RETRY_COUNT`).
  - SQL tables: snake_case, plural (`club_admins`, `court_bookings`).
- **Error handling:**
  - Custom error class `ApiError` (already exists in `utils/ApiError.js`) for operational errors.
  - `globalErrorHandler.js` catches all errors and returns a consistent JSON structure.
- **Response format:** All successful responses use a standard envelope:
  ```json
  {
    "status": "success",
    "data": { ... }
  }
  ```
  **Errors:**
  ```json
  {
    "status": "error",
    "message": "Human-readable message",
    "code": "OPTIONAL_ERROR_CODE"
  }
  ```

## 5. Layered Architecture (mandatory)
**Strict separation of concerns:**
- **Routes:** Define endpoints, apply middlewares (auth, validation), call the controller method.
- **Controllers:** Parse request, call the corresponding service, send response. No business logic.
- **Services:** Contain all business logic, database queries (via Sequelize models), external API calls. Services may call other services.
- **Models:** Sequelize definitions, associations, and simple model‑level validations only. No business logic.
- **Middlewares:** Cross‑cutting concerns (auth, file upload, validation, error handling).

**Example flow:**  
`POST /api/matches/:id/register`  
→ `matchRoutes.js` (authenticate, validate)  
→ `matchController.register()`  
→ `matchService.registerPlayer()` (checks capacity, creates MatchRegistration, triggers notification)  
→ Returns response.

## 6. Database Rules
- **ORM:** Sequelize 6. Use Sequelize CLI for migrations (`sequelize-cli`) if needed, but manual model definitions are acceptable as long as they are consistent.
- **Associations:** Define all associations in a single setup file (likely `Models/index.js`). Use standard Sequelize associations (`belongsTo`, `hasMany`, `belongsToMany`, etc.).
- **Migrations:** All schema changes must be added via migration files. Never alter the DB directly.
- **Seeds:** For initial data (roles, sports, test clubs), use seed files.
- **Naming:**
  - Tables: `snake_case`, plural (`users`, `clubs`, `court_bookings`).
  - Columns: `snake_case` (`createdat`, `hourly_price`).
  - Foreign keys: `referenced_table_name_id` (e.g., `club_id`, `court_id`).
- **Timestamps:** Every table must include `createdat` and `updated_at` (Sequelize default).
- **Soft deletes:** For entities that users might need to restore (surveys, events), use `deleted_at` (paranoid mode).

## 7. Authentication & Authorization
- **Authentication:** JWT. `protect.js` middleware extracts user from token and attaches to `req.user`. Every protected route uses this middleware.
- **Authorization:** Role‑based. Create a `roleGuard.js` middleware that accepts allowed roles and returns 403 if not permitted.
- **Roles (per spec):** `guest`, `pending_member`, `approved_member`, `club_admin`, `super_admin`.
- **Club scoping:** `club_admin` can only interact with their assigned club(s). This scoping must be enforced in service layer (or via middleware checking `user.clubIds`).
- **Tokens:** Access tokens stored in Authorization header (`Bearer <token>`). Refresh tokens not required for v1.

## 8. API Design Conventions
- **Versioning:** `/api/v1/` prefix for all routes. (Add to route registration.)
- **RESTful URLs:** Plural nouns (`/api/v1/users`, `/api/v1/clubs/:id/courts`).
- **HTTP methods:** GET (read), POST (create), PUT (full update), PATCH (partial update), DELETE (remove).
- **Filtering & pagination:** Use query parameters (`?status=active&page=1&limit=20`). Always provide pagination for list endpoints.
- **Validation:** Use `express-validator` schemas in `utils/validators/`. Run validation in route layer before controller call. Use `validatorMiddleware.js` to format errors.
- **File uploads:** Use `multer` middleware. In routes, upload middleware applied before controller. Save files to local `uploads/` in development; in production, upload to S3 and store URL.

## 9. Real‑time Features (Socket.IO)
- Existing Socket.IO setup: `socketServer.js` initializes and imports handlers from `sockets/`.
- New socket events for real‑time notifications (match registration opened, new booking, etc.) must be implemented in the `sockets/` directory.
- Socket authentication via `socketAuthentication.js` (using JWT).

## 10. Testing Requirements
- **Framework:** Jest + Supertest.
- **Coverage target:** 80% for all service and utility functions. Controllers and socket logic tested via integration tests.
- **Test environment:** Use a separate test database (configure in `.env.test`). Run migrations before test suite.
- **Test organization:** Mirror the source structure inside `tests/`.
  - Unit tests: `tests/unit/services/`, `tests/unit/utils/`.
  - Integration tests: `tests/integration/routes/`, `tests/integration/sockets/`.
- **Helpers:** Reusable authentication helpers in `tests/helpers/auth.js`.

## 11. Git Workflow
- **Branches:** Feature branches from `main` (e.g., `feature/club-management`, `fix/booking-conflict`).
- **Commit messages:** Follow conventional commits (`feat:`, `fix:`, `chore:`, `docs:`, `test:`).
- **PRs:** Require at least one review before merging. CI must pass (lint, tests).

## 12. Documentation
- **API docs:** Maintain OpenAPI/Swagger specification using `swagger-jsdoc` annotations on route files. Keep docs in `./docs/` (create if needed).
- **Code comments:** Document complex logic; no need for trivial comments. Every service public method must have a JSDoc comment.
- **Environment variables:** All required environment variables must be documented in `.env.example`.

## 13. Environment Variables (.env)
- `NODE_ENV`
- `PORT`
- `DATABASE_URL` (or separate `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER`, `DB_PASSWORD`)
- `JWT_SECRET`
- `JWT_EXPIRES_IN`
- `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `AWS_REGION`, `S3_BUCKET`
- `BREVO_API_KEY`
- `CORS_ORIGIN`
- `UPLOAD_PATH` (default `./uploads`)

All secrets must be read from environment variables via `config/config.js`.

## 14. Spec Kit Integration
- The `spec.md` at root is the single source of truth for features.
- Use `/.speckit.*` commands to generate plans, tasks, and code.
- This constitution is stored at `.specify/memory/constitution.md` and must be respected by all AI agents.

## 15. Overriding Principles
- Simplicity over cleverness.
- Security first (validate all inputs, rate‑limit auth endpoints, hash passwords, never expose secrets).
- Consistency with existing codebase.
- Performance: Use database indices, avoid N+1 queries, paginate lists.
```
