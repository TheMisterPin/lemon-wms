# Architecture

**Analysis Date:** 2026-04-08

## Pattern Overview

**Overall:** Single Next.js monolith with split product surfaces (office dashboard + warehouse floor), shared backend and database.

**Key Characteristics:**
- App Router pages and API routes in one repo (`src/app/`)
- Role-aware UI and route access (`middleware.ts`)
- Thin route handlers delegating to domain entities (`src/lib/entities/*`)
- Shared Prisma data layer and generated client (`src/lib/prisma.ts`, `src/generated/prisma`)

## Layers

**Presentation Layer:**
- Purpose: Render office and floor experiences
- Contains: pages/layouts/components in `src/app/` and `src/components/`
- Depends on: API clients, hooks, shared types
- Used by: end users via browser

**API Boundary Layer:**
- Purpose: Parse requests, validate payloads, enforce auth/role, shape responses
- Contains: route handlers under `src/app/api/**/route.ts`
- Depends on: auth middleware helpers, schemas, entities, response helpers
- Used by: frontend clients and potential internal clients

**Domain Layer:**
- Purpose: Implement business use-cases and data operations by domain
- Contains: `src/lib/entities/auth`, `warehouses`, `zones`, `bins`, `items`, `move-operations`, etc.
- Depends on: Prisma client types and shared domain utilities
- Used by: API route handlers

**Infrastructure Layer:**
- Purpose: Persistence and cross-cutting technical services
- Contains: Prisma bootstrap (`src/lib/prisma.ts`), auth/session infra (`src/lib/auth/*`), converters/schemas/helpers
- Depends on: external libs (Prisma, pg, JWT, bcrypt)
- Used by: domain + API layers

## Data Flow

**Typical API Request Flow (Dashboard/Floor):**
1. Client invokes `/api/...` via Axios wrapper (`src/lib/axios.ts`)
2. Route handler validates payload (`zod`) and checks token (`verifyAccessTokenFromRequest`)
3. Handler delegates to entity function (example: `getWarehouses` in `src/lib/entities/warehouses/get-warehouses.ts`)
4. Entity performs Prisma operations using shared client (`src/lib/prisma.ts`)
5. Handler returns standardized JSON (often via `src/lib/api/response.ts`)

**Page Navigation/Auth Flow:**
1. Browser requests page route
2. Edge middleware (`middleware.ts`) resolves access token from headers/cookies
3. Role-based redirect enforces `/dashboard` vs `/warehouse` boundaries
4. Client-side provider/store can refresh expired session and continue

**State Management:**
- Server state persisted in PostgreSQL
- Client auth/session state in Zustand + browser storage (`src/lib/auth/store.ts`)

## Key Abstractions

**Entity Modules:**
- Purpose: Domain-level use cases and data logic
- Examples: `src/lib/entities/auth/credential-login.ts`, `src/lib/entities/move-operations/use-cases/*`
- Pattern: Small focused modules, generally named by action (`create-*`, `get-*`, `update-*`, `delete-*`)

**Auth Payload & Guards:**
- Purpose: Standardize identity and role checks
- Examples: `AccessTokenPayload`, `isOfficeRole`, `isFloorRole`
- Pattern: Shared auth helper module + middleware enforcement

**Response Helpers:**
- Purpose: Keep API response shape consistent
- Examples: `ok`, `created`, `fail`, `unauthorized`, `validationFail` in `src/lib/api/response.ts`
- Pattern: thin wrapper around `NextResponse`

## Entry Points

**Web App Entry:**
- Location: `src/app/layout.tsx` and route-specific pages under `src/app/(dashboard)` and `src/app/(warehouse)`
- Triggers: browser route access
- Responsibilities: render UI surfaces, mount provider shells

**API Entry:**
- Location: `src/app/api/**/route.ts`
- Triggers: HTTP requests to `/api/*`
- Responsibilities: auth, validation, call domain logic, return JSON

**Global Request Guard:**
- Location: `middleware.ts`
- Triggers: all incoming non-static requests
- Responsibilities: auth resolution, role-based redirect/routing rules

## Error Handling

**Strategy:** Validate early, catch at route boundary, map known errors to status codes.

**Patterns:**
- `DomainError` used for expected domain failures (`src/lib/errors.ts`)
- Route-level `try/catch` with explicit fallback response
- Console logging on unexpected failures before returning generic error

## Cross-Cutting Concerns

**Logging:**
- Primarily `console.error` in route handlers

**Validation:**
- Zod schemas at API boundary (`src/lib/schemas/*`)

**Authentication/Authorization:**
- JWT verification + role checks in shared auth middleware
- Token refresh flow through `/api/auth/refresh` and client interceptors

---

*Architecture analysis: 2026-04-08*
*Update when major patterns change*
