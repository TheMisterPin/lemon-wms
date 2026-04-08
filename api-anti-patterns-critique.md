# Executive Summary

`src/app/api/**` shows a strong baseline (shared `ok/fail/validationFail` helpers and entity-oriented handlers in many dashboard routes), but quality is uneven across namespaces (`auth`, `dashboard`, `warehouse`, utility endpoints).

The largest risks are:
- inconsistent response contracts (`NextResponse.json` vs shared response helpers),
- incomplete/uneven authorization checks across equivalent read routes,
- mixed validation styles and error mappings,
- route handlers that still contain domain/business orchestration and direct Prisma logic,
- high copy/paste repetition in auth + CRUD handler scaffolding.

These issues create API contract drift, increase frontend branching, and make regressions likely when behavior changes in one route family but not others.

# Findings by Severity

## Critical

### 1) Functional guard bug in stock endpoint
- **Evidence (path):** `src/app/api/dashboard/stock/route.ts`
- **Why problematic:** `prisma.warehouse.findFirst(...)` is assigned without `await`, so the `if (!warehouseId)` guard never works as intended (Promise is always truthy). This silently bypasses a runtime precondition and hides missing warehouse setup.
- **Refactoring recommendation:** `await` the query, remove hardcoded warehouse ID, and accept/validate `warehouseId` from query or JWT context. Move precondition checks to a shared guard.

### 2) Contract-breaking response shape inconsistency
- **Evidence (path):** `src/app/api/auth/login/route.ts`, `src/app/api/auth/floor/login/route.ts`, `src/app/api/auth/logout/route.ts`, `src/app/api/auth/refresh/route.ts`, `src/app/api/seed/users/route.ts`, `src/app/api/logs/route.ts`, `src/app/api/warehouse/bins/route.ts`
- **Why problematic:** these routes return ad-hoc `NextResponse.json(...)` payloads (e.g., `{ error }`, `{ success: true }`, `{ data: [] }`) instead of the shared `ApiResponse` envelope used by most `dashboard`/`warehouse` routes. Clients must special-case parsing and error handling.
- **Refactoring recommendation:** standardize all routes on `ok/created/fail/validationFail/notFound/unauthorized` with a single typed response contract.

## High

### 3) Authorization policy drift on read endpoints
- **Evidence (path):** `src/app/api/dashboard/items/route.ts`, `src/app/api/dashboard/bins/route.ts`, `src/app/api/dashboard/zones/route.ts`, `src/app/api/dashboard/warehouses/route.ts`, `src/app/api/dashboard/home/route.ts`
- **Why problematic:** many `GET /dashboard/*` routes allow any authenticated role, while peer routes enforce office-role gates (`users`, `stock`, `users/[id]`). This creates implicit policy differences that are hard to reason about and easy to abuse.
- **Refactoring recommendation:** define per-resource policy centrally (e.g., `authorizeDashboardRead(resource, role)`), then enforce consistently across all handlers.

### 4) Validation strategy is inconsistent (`safeParse` vs `parse`)
- **Evidence (path):** `src/app/api/auth/login/route.ts`, `src/app/api/auth/floor/login/route.ts`, `src/app/api/errors/route.ts`, `src/app/api/dashboard/items/route.ts`, `src/app/api/dashboard/users/route.ts`, `src/app/api/warehouse/stock/load/[id]/route.ts`
- **Why problematic:** some routes proactively validate with `safeParse`, others throw with `parse` then catch `ZodError`. This duplicates control flow and yields uneven error detail and status mapping.
- **Refactoring recommendation:** standardize on one approach (recommended: `safeParse` + shared `fromValidation(schema, body)` helper) and remove per-route parsing boilerplate.

### 5) Error classification drift and leaky error semantics
- **Evidence (path):** `src/app/api/dashboard/items/route.ts`, `src/app/api/warehouse/stock/load/[id]/route.ts`, `src/app/api/warehouse/stock/unload/[id]/route.ts`, `src/app/api/dashboard/bins/[id]/route.ts`
- **Why problematic:** domain and unexpected errors are mapped differently across routes (e.g., generic `Error` sometimes forced to `VALIDATION_ERROR`/`BAD_REQUEST`, sometimes falls to default 500). This causes misleading client behavior and inconsistent retry logic.
- **Refactoring recommendation:** centralize error mapping (`mapErrorToApiResponse`) with explicit branches for `ZodError`, `DomainError`, not found, forbidden, and unknown.

### 6) Route handlers still contain business orchestration and direct Prisma queries
- **Evidence (path):** `src/app/api/warehouse/route.ts`, `src/app/api/warehouse/items/route.ts`, `src/app/api/warehouse/stock/load/[id]/route.ts`, `src/app/api/warehouse/stock/unload/[id]/route.ts`, `src/app/api/warehouse/stock/addtobin/[id]/route.ts`
- **Why problematic:** large inline Prisma blocks and orchestration logic in route files violate “thin handler” intent, reduce reuse, and make testing difficult.
- **Refactoring recommendation:** extract route logic to `src/lib/entities/<domain>/...` use-cases and keep route handlers to auth + validation + response serialization.

### 7) Architectural inconsistency: `services` imported from API layer
- **Evidence (path):** `src/app/api/warehouse/bins/[id]/route.ts`, `src/app/api/warehouse/stock/addtobin/[id]/route.ts`
- **Why problematic:** these routes import `@/lib/services/...` while the project convention favors `@/lib/entities/...`, creating two competing business-logic layers.
- **Refactoring recommendation:** migrate `bin-operations` service calls behind entity modules and phase out `lib/services` usage from route handlers.

## Medium

### 8) Repeated auth bootstrap boilerplate across almost every handler
- **Evidence (path):** most route files in `src/app/api/dashboard/**` and `src/app/api/warehouse/**`
- **Why problematic:** repeated `verifyAccessTokenFromRequest` + `if (!payload) return unauthorized()` + role/device/warehouse checks inflate handlers and make policy updates error-prone.
- **Refactoring recommendation:** introduce composable guards (`withAuth`, `requireOfficeRole`, `requireWarehouseContext`, `requireDeviceContext`) and apply consistently.

### 9) Repeated CRUD skeletons across dashboard resources
- **Evidence (path):** `dashboard/items*`, `dashboard/bins*`, `dashboard/zones*`, `dashboard/warehouses*`, `dashboard/users*`
- **Why problematic:** nearly identical GET/POST/PUT/DELETE structures duplicate auth, existence checks, parse/catch blocks, and messaging. Changes to behavior require N edits across resource families.
- **Refactoring recommendation:** build a generic route factory/composable utilities for resource CRUD (policy + schema + entity ops + message templates).

### 10) Resource naming and action routing are not uniformly RESTful
- **Evidence (path):** `src/app/api/dashboard/devices/[action]/route.ts`, `src/app/api/warehouse/stock/addtobin/[id]/route.ts`
- **Why problematic:** verb-in-path/action routes are mixed with noun/resource routes, making API discoverability and consistency weaker.
- **Refactoring recommendation:** represent commands as resource sub-collections (e.g., `/devices/:id/authorization`, `/warehouse/stock/transfers`) or document explicit command conventions.

### 11) Duplicate endpoint alias with unclear ownership
- **Evidence (path):** `src/app/api/warehouse/home/route.ts` (re-export of `src/app/api/warehouse/route.ts`)
- **Why problematic:** duplicate entrypoints can diverge in middleware/caching behavior over time and increase surface area without adding domain clarity.
- **Refactoring recommendation:** keep one canonical route and use explicit redirect/deprecation strategy if alias is needed temporarily.

## Low

### 12) Error code/value inconsistency and message style drift
- **Evidence (path):** `src/app/api/warehouse/route.ts` (`'400'` string code), mixed punctuation/casing across many handlers
- **Why problematic:** inconsistent code formats and message style reduce observability quality and complicate client-side localization/analytics.
- **Refactoring recommendation:** enforce typed error codes (enum/union) and standardized message conventions.

# Repetition Hotspots

1. **Auth prelude duplication:** `verifyAccessTokenFromRequest` + unauthorized return repeated in most `dashboard`/`warehouse` handlers.
2. **Role checks duplication:** repeated ad-hoc checks (`isOfficeRole`, OWNER/OFFICE_MANAGER literals) across `dashboard/*` routes.
3. **CRUD control-flow duplication:** same existence checks + parse + try/catch patterns across `items/bins/zones/warehouses/users`.
4. **Validation error handling duplication:** repeated `if (error instanceof z.ZodError) return validationFail(error)` blocks.
5. **Context guards duplication:** warehouse/device context checks repeated in multiple `warehouse/stock/*` handlers.
6. **Console logging patterns duplication:** route-specific `console.error` strings repeated everywhere instead of structured logger utility.

# Top 10 Concrete Refactors

1. Fix `dashboard/stock` precondition bug (`await` + remove hardcoded `WH-0001` path).
2. Migrate all `auth`, `seed`, `logs`, and debug endpoints to shared `ApiResponse` helpers.
3. Create `withRouteGuard` utility composing auth + role + warehouse/device context checks.
4. Add centralized `mapErrorToApiResponse(error)` and remove per-file catch branching drift.
5. Standardize request validation with one helper (`safeParse`-based) across all handlers.
6. Introduce policy map per endpoint/resource and remove inline role literals.
7. Extract `warehouse/route.ts` orchestration into `lib/entities/warehouse/get-home-data`.
8. Replace `lib/services/bin-operations` imports in API routes with `lib/entities` adapters.
9. Consolidate repetitive CRUD route patterns via shared factory/composables.
10. Normalize route taxonomy (resource-oriented paths, controlled deprecation of action-style paths and aliases).

# Guardrails/standards to prevent regressions

- **Single response contract:** all routes must return `ApiResponse` via `src/lib/api/response` helpers.
- **Policy as code:** every route declares required policy in one place (auth, role set, warehouse/device context).
- **Validation standard:** one validation pattern and one error payload shape for all Zod failures.
- **Centralized error mapping:** unknown errors default to 500; domain/validation errors map deterministically.
- **Thin handlers rule:** route files only parse/auth/authorize/delegate/respond; business logic lives in `src/lib/entities/**`.
- **No ad-hoc role literals:** use shared role predicates/policy constants.
- **No hardcoded tenant/resource IDs in handlers:** require context or validated input.
- **Route consistency checks in CI:** lint rule or test asserting response envelope + guard usage.
- **Duplicate route ownership rule:** aliases require explicit deprecation comment + owner + removal date.
- **Refactor budget for API additions:** new endpoints must include guard tests, validation tests, and response-contract tests.
