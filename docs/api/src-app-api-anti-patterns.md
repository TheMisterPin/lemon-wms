# `src/app/api` Anti-patterns, Repetitions, and Inconsistencies

Focused critique of route-layer quality issues with concrete remediation.

## Executive summary

Main gaps are contract inconsistency, authorization-policy drift, repeated handler boilerplate, and lingering business logic inside route files. These increase regression risk and API maintenance cost.

## Findings by severity

## Critical

- Authorization boundary drift across route families
  - Evidence: dashboard read routes have uneven role gates compared to stricter peers.
  - Risk: accidental cross-surface data access.
  - Fix: centralized policy map and mandatory guard wrappers.

- Contract inconsistency between auth and non-auth namespaces
  - Evidence: auth/utility routes return ad-hoc payloads, while most dashboard/warehouse routes use shared API envelope.
  - Risk: frontend parsing branches and hidden integration bugs.
  - Fix: enforce one response contract for all routes.

## High

- Mixed validation style (`parse` vs `safeParse`) and error mapping
  - Risk: inconsistent status codes/error details.
  - Fix: one validation helper and one error mapper.

- Heavy route handlers with direct Prisma orchestration in warehouse APIs
  - Risk: low reuse, difficult tests, harder performance tuning.
  - Fix: extract domain orchestration into `src/lib/entities/**`.

- Legacy service imports in routes where entities should be canonical
  - Risk: layer confusion and migration stall.
  - Fix: remove route imports from `src/lib/services/**`.

## Medium

- Repeated auth bootstrap in nearly every handler
  - Fix: compose `withAuth`/`requireOfficeRole`/`requireWarehouseContext`.

- Repeated CRUD scaffolding across resources
  - Fix: CRUD route composition utilities (policy + schema + ops + messages).

- Duplicate route aliasing (`/warehouse` and `/warehouse/home`) without clear deprecation strategy
  - Fix: canonical route ownership + alias policy.

## Low

- Debug/stub style endpoints in runtime API surface (`/logs`, debug bins response)
  - Fix: remove, restrict to dev, or document explicitly as non-prod support routes.

## Repetition hotspots

1. Auth extraction + unauthorized return boilerplate.
2. Repeated role literal checks.
3. Repeated Zod catch blocks.
4. Repeated CRUD list/create/get/update/delete skeletons.
5. Repeated route-local `console.error` patterns.

## Top 10 concrete refactors

1. Standardize all route outputs on `src/lib/api/response.ts`.
2. Add namespace-level policy helpers and require them in all handlers.
3. Introduce `validateRequest(schema, body)` utility for uniform validation.
4. Introduce `mapErrorToApiResponse(error)` utility.
5. Move heavy warehouse route orchestration into entity use-cases.
6. Remove `src/lib/services/**` imports from route handlers.
7. Add shared CRUD route helper for repetitive resource endpoints.
8. Normalize role policy for all dashboard reads/writes.
9. Gate/retire debug and placeholder endpoints from runtime API.
10. Add contract tests for representative endpoints in each namespace.

## Guardrails to prevent regressions

- One response envelope rule for all APIs.
- One validation pipeline rule for all APIs.
- One authorization declaration per route (or namespace wrapper).
- Thin-handler rule: parse/auth/authorize/delegate/respond only.
- CI checks for forbidden imports (`app/api` -> `lib/services`) and contract consistency.
