# `src/lib` Developer Reference

Developer-facing architecture and extension guide for shared core modules.

## Lib architecture overview

`src/lib` is the shared core used by both `src/app/api/**` and client-facing app code.

- Server-side core:
  - `entities/**` domain use-cases
  - `auth/**` token/session/middleware helpers
  - `prisma.ts` DB client
  - `api/response.ts` response contract helpers
  - `errors.ts` domain error type
- Client-support modules:
  - `axios.ts` with auth/refresh strategy
  - `auth/store.ts` for auth state
  - `notification/store.ts` for UI notifications
- Shared contracts/utilities:
  - `schemas/**`, `utils/**`, `converters/**`, `seeding/**`

## Module structure map

```text
src/lib
├─ api/response.ts
├─ auth/{jwt,middleware,session,store,decode}.ts
├─ axios.ts
├─ prisma.ts
├─ errors.ts
├─ entities/
│  ├─ auth/
│  ├─ warehouses/ zones/ bins/ items/ users/ devices/
│  ├─ stock/
│  └─ move-operations/
├─ schemas/
├─ services/bin-operations/   (legacy/bridging)
├─ converters/table-records.ts
├─ loggers/error.ts
├─ notification/store.ts
├─ utils.ts
├─ utils/*
└─ seeding/*
```

## Module-by-module expectations and contracts

## `api/response.ts`

- Purpose: uniform API JSON response builders.
- Contract:
  - Success: `{ success: true, message, data }`
  - Error: `{ success: false, message, data: null, error: { code, details? } }`
- Used by route handlers to standardize status and payload shape.

## `auth/**`

- `jwt.ts`: sign/verify access and refresh tokens.
- `middleware.ts`: auth extraction + role guards.
- `session.ts`: cookie handling and refresh-token persistence/revocation.
- `store.ts`, `decode.ts`: client auth hydration and token usability checks.
- Expected inputs:
  - Bearer token and/or auth cookies
  - Role/device/warehouse context in JWT payload
- Expected outputs:
  - Verified payload or auth failure
  - Cookie mutation for login/refresh/logout flows

## `entities/**`

- Canonical location for business logic.
- Typical function shape:
  - Inputs: typed command/query and Prisma client/transaction.
  - Outputs: domain object or DTO-ready data.
  - Errors: domain-level failures (prefer typed/coded errors).

### Entity groups

- `entities/auth`: credential/floor login, refresh, logout use-cases.
- `entities/warehouses|zones|bins|items|users|devices`: CRUD + domain checks.
- `entities/stock`: dashboard stock aggregation.
- `entities/move-operations`: transactional load/unload/add/remove/trolley workflows.

## `schemas/**`

- Zod schemas and inferred types for route input validation and form contracts.
- Should define boundary contracts; route handlers validate before entities execute.

## `services/**` (current transitional layer)

- Contains legacy bin-operation helpers/bridges.
- Expected long-term direction: entity-layer consolidation.

## `prisma.ts`

- Central DB client singleton.
- Must remain the single import path for Prisma client setup.

## `axios.ts`

- Client HTTP utility with auth headers + refresh retry behavior.
- Consumers should avoid duplicating auth-refresh logic outside this module.

## `converters/**`, `utils/**`, `loggers/**`, `seeding/**`

- `converters`: DB -> UI-friendly record transforms.
- `utils`: pure helper functions (formatting/path access/classname composition).
- `loggers`: error persistence helpers.
- `seeding`: development bootstrap data generation and seed orchestration.

## Design patterns in `src/lib`

- Thin-route / thick-domain pattern.
- Schema-first boundary validation.
- Transaction-first move operations.
- Shared response envelope + centralized auth extraction.
- Barrel exports by domain (with caution around mixed client/server exports).

## How to extend `src/lib` safely

1. Put new business logic in `entities/<domain>/`.
2. Add/extend request schemas in `schemas/**` for boundary validation.
3. Keep entities independent from UI concerns.
4. Use transaction clients for multi-write operations.
5. Throw typed domain errors for expected business failures.
6. Keep route handlers thin and call entity use-cases.
7. Avoid adding new logic to `services/**` unless explicitly transitional.

## Suggested ownership boundaries

- Domain owners: `entities/**`
- API/platform owners: `api/response.ts`, `errors.ts`, `auth/**`
- Data/platform owners: `prisma.ts`, DB-coupled loggers/seeding
- Frontend platform owners: `axios.ts`, notification/client auth store
- Shared contract owners: `schemas/**`, selected `types/**` integrations
