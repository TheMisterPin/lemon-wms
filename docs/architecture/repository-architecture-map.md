# Lemon WMS Repository Architecture Map

This document maps the current project structure, highlights how responsibilities are distributed, and defines a documentation plan that covers all critical areas.

## 1) High-level architecture

- Single Next.js App Router codebase with two primary surfaces:
  - Office: `/dashboard`
  - Floor: `/warehouse`
- Shared backend APIs and database:
  - Route handlers under `src/app/api/**`
  - Domain/business logic under `src/lib/entities/**`
  - Persistence via Prisma + PostgreSQL (`prisma/schema.prisma`, `src/lib/prisma.ts`)
- Auth and access:
  - JWT/session modules under `src/lib/auth/**`
  - Path gating via `src/middleware.ts`

## 2) Folder structure analysis

### `src/app`
- Route groups and pages for auth, dashboard, and warehouse.
- API handlers under `src/app/api/**` (auth, dashboard, warehouse, errors, logs, seeds).
- Documentation priority: **P0**.

### `src/lib`
- Core architecture layer:
  - `entities/**` (domain modules; target place for business logic)
  - `auth/**` (JWT/session/middleware helpers)
  - `api/**` (response patterns)
  - `schemas/**` (server-side validation)
  - `loggers/**`, `seeding/**`, `hooks/**`
- Note: legacy business logic still exists in `src/lib/services/**` and overlaps with `entities/**`.
- Documentation priority: **P0**.

### `src/components`
- UI architecture split:
  - `dashboard/**` for office workflows
  - `warehouse/**` for floor workflows
  - `shared/**`, `ui/**` for cross-surface components
  - `configs/entities/**` for config-driven UI behavior
- Documentation priority: **P1**.

### `src/types`, `src/utils`, `src/hooks`
- Shared contracts, helpers, and composition utilities.
- Includes schema helpers and form-related utilities.
- Documentation priority: **P1**.

### `prisma`, `seed`, config roots
- Database schema and migrations (`prisma/**`)
- Data bootstrapping (`seed/**`, `src/lib/seeding/**`)
- Runtime/tooling config (`next.config.ts`, `tsconfig.json`, `eslint.config.mjs`, `vitest.config.ts`)
- Documentation priority: **P0** for data/ops setup, **P2** for deep config reference.

### `src/__tests__`
- Existing coverage focuses on auth and selected units/components.
- Route-level coverage across dashboard/warehouse APIs is limited.
- Documentation priority: **P1**.

## 3) Documentation coverage matrix

| Area | Paths | What must be documented | Priority | Target doc |
|---|---|---|---|---|
| System overview | `src/app/**`, `src/lib/**` | End-to-end architecture and boundaries | P0 | `docs/architecture/system-overview.md` |
| Routing model | `src/app/**/page.tsx`, `layout.tsx` | Route groups, surface segmentation, navigation boundaries | P0 | `docs/architecture/routing-map.md` |
| Auth + session | `src/lib/auth/**`, `src/middleware.ts`, `src/app/api/auth/**` | Login flows, token lifecycle, role checks | P0 | `docs/architecture/auth-and-session.md` |
| API catalog | `src/app/api/**` | Endpoint inventory, request/response and errors | P0 | `docs/api/index.md` |
| Dashboard APIs | `src/app/api/dashboard/**` | Resource behavior and authorization expectations | P0 | `docs/api/dashboard.md` |
| Warehouse APIs | `src/app/api/warehouse/**` | Operational flows and required context | P0 | `docs/api/warehouse.md` |
| Domain modules | `src/lib/entities/**` | Use cases, invariants, and cross-module contracts | P1 | `docs/domains/*.md` |
| Legacy overlap | `src/lib/services/**` | Transitional status and migration direction | P0 | `docs/domains/move-operations.md` |
| Data layer | `prisma/schema.prisma`, `src/lib/prisma.ts` | Model map, client generation/runtime behavior | P0 | `docs/data/prisma-runtime.md` |
| UI architecture | `src/components/**` | Dashboard vs warehouse component boundaries | P1 | `docs/frontend/component-architecture.md` |
| Validation + types | `src/lib/schemas/**`, `src/types/**`, `src/utils/**` | Contract ownership and validation strategy | P1 | `docs/standards/validation-and-types.md` |
| Testing strategy | `src/__tests__/**`, `vitest.config.ts` | Coverage map, testing conventions, gaps | P1 | `docs/quality/testing-strategy.md` |
| Seeding + local setup | `seed/**`, `.env.example`, `README.md` | Developer onboarding and seed workflows | P0 | `docs/runbooks/local-setup-and-seeding.md` |
| Logging/ops | `src/app/api/errors/**`, `src/app/api/logs/**`, `src/lib/loggers/**` | Error ingestion and observability status | P1 | `docs/ops/observability.md` |

## 4) Recommended documentation tree

```text
docs/
  README.md
  architecture/
    repository-architecture-map.md
    system-overview.md
    routing-map.md
    auth-and-session.md
  api/
    index.md
    auth.md
    dashboard.md
    warehouse.md
  domains/
    warehouses.md
    zones.md
    bins.md
    items.md
    users-and-devices.md
    stock.md
    move-operations.md
  data/
    prisma-runtime.md
    prisma-model-index.md
  frontend/
    component-architecture.md
    entity-config-system.md
  standards/
    validation-and-types.md
  quality/
    testing-strategy.md
  runbooks/
    local-setup-and-seeding.md
  ops/
    observability.md
  meta/
    documentation-governance.md
```

## 5) Phased execution plan

### Phase 1 (P0 baseline)
1. `system-overview.md`
2. `auth-and-session.md`
3. `api/index.md`, `api/auth.md`, `api/dashboard.md`, `api/warehouse.md`
4. `prisma-runtime.md`
5. `documentation-governance.md`

### Phase 2 (domain depth)
1. Domain docs for `entities/**`
2. Move-operations + legacy services transition notes
3. Route-level behavior examples for core stock/move flows

### Phase 3 (frontend and quality)
1. Component architecture and config-driven UI docs
2. Validation/type ownership standards
3. Testing strategy and documented coverage gaps

## 6) Open questions to settle before full rollout

1. Should `docs/` become the single canonical docs location (migrating from hidden/stale docs)?
2. Is `src/lib/services/**` still transitional, and what is the sunset timeline?
3. Do we want machine-readable OpenAPI as the source of truth, or markdown-first API docs?
4. Who owns each doc area (backend, frontend, platform), and what is the update SLA per PR?
