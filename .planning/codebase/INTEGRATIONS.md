# External Integrations

**Analysis Date:** 2026-04-08

## APIs & External Services

**External SaaS APIs:**
- None clearly integrated in application runtime paths under `src/` (no Stripe/SendGrid/etc. usage detected in sampled code)

**Internal HTTP APIs:**
- Next.js route handlers under `src/app/api/dashboard/*`, `src/app/api/warehouse/*`, `src/app/api/auth/*`
- Frontend calls these via Axios clients in `src/lib/axios.ts` with base URL `/api`

## Data Storage

**Databases:**
- PostgreSQL (Prisma datasource provider)
  - Schema: `prisma/schema.prisma`
  - Connection: `DATABASE_URL` (`prisma.config.ts`, `src/lib/prisma.ts`)
  - Client output: `src/generated/prisma`
  - Driver path: `@prisma/adapter-pg` + `pg` pool in `src/lib/prisma.ts`

**File Storage:**
- No external object storage integration detected in sampled backend code

**Caching:**
- No Redis/memcache integration detected
- Request-level cache behavior is default Next.js unless explicitly handled in route/entity code

## Authentication & Identity

**Auth Provider:**
- Custom JWT-based auth
  - Token utils: `src/lib/auth/jwt.ts`
  - Session/refresh persistence: `src/lib/auth/session.ts`
  - Middleware role enforcement: `middleware.ts` and `src/lib/auth/middleware.ts`
  - Access + refresh token cookies and local/session storage in browser store (`src/lib/auth/store.ts`)

**Identity Source:**
- Users table in Prisma (`User` model in `prisma/schema.prisma`)
- Password hashing with bcrypt in `src/lib/entities/auth/credential-login.ts`

## Monitoring & Observability

**Error Tracking:**
- No third-party tracker (e.g., Sentry) wired in sampled runtime code

**Logging:**
- Route-level `console.error(...)` usage in API handlers (example: `src/app/api/auth/login/route.ts`)
- `src/app/api/logs/route.ts` exists but should be treated as internal endpoint, not external log sink

## CI/CD & Deployment

**Hosting:**
- Vercel-oriented project signals: `vercel.json`, `.vercel/`, Next.js app structure

**CI Pipeline:**
- No `.github/workflows/*.yml` found in this repo snapshot

## Environment Configuration

**Development:**
- `.env` file present locally, `.env.example` available
- Local DB development expected via `DATABASE_URL`

**Production:**
- Environment variables required at deploy platform level (at minimum JWT and DB settings)
- Security-sensitive vars must remain outside git-tracked files

## Webhooks & Callbacks

**Incoming webhooks:**
- No dedicated public webhook endpoint detected in sampled API route set

**Outgoing callbacks:**
- No outbound webhook dispatcher detected in sampled service/entity code

---

*Integration audit: 2026-04-08*
*Update when adding/removing external services*
