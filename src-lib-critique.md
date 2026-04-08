# 1) Executive Summary

`src/lib/**` has a strong intent (domain-first modules under `entities`), but implementation drift creates real maintainability and correctness risks. The largest issues are boundary erosion between `entities` and legacy `services`, inconsistent contracts (error semantics, type sources, naming), and duplicated operational logic (especially stock movement flows). The current state is workable, but costly: every new feature is more likely to copy-paste patterns, widen coupling, and diverge behavior.

The remediation path should be staged: first lock boundaries and contracts, then deduplicate repeated primitives, then complete structural convergence on one domain architecture. This can be done incrementally without a full rewrite.

# 2) Findings by Severity

## Critical

- **Boundary inversion between domain layers (`entities` <-> `services`)**
  - Evidence: `src/lib/entities/move-operations/use-cases/create-bin-operations-from-item.ts` imports `@/lib/services/bin-operations/helpers`; `src/lib/services/bin-operations/create-from-item.ts` re-exports entities and is marked `Todo: delete this`.
  - Smell: the intended domain layer is no longer authoritative; legacy service layer remains in live dependency paths.
  - Risk: unclear ownership, accidental circular concepts, and regressions when either path changes.
  - Staged remediation:
    - Stage 1: move `helpers.ts` into `entities/move-operations`.
    - Stage 2: replace all imports to point only at `entities`.
    - Stage 3: delete `src/lib/services/bin-operations/*` and `src/lib/services/index.ts`.

- **Model/domain mismatch in devices module**
  - Evidence: `src/lib/entities/devices/update-bin.ts` updates `prisma.bin` and uses `BinFormValues`, yet is exported as `updateBin` from `entities/devices/index.ts`.
  - Smell: module name and behavior contract are contradictory.
  - Risk: silent misuse and hard-to-detect bugs through wrong module imports.
  - Staged remediation:
    - Stage 1: deprecate export in `entities/devices/index.ts`.
    - Stage 2: move file into `entities/bins` (or replace with true `updateDevice`).
    - Stage 3: add lint guard to prevent cross-domain model updates from misnamed files.

## High

- **Root barrel exports couple incompatible runtime concerns**
  - Evidence: `src/lib/index.ts` exports both server/runtime modules and client modules transitively (`src/lib/auth/index.ts` includes `store.ts` with `'use client'`).
  - Smell: global barrel blends client-only and server-only modules.
  - Risk: import footguns, larger bundles, and accidental environment boundary leaks.
  - Staged remediation:
    - Stage 1: stop exporting `auth/store` from `auth/index.ts`.
    - Stage 2: split explicit entrypoints (`src/lib/server/*`, `src/lib/client/*` or equivalent).
    - Stage 3: ban broad `@/lib` barrel imports in app code.

- **Contract inconsistency in domain errors**
  - Evidence: some modules use `DomainError` (`entities/bins/create-bin.ts`, `entities/zones/create-zone.ts`), while many move-operation paths throw generic `Error` strings (`Source bin stock item not found`, `Bin not found`, etc.).
  - Smell: mixed error contract across domain modules.
  - Risk: inconsistent API mapping, weaker observability, brittle client behavior.
  - Staged remediation:
    - Stage 1: define typed domain errors for move operations.
    - Stage 2: replace generic string throws with typed errors/codes.
    - Stage 3: enforce via lint rule or shared throw helpers.

- **Type source inconsistency and duplicated enums**
  - Evidence: role/login unions are repeated in `entities/users/*` and `converters/table-records.ts`; schemas also define `roleValues/loginTypeValues`.
  - Smell: multiple "sources of truth" for the same domain enums.
  - Risk: drift when adding/changing roles or login types.
  - Staged remediation:
    - Stage 1: export canonical role/login types from one source (`generated/prisma` or a single domain types module).
    - Stage 2: replace handwritten unions everywhere.
    - Stage 3: add compile-time checks against enum drift.

- **Naming inconsistency around item identity**
  - Evidence: mixed `Item` terminology with `warItemId` fields and type alias `WARItem` in `src/lib/schemas/item.ts`.
  - Smell: legacy naming bleeds into current modules/contracts.
  - Risk: onboarding friction and mapping mistakes across DTOs and persistence.
  - Staged remediation:
    - Stage 1: define explicit naming map in one shared type file.
    - Stage 2: phase out `WARItem` alias in public contracts.
    - Stage 3: keep DB legacy names isolated at repository boundary only.

## Medium

- **Inconsistent validation depth across CRUD modules**
  - Evidence: `create-bin`/`create-zone` perform rich invariant checks; many `update-*` functions are thin passthroughs to Prisma updates.
  - Smell: business rules are enforced unevenly by operation type.
  - Risk: updates can violate invariants that creates protect.
  - Staged remediation:
    - Stage 1: define per-aggregate invariant checklist.
    - Stage 2: enforce in shared `validate-before-write` helpers used by create/update.
    - Stage 3: add invariant tests for both create and update paths.

- **Move-operation workflows duplicate transaction fragments**
  - Evidence: repeated patterns across `create-bin-operations-from-item`, `remove-from-bin`, `load-to-trolley`, `unload-from-trolley` (read source, validate qty, create BOE, adjust stock, adjust capacity).
  - Smell: same domain algorithm implemented in multiple shapes.
  - Risk: future bugfixes applied to only one flow.
  - Staged remediation:
    - Stage 1: extract shared transaction primitives (`assertStock`, `recordBoe`, `applyCapacityDelta`).
    - Stage 2: compose workflows from these primitives.
    - Stage 3: snapshot/integration tests per flow to ensure parity.

- **Schema-to-entity coupling is direct and leaky**
  - Evidence: entity functions frequently accept `*FormValues` from `src/lib/schemas/*`.
  - Smell: UI/form schema DTOs serve as domain command types.
  - Risk: form-level changes unintentionally break domain contracts.
  - Staged remediation:
    - Stage 1: introduce explicit domain command types in each aggregate.
    - Stage 2: map schema outputs to domain commands at route boundary.
    - Stage 3: prevent entities importing `schemas/*` directly.

## Low

- **Mixed style consistency issues**
  - Evidence: spacing/style inconsistencies (`code : string`, double spaces before function names in `authorize-device.ts`), inconsistent local type declarations (`interface` vs `type`) without clear convention.
  - Risk: small, but accumulates friction and reduces readability.
  - Staged remediation: apply formatter + lint style rules and a lightweight style guide for `src/lib`.

# 3) Repetition Hotspots

- **Stock movement checks and error strings**
  - Repeats: `"Source bin stock item not found"`, `"Insufficient quantity in source bin stock item"`, transit/origin variants across multiple use-cases.
  - Refactor target: central `assert*` guard helpers with typed error codes.

- **Stock item upsert/create defaults**
  - Repeats: initialization of `quantityAvailable`, `quantityReserved`, `quantityBlocked`, `status`, `transitDeviceId`.
  - Refactor target: `buildStockItemCreateData()` + `incrementStockItem()` primitives.

- **Soft-delete query predicates**
  - Repeats: `deletedAt: null` filters and `deletedAt + isActive` soft-delete updates across aggregates.
  - Refactor target: reusable repository predicates/helpers per aggregate.

- **Role/login literal unions**
  - Repeats: owner/office/warehouse role unions and login type unions in multiple files.
  - Refactor target: single canonical exported type.

- **Create/update JSON field shaping**
  - Repeats: `Prisma.JsonNull` conversion logic for nullable JSON fields (`dimensions`, `customPermissions`) in create/update modules.
  - Refactor target: shared `toNullableJsonInput()` helper.

- **Table-record mapping boilerplate**
  - Repeats: map functions converting dates/decimals and null fallbacks in `converters/table-records.ts`.
  - Refactor target: generic mappers for `toIso`, `decimalOrNull`, fallback rendering.

# 4) Top 10 Concrete Refactors

1. **Delete legacy bin-operations service layer** after moving `helpers.ts` into `entities/move-operations`; remove all `@/lib/services/bin-operations/*` imports.
2. **Fix `entities/devices/update-bin.ts` mismatch** by either relocating to bins domain or replacing with true `updateDevice` behavior.
3. **Split runtime-safe entrypoints** (`lib/server` and `lib/client`) and stop exporting client store from server barrels.
4. **Create a `MoveOperationError` taxonomy** and replace generic `Error` throws with coded domain errors.
5. **Extract shared move-operation transaction primitives** (`assertStockAvailability`, `recordBinOperationEntry`, `applyCapacityDelta`, `upsertAvailableStock`).
6. **Introduce canonical domain enums/types** for role/login and replace duplicate union literals.
7. **Decouple entities from form schemas** by adding domain command DTOs and boundary mappers in API layer.
8. **Add aggregate invariant validators for update paths** to match create-time rules (bins/zones/warehouses/users/devices).
9. **Normalize naming contracts** by removing `WARItem` alias from public types and documenting DB legacy fields in a single mapping module.
10. **Create shared persistence helpers** for soft-delete patterns and nullable JSON conversion to reduce repeated CRUD boilerplate.

# 5) Guardrails/standards to prevent regressions

- **Layering rule:** `entities/*` must not import from `services/*`; `services/*` should not contain domain logic (or be removed entirely).
- **Boundary rule:** routes map schema DTOs -> domain command DTOs; entities never import `src/lib/schemas/*`.
- **Error contract rule:** domain modules throw typed errors with stable `code`; no raw string `Error` in entities.
- **Entrypoint rule:** no global `@/lib` barrel imports in app code; import from explicit module paths (`@/lib/server/...`, `@/lib/client/...`).
- **Naming rule:** one canonical source for enum-like business types; legacy DB names isolated to persistence mapping layer.
- **Duplication rule:** when identical business logic appears in 2+ modules, extract shared primitive before adding a third occurrence.
- **Test guardrails:** add architecture tests (forbidden imports), invariant tests (create/update parity), and workflow parity tests for move operations.
- **Code review checklist:** require explicit checks for layering, typed errors, and duplicate literal unions in `src/lib/**` changes.
