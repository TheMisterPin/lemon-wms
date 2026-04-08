# `src/lib` Anti-patterns, Inconsistencies, and Repetition

Focused critique of architecture quality issues in shared core modules.

## Executive summary

`src/lib` has a good domain-centric intent, but drift exists in module boundaries, contracts, and duplication. The highest-value improvements are consolidating business logic into `entities/**`, enforcing consistent error/type contracts, and reducing repeated move-operation primitives.

## Findings by severity

## Critical

- Layer boundary inversion between `entities/**` and legacy `services/**`
  - Evidence: entity code depends on service helpers; services re-export entity behavior.
  - Risk: unclear source of truth and refactor fragility.
  - Fix: migrate helpers fully into entities; retire service layer for this domain.

- Domain/model mismatch in some module naming/placement
  - Evidence: functions in one domain folder performing another domain model mutation.
  - Risk: accidental misuse and poor discoverability.
  - Fix: enforce domain ownership by path + rename/move misaligned modules.

## High

- Mixed client/server exports in broad barrels
  - Risk: runtime-boundary mistakes and import footguns.
  - Fix: split explicit server vs client entrypoints.

- Inconsistent domain error strategy
  - Risk: non-deterministic API error mapping.
  - Fix: standardized typed domain errors for all expected failures.

- Duplicate business literal/type definitions
  - Risk: contract drift when roles/status types evolve.
  - Fix: single canonical source for business enums/unions.

- Legacy naming bleed in public contracts
  - Risk: cognitive load and mapping bugs.
  - Fix: naming normalization plan with compatibility adapters.

## Medium

- Create/update invariant asymmetry across entities
  - Risk: update paths bypass checks enforced in create paths.
  - Fix: shared invariant validators used in both operations.

- Repeated move-operation transaction sequences
  - Risk: fixes applied unevenly across add/load/unload/remove flows.
  - Fix: extract transaction primitives and compose use-cases.

- Entities coupled directly to form schema types
  - Risk: UI-boundary changes ripple into domain code.
  - Fix: introduce domain command DTOs and map at route boundary.

## Low

- Style/consistency drift (naming, formatting, minor contract patterns)
  - Fix: tighten linting and add a short `src/lib` coding standard.

## Repetition hotspots

1. Move-operation quantity and existence validation logic.
2. Stock item create/update mutation boilerplate.
3. Soft-delete predicates and update payload patterns.
4. Repeated role/login union literals.
5. Repeated JSON-null conversion and mapping helpers.
6. Similar table-record formatting/mapping code paths.

## Top 10 concrete refactors

1. Fully migrate bin-operation helpers from `services/**` to `entities/**`.
2. Remove/replace mislocated domain functions with correct module ownership.
3. Split `src/lib` import surfaces into explicit `server` and `client` entrypoints.
4. Introduce a typed `DomainError` taxonomy for move operations and CRUD modules.
5. Extract reusable transaction primitives for move-operation workflows.
6. Centralize role/login/status types into one canonical contract module.
7. Introduce domain command/query DTOs decoupled from form schemas.
8. Add shared invariant validators reused by create and update flows.
9. Normalize legacy naming via compatibility mappers, then phase out old names.
10. Add architecture tests/lint rules for forbidden imports and layering.

## Guardrails to prevent regressions

- `entities/**` must not import from `services/**`.
- No broad `@/lib` imports where explicit module path is available.
- Domain layer uses typed domain errors for expected failures.
- Business enums/types must come from one canonical source.
- If logic appears twice, extract before third occurrence.
- Add CI architecture checks for layering, import boundaries, and contract consistency.
