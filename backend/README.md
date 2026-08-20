# LOOP Feedback Platform - Backend API

Production Express & TypeScript REST API service for the LOOP Feedback Platform.

## 🌟 Key Features

- **Authentication & RBAC**: JWT-based session security with multi-tier role authorization (`ADMIN`, `ANALYST`, `VIEWER`).
- **Feedback Management**: Full CRUD, server-side pagination, structured filters, CSV bulk ingestion, and channel seeding.
- **AI Sentiment & RAG Engine**:
  - Automated Claude 3.5 Sonnet sentiment classification & scoring (-1.0 to 1.0).
  - Grounded Q&A (**Ask LOOP**) with hallucination resistance and citation referencing.
  - Executive Voice of Customer (**VoC**) report generation.
- **Analytics & Time-Series**: Workspace KPI aggregation, sentiment trends over time, and channel distribution breakdown.
- **Security & Hardening**:
  - Multi-tenant data isolation strictly derived from JWT context.
  - HTTP security headers powered by `helmet`.
  - Rate limiting on public, authentication, and LLM endpoints via `express-rate-limit`.
  - Recursive XSS payload sanitization.
  - Interactive OpenAPI 3.0 documentation via Swagger UI.

---

## 🛠️ Tech Stack

- **Runtime**: Node.js & TypeScript (`tsx`)
- **Framework**: Express.js (v5)
- **Database ORM**: Prisma ORM (v7) with PostgreSQL & SQLite adapters
- **AI Provider**: Anthropic Claude SDK (`@anthropic-ai/sdk`)
- **Validation**: Zod schema validation
- **Documentation**: Swagger UI Express & Swagger-JSDoc

---

## 🚀 Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment Variables
Copy `.env.example` to `.env` and configure your settings:
```env
PORT=4000
DATABASE_URL="postgresql://user:password@localhost:5432/loop_db"
JWT_SECRET="your-secure-jwt-secret"
ANTHROPIC_API_KEY="your-anthropic-api-key"
CORS_ORIGIN="http://localhost:3000"
```

### 3. Database Migration & Seed
```bash
npx prisma migrate dev --name init
npm run seed
```

### 4. Run Development Server
```bash
npm run dev
```
- API Server: `http://localhost:4000`
- Interactive Swagger UI: `http://localhost:4000/api/docs`
- Health Check: `http://localhost:4000/health`

---

## 🧪 Testing

Run automated backend test suites:
```bash
npm run test:day3    # AI Classification, Ask LOOP & Reports
npm run test:day4    # RBAC, Tenant Isolation & Error Handling
npm run test:day5    # Security Headers, Rate Limiting & Swagger UI
npm run test:day6    # Analytics Aggregations & XSS Sanitization
```

---

## 📚 API Endpoints Overview

| Method | Endpoint | Description | Auth / Role |
|---|---|---|---|
| `GET` | `/health` | Server uptime & status | Public |
| `GET` | `/api/docs` | Interactive Swagger UI | Public |
| `POST` | `/api/auth/signup` | Register new user & workspace | Public |
| `POST` | `/api/auth/login` | Authenticate & get JWT token | Public |
| `GET` | `/api/auth/me` | Current user profile | Authenticated |
| `GET` | `/api/feedback` | Paginated & filtered feedback list | `ADMIN`, `ANALYST`, `VIEWER` |
| `POST` | `/api/feedback` | Create & auto-classify feedback | `ADMIN`, `ANALYST` |
| `POST` | `/api/feedback/import` | Bulk CSV feedback ingestion | `ADMIN`, `ANALYST` |
| `GET` | `/api/themes` | List workspace themes & counts | `ADMIN`, `ANALYST`, `VIEWER` |
| `GET` | `/api/themes/trends` | Trend analysis & volume spikes | `ADMIN`, `ANALYST`, `VIEWER` |
| `POST` | `/api/ask` | Grounded RAG Q&A Engine | Authenticated |
| `POST` | `/api/reports` | Generate executive VoC report | `ADMIN`, `ANALYST` |
| `GET` | `/api/analytics/overview` | Workspace KPI metrics | Authenticated |
| `GET` | `/api/analytics/sentiment-trend` | Time-series sentiment trend | Authenticated |
| `GET` | `/api/analytics/channels` | Feedback volume by channel | Authenticated |
