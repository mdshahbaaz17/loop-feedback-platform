# Backend Daily Changelog

This document tracks daily progress on the backend architecture and implementation, including short explanations of *why* and *how* things were built, to serve as a learning reference.

---

## Day 1 - 2026-08-08

### 1. Architecture & Setup
- **What we did:** Separated the backend logic into a dedicated Express application (`backend/` folder) with an MVC (Model-View-Controller) structure (`src/routes`, `src/controllers`, `src/middleware`).
- **Why we did it:** The original project plan assumed everything was built in one Next.js app. Since we decided to split the frontend and backend to follow a traditional separation of concerns, the backend needs its own independent structure. The MVC pattern keeps the codebase organized: routes handle URLs, controllers handle the business logic, and middleware handles security/checks.
- **How we did it:** We created a `src/index.ts` file as the main server entry point, then linked the `routes` to it. We updated `package.json` to use `tsx` (TypeScript Execute) so the server can run without needing to manually compile TypeScript to JavaScript every time.

### 2. Authentication
- **What we did:** Replaced `NextAuth` with custom JSON Web Token (JWT) authentication. We built endpoints for `signup` and `login`.
- **Why we did it:** NextAuth is specifically designed to run seamlessly inside Next.js. Because our backend is now a standalone Express API, we can't easily use NextAuth. We must issue our own JWTs—cryptographically signed tokens that the frontend can store and send back to us to prove the user is logged in.
- **How we did it:** 
  - We used `bcryptjs` to securely hash user passwords before saving them to the database (never store plain-text passwords!).
  - We used `jsonwebtoken` to generate a token containing the user's ID when they log in.
  - We created a custom `auth.ts` middleware function. Every time a request hits a protected route, this middleware checks the HTTP `Authorization` header for a valid token and rejects unauthorized users.

### 3. Core Features (Feedback CRUD)
- **What we did:** Created a `feedback.controller.ts` file with endpoints to `GET` (fetch) and `POST` (create) feedback.
- **Why we did it:** Feedback is the core entity of the LOOP platform. We need basic CRUD (Create, Read, Update, Delete) APIs so the frontend dashboard can actually display and submit feedback.
- **How we did it:** We used the Prisma ORM to query the database. For `POST`, we use the `zod` library to strictly validate that the incoming data (content, source, sentiment) is formatted correctly before we attempt to save it to Postgres.

### 4. Database & Prisma v7 Upgrade
- **What we did:** Upgraded the database configuration to strictly support **Prisma v7**, and centralized the Prisma connection into a single `src/lib/prisma.ts` file.
- **Why we did it:** Prisma recently released version 7, which fundamentally changed how database URLs are configured. It now requires driver adapters and a `prisma.config.ts` file. Furthermore, creating a `new PrismaClient()` on every API request is a bad practice because it exhausts the database connection pool. 
- **How we did it:** 
  - We removed the `url` from `schema.prisma` and created `prisma.config.ts` to manage the connection.
  - We installed `@prisma/adapter-pg` to handle the low-level PostgreSQL driver communication.
  - We created a singleton in `src/lib/prisma.ts`. A singleton ensures that only *one* Prisma connection is ever created and reused across the entire application, preventing database crashing under load.

---

## Day 2 - 2026-08-10

### 1. Role-Based Access Control (RBAC) & User Management
- **What we did:** Added `requireRole` middleware and endpoints for workspace user management (`GET /api/auth/me`, `GET /api/auth/users`, `POST /api/auth/users`, `PATCH /api/auth/users/:id/role`).
- **Why we did it:** Real-world SaaS platforms require role isolation so read-only users (VIEWER) cannot mutate or delete data, analysts (ANALYST) can manage content, and only administrators (ADMIN) can manage workspace membership and user roles. Server-side role enforcement is non-negotiable for tenant security.
- **How we did it:** Created a reusable `requireRole(allowedRoles: string[])` Higher-Order Middleware in `src/middleware/auth.ts`. On every request, it checks the user's decoded token payload against permitted roles and returns HTTP `403 Forbidden` if unauthorized.

### 2. Enhanced Feedback CRUD (Pagination, Search, Filtering & Ingestion)
- **What we did:** Upgraded `GET /api/feedback` to support pagination (`page`, `limit`), text search across content/source/customerLabel, and filtering by `sentiment`, `status`, `channel`, `themeId`, `startDate`, and `endDate`. Added `PATCH /api/feedback/:id` for status updates, `POST /api/feedback/import` for CSV bulk ingestion, and `POST /api/feedback/seed` for channel simulation.
- **Why we did it:** As feedback grows to hundreds or thousands of rows, fetching the entire database table on every page load destroys frontend performance and crashes mobile devices. Server-side pagination, strict Zod bulk-import validation, and granular filters are essential for high-throughput feedback platforms.
- **How we did it:** Used Prisma's `findMany` and `count` with `skip`, `take`, and structured `where` objects combining text search (`mode: 'insensitive'`) and relational `some` filters. Wrapped bulk CSV import in Zod schema array validation.

### 3. Workspace Scoped Themes & Trend Analytics
- **What we did:** Refactored the `Theme` schema model to enforce workspace scoping (`workspaceId` foreign key and `@@unique([workspaceId, name])`). Implemented `theme.controller.ts` with `GET /api/themes`, `POST /api/themes`, and `GET /api/themes/trends`.
- **Why we did it:** Feedback themes must be strictly isolated per workspace so Organization A never sees themes created by Organization B. Furthermore, product teams need to detect volume spikes (sudden surges in feedback) to proactively catch bugs or popular feature requests.
- **How we did it:** Built an automated trend calculation in `getThemeTrends` that compares feedback item counts in the current 7-day window against the prior 7-day period and flags spike alerts (`isSpike: true`) when volume jumps by 50%+ or reaches critical thresholds.

### 4. Database Seed Script & Schema Refinements
- **What we did:** Enhanced `schema.prisma` with `channel`, `customerLabel`, `sentimentScore`, and `confidence` fields. Created `prisma/seed.ts` to automatically populate 1 demo workspace ("Acme Corp"), 3 role-based users (`admin@acme.com`, `analyst@acme.com`, `viewer@acme.com`), 6 workspace themes, and 120+ historical feedback entries across a 30-day timeline.
- **Why we did it:** Mentors and evaluators need instant, reproducible data out-of-the-box without having to manually construct 100+ DB rows.
- **How we did it:** Configured `"prisma": { "seed": "tsx prisma/seed.ts" }` in `package.json` and wrote an asynchronous seeder that computes historical `createdAt` offsets and relational join records.

---

## Day 3 - 2026-08-12

### 1. Anthropic Claude AI Client & Zod Output Parsing
- **What we did:** Created a centralized AI service in `src/lib/ai.ts` using `@anthropic-ai/sdk` with strict Zod JSON output validation for classification, Q&A grounding, and executive report generation.
- **Why we did it:** Relying on unparsed raw LLM text outputs causes random runtime JSON parsing errors in production. Standardizing LLM prompts with explicit JSON schema instructions and Zod validation guarantees robust, type-safe integration across all AI endpoints.
- **How we did it:** Built helper functions (`classifyFeedback`, `generateAskLoopAnswer`, `generateVoCReport`) that send low-temperature prompts to `claude-3-5-sonnet-20241022` and validate JSON responses against Zod schemas, with analytical fallback handlers for offline/development environments.

### 2. Feedback AI Classification & Manual Reclassification (AI1)
- **What we did:** Added automatic AI classification on single feedback creation (`POST /api/feedback`), manual item reclassification (`POST /api/feedback/:id/reclassify`), and workspace batch backfill (`POST /api/feedback/backfill`).
- **Why we did it:** Ingested feedback needs instant sentiment analysis, sentiment scoring (-1.0 to 1.0), and automated theme matching so product teams don't have to manually tag hundreds of raw customer messages.
- **How we did it:** Evaluates incoming text against workspace themes, updates `sentiment` and `sentimentScore` in Postgres/SQLite, and creates relational `FeedbackTheme` records with confidence scores.

### 3. Ask LOOP Grounded Q&A / RAG Engine (AI3)
- **What we did:** Created the Ask LOOP engine in `src/lib/search.ts` and `src/controllers/ask.controller.ts` exposed at `POST /api/ask`.
- **Why we did it:** Ask LOOP is the most critical feature tested by mentors for hallucination. Mentors verify that Ask LOOP answers ONLY from retrieved workspace feedback and cites real items, refusing to fabricate plausible-sounding answers when context is absent.
- **How we did it:** Implemented multi-term weighted retrieval across `content`, `source`, `customerLabel`, and attached `themes`. Injected retrieved items into Claude with strict system-prompt grounding rules ("Answer ONLY using provided feedback... Cite item IDs in format [ID]").

### 4. Executive VoC Report Generation (AI4) & Schema Expansion
- **What we did:** Added the `Report` model to `schema.prisma` (`title`, `periodStart`, `periodEnd`, `summary`, `keyThemes`, `actionableInsights`, `workspaceId`, `createdById`). Built endpoints `POST /api/reports`, `GET /api/reports`, and `GET /api/reports/:id`.
- **Why we did it:** Generative AI should never invent quantitative metrics. Having the backend pre-compute real workspace statistics ensures reports reflect exact historical numbers while Claude writes executive narrative around the real data.
- **How we did it:** Computed date-range metrics (total volume, sentiment breakdown, top theme counts) in code, passed them to Claude for structured narrative generation, and persisted the resulting `Report` entity in the database.

---

## Day 4 - 2026-08-12

### 1. Centralized Error Handling Middleware
- **What we did:** Created `src/middleware/error.ts` and registered it at the end of the Express application stack in `src/index.ts`.
- **Why we did it:** Production Node.js APIs must handle unexpected exceptions, Zod validation errors, and Prisma database errors gracefully. Unhandled errors crash Node.js processes or leak sensitive internal stack traces to clients.
- **How we did it:** Built an Express error handler that inspects error types: Zod validation failures return HTTP 400 with field details, Prisma `P2025` returns HTTP 404, Prisma `P2002` returns HTTP 400, malformed JSON returns HTTP 400, and generic errors return HTTP 500 without leaking stack traces.

### 2. Multi-Tenant Isolation Audit & Verification
- **What we did:** Audited every query and endpoint across `Feedback`, `Theme`, `Report`, and `User` to ensure `workspaceId` is derived exclusively from the verified JWT payload (`req.user!.workspaceId`).
- **Why we did it:** Tenant isolation is the single most heavily tested requirement by project evaluators. Accepting client-supplied `workspaceId` parameters allows malicious users to tamper with requests and access another tenant's data.
- **How we did it:** Enforced server-side session derivation on all controllers. Cross-tenant access attempts return HTTP 404 Not Found to prevent resource enumeration.

### 3. Server-side RBAC Multi-Role Hardening Audit
- **What we did:** Hardened and audited server-side permission checks across `ADMIN`, `ANALYST`, and `VIEWER` roles using `requireRole` middleware.
- **Why we did it:** Security permissions must be enforced at the API route layer, not just by hiding UI components in the frontend browser.
- **How we did it:** Verified that `VIEWER` is restricted to read-only endpoints, `ANALYST` can manage content (feedback, themes, reports), and only `ADMIN` can manage workspace membership and user roles.

### 4. Production Readiness & Environment Configuration
- **What we did:** Created `backend/.env.example` with clean placeholder variables and updated `package.json` with production build (`npm run build`), start (`npm start`), seed (`npm run seed`), and test shortcuts (`npm run test:day3`, `npm run test:day4`).
- **Why we did it:** Ensures new developers or deployment pipelines (e.g. Vercel / Render / Railway) can clone the repository, run setup scripts, and deploy to production without missing configuration.

---

## Day 5 - 2026-08-13

### 1. HTTP Security Headers with Helmet & Configurable CORS
- **What we did:** Added `helmet` middleware for HTTP security header protection and configured dynamic `CORS_ORIGIN` support in `src/index.ts`.
- **Why we did it:** Web applications facing production traffic must defend against MIME-type sniffing, cross-site scripting (XSS), framing/clickjacking attacks, and unconstrained cross-origin resource sharing.
- **How we did it:** Registered `helmet({ contentSecurityPolicy: false })` to secure response headers while enabling Swagger UI rendering, and configured `cors({ origin: corsOrigin, credentials: true })`.

### 2. Multi-Tier API Rate Limiting Middleware
- **What we did:** Implemented `src/middleware/rateLimiter.ts` using `express-rate-limit` to apply tiered rate limits across the application (`apiLimiter`, `authLimiter`, `aiLimiter`).
- **Why we did it:** Public API endpoints require protection against Denial-of-Service (DoS) floods, credential brute-forcing, and API quota depletion on expensive Anthropic Claude calls (`/api/ask`, `/api/reports`).
- **How we did it:** Applied 100 req/15min on general APIs, 10 req/15min on authentication routes, and 15 req/15min on LLM generation routes. Requests exceeding thresholds return HTTP 429 Too Many Requests with standard `RateLimit-*` headers.

### 3. OpenAPI 3.0 & Interactive Swagger UI Documentation
- **What we did:** Built `src/lib/swagger.ts` using `swagger-jsdoc` and `swagger-ui-express`, exposing interactive API documentation at `/api/docs` and JSON spec at `/api/docs-json`.
- **Why we did it:** Developers and frontend engineers require clear, testable, and standardized documentation of all API routes, JWT security schemes, request parameters, and response schemas.
- **How we did it:** Defined OpenAPI 3.0 schemas for User, Feedback, Theme, Ask, and Report entities, configured Bearer JWT authorization, and mounted Swagger UI middleware on Express.

### 4. Security & OpenAPI Automated Test Suite
- **What we did:** Created `src/test_day5_security.ts` and registered `npm run test:day5` in `package.json`.
- **Why we did it:** Automated regression testing ensures security headers, rate limiters, CORS policies, and Swagger UI endpoints remain operational across future code changes.
- **How we did it:** Wrote asynchronous test assertions verifying HTTP 200 on Swagger HTML/JSON, Helmet header presence, CORS access controls, and rate limiter header responses.

---

## Day 6 - 2026-08-13

### 1. Workspace Analytics & Time-Series Sentiment Aggregation APIs
- **What we did:** Implemented `src/controllers/analytics.controller.ts` and `src/routes/analytics.routes.ts` exposing endpoints: `GET /api/analytics/overview`, `GET /api/analytics/sentiment-trend`, and `GET /api/analytics/channels`.
- **Why we did it:** Product managers and executives require aggregate workspace KPI metrics, historical sentiment score trends over time (days/weeks), and channel breakdown statistics to evaluate customer feedback trends at scale.
- **How we did it:** Enforced workspace session isolation (`req.user!.workspaceId`) and performed Prisma aggregate queries (`count`, `aggregate`, `groupBy`), computing positive/neutral/negative percentage ratios and date-grouped time-series data.

### 2. Recursive Input XSS Payload Sanitization Middleware
- **What we did:** Created `src/middleware/sanitize.ts` and registered it globally on all `/api` endpoints in `src/index.ts`.
- **Why we did it:** Prevent malicious script tags (`<script>`, `javascript:`, `onload=`) in user-submitted feedback content or titles from being saved to database or causing Cross-Site Scripting (XSS) in client applications.
- **How we did it:** Built recursive string traversal over `req.body` that strips executable script patterns before request payloads reach controllers or validation handlers.

### 3. Analytics OpenAPI 3.0 Documentation Updates
- **What we did:** Updated `src/lib/swagger.ts` with complete OpenAPI 3.0 path definitions and query parameter specifications for all `/api/analytics/*` endpoints.
- **Why we did it:** Ensures new analytics and trend APIs are immediately testable and documented in the interactive Swagger UI (`/api/docs`).
- **How we did it:** Added route specifications, query parameters (`days`), response models, and security schemes under the `Analytics` Swagger tag.

### 4. Day 6 Automated Verification Test Runner
- **What we did:** Created `src/test_day6_backend.ts` and registered `npm run test:day6` in `package.json`.
- **Why we did it:** Provides instant automated verification of workspace KPI calculations, time-series data generation, channel distributions, and input XSS sanitization.
- **How we did it:** Wrote end-to-end integration tests confirming HTTP 200 responses for all analytics routes and verifying that injected `<script>` tags are sanitized from stored content.

---

## Day 7 - 2026-08-19

### 1. Health Check Endpoint Enrichment & Uptime Tracking
- **What we did:** Updated `GET /health` in `src/index.ts` to return system health metadata including `uptime`, ISO `timestamp`, and `environment`.
- **Why we did it:** Cloud orchestrators (e.g. Docker, Kubernetes, AWS/Render health checks) and monitoring dashboards require lightweight probes to verify server responsiveness and uptime metrics without database overhead.
- **How we did it:** Extracted `process.uptime()` and formatted response payload `{ status: 'ok', timestamp, uptime, environment }`.

### 2. Backend Documentation & System OpenAPI Schemas
- **What we did:** Created a dedicated `backend/README.md` and added `/health` route definitions to `src/lib/swagger.ts` under the `System` tag.
- **Why we did it:** Provides developers and reviewers with immediate setup instructions, role permission matrices, testing scripts, and interactive Swagger API exploration.
- **How we did it:** Wrote Markdown documentation and registered OpenAPI 3.0 path definitions for system endpoints.
