# 1) Executive summary

The repository has a solid high-level split (`/dashboard` vs `/warehouse`, entity modules, shared response helpers), but there are significant boundary and consistency gaps that materially increase security and operational risk.

The most serious issue is authorization boundary drift in API handlers: edge middleware explicitly skips `/api/*`, yet multiple dashboard and warehouse handlers rely on authentication-only checks or optional warehouse scoping, allowing cross-surface access patterns that violate the intended role model. The second major issue is architectural erosion between `src/lib/entities/*` and legacy `src/lib/services/*`, which creates unclear ownership of domain logic and duplicated integration points.

There are also notable performance and maintainability risks: heavyweight aggregation in `warehouse` API routes, inconsistent error/response handling contracts, limited API-layer tests outside auth, and stubs/debug endpoints still exposed in runtime paths.

# 2) Findings by severity

## Critical

### C1. API authorization boundary is inconsistent with role-segregation design
- **Evidence (paths/symbols):** `middleware()` in `middleware.ts` skips all `/api/*` requests; many API handlers only call `verifyAccessTokenFromRequest()` without role checks (examples: `src/app/api/dashboard/home/route.ts`, `src/app/api/dashboard/items/route.ts` GET, `src/app/api/dashboard/bins/route.ts` GET, `src/app/api/dashboard/devices/route.ts` GET, `src/app/api/dashboard/warehouses/route.ts` GET, `src/app/api/warehouse/items/route.ts`).
- **Why it matters:** once middleware opts out of API authz, each route must enforce both authentication and authorization boundaries; authentication-only checks are insufficient for a split-surface system.
- **Likely impact:** cross-role data exposure (office users reading floor datasets, floor users reading dashboard datasets), policy drift, and future regressions as new handlers copy existing patterns.
- **Recommendation:** add explicit server-side authorization guards per namespace (`requireOfficeRole`, `requireFloorRole`) and apply them to every `/api/dashboard/*` and `/api/warehouse/*` handler; back this with route-level authorization tests.

### C2. Warehouse scoping is optional in sensitive handlers, enabling broad access paths
- **Evidence (paths/symbols):** optional warehouse filter spread in `src/app/api/warehouse/bins/[id]/route.ts` and `src/app/api/warehouse/stock/addtobin/[id]/route.ts` (`...(payload.warehouseId ? { warehouseId: payload.warehouseId } : {})`); no explicit floor-role requirement in these handlers.
- **Why it matters:** when `payload.warehouseId` is absent (e.g., non-floor token), the query falls back to global bin lookup.
- **Likely impact:** unauthorized read/write behavior on bins/stock across warehouses; breach of tenant-like warehouse boundaries.
- **Recommendation:** make `warehouseId` + `deviceId` mandatory for warehouse operational routes; reject requests lacking floor context before any DB access; enforce `isFloorRole()` consistently.

## High

### H1. Access token cookie is deliberately non-HttpOnly and long-lived
- **Evidence (paths/symbols):** `setAccessTokenCookie()` in `src/lib/auth/session.ts` sets `httpOnly: false` and `maxAge: 7d` while JWT access expiry defaults to `15m` in `src/lib/auth/jwt.ts`.
- **Why it matters:** non-HttpOnly access tokens are readable by JS and therefore vulnerable to XSS token exfiltration.
- **Likely impact:** account/session compromise blast radius increases if client-side script injection occurs.
- **Recommendation:** move to HttpOnly access token pattern (or opaque session token) and keep refresh flow server-driven; if client-readable token must remain, reduce cookie lifetime and harden CSP/XSS mitigations aggressively.

### H2. Domain boundary erosion: `entities` and legacy `services` are interdependent
- **Evidence (paths/symbols):** warehouse routes still import from `src/lib/services/bin-operations/*`; `src/lib/services/bin-operations/create-from-item.ts` is marked `Todo: delete this`; `src/lib/entities/move-operations/use-cases/create-bin-operations-from-item.ts` imports helper logic from `@/lib/services/bin-operations/helpers`.
- **Why it matters:** this inverts intended layering (`entities` should be the domain source) and creates ambiguity over where business rules should live.
- **Likely impact:** duplicated logic, harder refactors, and inconsistent behavior between old/new call paths.
- **Recommendation:** complete migration to `src/lib/entities/*` only; move shared helpers into `entities/move-operations`; deprecate and remove `src/lib/services/*` exports.

### H3. Error ingestion endpoint is unauthenticated and can be abused
- **Evidence (paths/symbols):** `POST /api/errors` in `src/app/api/errors/route.ts` accepts client payload and writes DB logs via `logError()` without auth/rate limiting.
- **Why it matters:** external callers can generate persistent DB writes and noise.
- **Likely impact:** log-table growth, alert fatigue, and potential write amplification under abuse.
- **Recommendation:** require auth for internal clients (or signed ingestion key), add throttling, and cap payload size/frequency.

### H4. `GET /api/warehouse` mixes orchestration, random data mutation, and direct DB access
- **Evidence (paths/symbols):** `src/app/api/warehouse/route.ts` performs many inline Prisma reads and computes `progress` via `Math.random()` for orders.
- **Why it matters:** endpoint responsibilities are mixed (auth, aggregation, data shaping, synthetic fields), and response is non-deterministic.
- **Likely impact:** difficult debugging/caching, inconsistent UX values, and poor scalability under load.
- **Recommendation:** extract a dedicated entity/use-case module for warehouse home aggregation; remove random progress generation from API response path.

## Medium

### M1. Response contracts are inconsistent across API surface
- **Evidence (paths/symbols):** shared helpers in `src/lib/api/response.ts` are used widely, but auth routes (`src/app/api/auth/login/route.ts`, `src/app/api/auth/floor/login/route.ts`, `src/app/api/auth/refresh/route.ts`) return ad-hoc `NextResponse.json` payloads with different error shapes.
- **Why it matters:** clients must handle multiple envelope formats and error conventions.
- **Likely impact:** fragile frontend parsing and inconsistent user-facing error handling.
- **Recommendation:** standardize all handlers on one API envelope (success + error schema), including auth routes.

### M2. Logging strategy is partial and inconsistent
- **Evidence (paths/symbols):** many handlers rely on `console.error(...)`; persisted logging only appears via `src/app/api/errors/route.ts` + `src/lib/loggers/error.ts`; `src/app/api/logs/route.ts` is a placeholder.
- **Why it matters:** production diagnostics need structured, centralized logging across server routes, not ad-hoc console usage.
- **Likely impact:** slower incident response and limited root-cause observability.
- **Recommendation:** define one server logging abstraction (request id, route, user context, error code) and phase out raw console logging in handlers.

### M3. API test coverage is concentrated in auth, leaving major route groups unverified
- **Evidence (paths/symbols):** `src/__tests__/app/api/*` contains auth tests (`login`, `floor-login`, `refresh`) but no dashboard/warehouse route handler tests.
- **Why it matters:** the highest-risk area (authorization and route boundaries) lacks regression protection.
- **Likely impact:** silent security regressions and inconsistent behavior across handlers.
- **Recommendation:** add contract + authorization tests for representative routes in each namespace first (`dashboard/home`, `dashboard/items`, `warehouse/items`, `warehouse/stock/*`).

### M4. Runtime config defaults can hide environment misconfiguration
- **Evidence (paths/symbols):** `src/lib/prisma.ts` falls back to `postgresql://localhost:5432/wms_db` when `DATABASE_URL` is missing; `next.config.ts` hardcodes `allowedDevOrigins: ['192.168.1.105']`.
- **Why it matters:** implicit defaults can mask misconfigured deployments and environment drift.
- **Likely impact:** startup against unintended DB in non-local setups, brittle local-network assumptions.
- **Recommendation:** fail fast when `DATABASE_URL` is unset outside explicit local-dev mode; make allowed dev origins environment-driven.

## Low

### L1. Exposed debug behavior in warehouse bins endpoint
- **Evidence (paths/symbols):** `src/app/api/warehouse/bins/route.ts` returns raw `payload` object explicitly marked as debugging.
- **Why it matters:** debug endpoints tend to become accidental dependencies and leak internal claims context.
- **Likely impact:** unnecessary token-claim exposure and unclear API contract.
- **Recommendation:** remove or gate behind development-only checks.

### L2. Documentation structure appears stale vs actual repository
- **Evidence (paths/symbols):** `README.md` references `docs/` structure and proposal file, but top-level `docs/` is not present in inspected tree.
- **Why it matters:** stale docs slow onboarding and create false assumptions about architecture direction.
- **Likely impact:** team confusion and duplicated discovery effort.
- **Recommendation:** align README structure map with current repository and link to actual architecture docs.

# 3) Bottlenecks (performance/scalability)

1. **Warehouse home aggregation endpoint is query-heavy and not modularized**
- **Evidence:** `src/app/api/warehouse/route.ts` executes multiple sequential `findMany/findFirst` calls (user, device, warehouse, zone, orders, bins, bin list).
- **Impact:** increased P95 latency under concurrent floor usage; difficult to tune because aggregation logic is embedded in route.
- **Recommendation:** move to a dedicated read-model function with parallelized independent queries and explicit response DTO.

2. **Unbounded order list retrieval in warehouse home path**
- **Evidence:** `getOrdersForWarehouseHomePage()` in `src/app/api/warehouse/route.ts` fetches three order collections without `take`/windowing.
- **Impact:** response time and memory usage scale with historical order volume.
- **Recommendation:** add paging/windowing (or dashboard-friendly capped recent lists) and computed summaries in DB.

3. **Search endpoints use broad `contains` filters over multiple fields**
- **Evidence:** `src/app/api/warehouse/items/route.ts` filters with `OR contains` on `name`, `sku`, `barcode`.
- **Impact:** query cost rises with catalog size; can become a hotspot for floor scanners/search.
- **Recommendation:** introduce optimized search strategy (prefix/index-backed search or dedicated search column); keep query minimum length guard.

4. **Prisma/PG pooling strategy may stress DB under scale-out**
- **Evidence:** `src/lib/prisma.ts` creates `pg.Pool` with default settings and adapter per runtime instance.
- **Impact:** potential connection pressure when horizontally scaled (especially bursty environments).
- **Recommendation:** define pool sizing/timeouts explicitly and validate against deployment concurrency profile.

# 4) Maintainability inconsistencies

1. **Role policy not centralized**
- Logic appears repeated per route (`isOfficeRole`, explicit role string checks, no floor checks in several warehouse routes), increasing drift risk.

2. **API envelope inconsistency**
- `ok/fail/validationFail` helpers coexist with direct ad-hoc JSON responses, forcing mixed client handling paths.

3. **Domain placement inconsistency**
- Intended `entities` domain layer coexists with operational logic still living under `services`, including back-references into services from entities.

4. **Error handling inconsistency**
- Some handlers map domain/validation errors cleanly; others catch generic `Error` and return broad `BAD_REQUEST` or default 500 with empty/weak codes.

5. **Stub and debug runtime endpoints**
- `src/app/api/logs/route.ts` placeholder and payload-debug responses create unclear production-readiness boundaries.

# 5) Quick wins (1-2 days)

1. Add reusable guards (`requireOfficeApiAccess`, `requireFloorApiAccess`) and apply them to all dashboard/warehouse handlers.
2. Enforce `warehouseId`/`deviceId` preconditions on warehouse operational routes before any DB query.
3. Remove or dev-gate debug endpoint behavior in `src/app/api/warehouse/bins/route.ts`.
4. Standardize auth routes to shared response helpers (`ok/fail/validationFail`) for one response envelope.
5. Add high-value authorization tests for 4 routes: `dashboard/home`, `dashboard/items`, `warehouse/items`, `warehouse/stock/addtobin/[id]`.
6. Replace `Math.random()` response fields in warehouse home with deterministic values or explicit placeholder flags.

# 6) Longer-term structural improvements

1. **Harden boundary architecture**
- Introduce namespace-level route wrappers/middleware helpers for authz + context hydration and make route handlers declarative.

2. **Complete domain-layer consolidation**
- Migrate all `src/lib/services/bin-operations/*` logic into `src/lib/entities/move-operations/*`, then remove legacy exports.

3. **Build a consistent operational observability layer**
- Implement structured logging (correlation ids, actor, route, error code), audit events, and controlled client error ingestion.

4. **Refactor warehouse home into a dedicated read model**
- Create a single orchestrator in `entities` with clear contracts, bounded result sets, and performance instrumentation.

5. **Define architecture fitness tests**
- Add CI checks for API namespace authorization, response schema consistency, and forbidden imports (`app/api` -> `services`).
