# LOOP — AI Customer-Feedback Intelligence Platform

Project LOOP is a corporate-grade, multi-tenant web application designed to help product teams ingest, classify, and extract actionable insights from scattered customer feedback across support tickets, app store reviews, NPS surveys, and sales call notes.

---

## 🔑 Demo Credentials (Seeded Workspace)

Use the following pre-configured credentials to evaluate Role-Based Access Control (RBAC) and tenant isolation:

| Role | Email | Password | Permissions |
| :--- | :--- | :--- | :--- |
| **Admin** | `admin@demo.com` | `Password123!` | Full workspace control, team management, role assignment, feedback CRUD |
| **Analyst** | `analyst@demo.com` | `Password123!` | Feedback ingestion (manual & CSV), AI analysis, report generation |
| **Viewer** | `viewer@demo.com` | `Password123!` | Read-only access to analytics dashboard, inbox, trends, and reports |

---

## 🛠 Tech Stack

- **Framework:** Next.js 14 (App Router) + TypeScript
- **Styling:** Tailwind CSS
- **Database:** PostgreSQL (Neon / Supabase)
- **ORM:** Prisma
- **Authentication:** NextAuth (Auth.js) with JWT session strategy & RBAC
- **AI Engine:** Anthropic Claude API / Google Gemini API (structured JSON output)
- **Vector Search:** Embeddings for retrieval-grounded semantic search (Ask LOOP)
- **Data Visualization:** Recharts
- **Schema Validation:** Zod

---

## 🏛 System Architecture & Security

LOOP implements a 3-tier architecture:
1. **Presentation Layer:** Next.js Server & Client Components.
2. **API Layer:** Route Handlers enforcing server-side session authentication, RBAC authorization, and Zod schema validation.
3. **Data Layer:** PostgreSQL accessed via Prisma ORM.

> **Non-Negotiable Security Rule:** Every database query touching feedback, themes, reports, or users is strictly filtered by the authenticated user's `workspaceId`. Cross-tenant data leaks are blocked server-side.

---

## ⚙️ Environment Variables

Create a `.env` file in the root directory with the following variables:

```env
# Database connection
DATABASE_URL="postgresql://user:password@host:port/database?sslmode=require"

# NextAuth Configuration
NEXTAUTH_SECRET="your-generated-nextauth-secret"
NEXTAUTH_URL="http://localhost:3000"

# AI Integration
GEMINI_API_KEY="your-gemini-api-key"
# ANTHROPIC_API_KEY="your-anthropic-api-key"