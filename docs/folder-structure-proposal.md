# Folder Structure Proposal (v1)

This proposal introduces a **feature-first + shared-kernel** layout so Lemon WMS can scale domain features without creating cross-folder coupling.

## Goals

- Keep each business area (auth, warehouses, bins, items, users, etc.) in one predictable place.
- Separate reusable UI primitives from feature-specific UI.
- Make API, domain logic, validation, and tests easy to find together.
- Reduce growth of global `utils` buckets by moving code to clear ownership boundaries.

---

## Proposed Top-Level `src/` Layout

```text
src/
  app/                         # Next.js App Router entrypoints only (routing + composition)
    (auth)/
    (dashboard)/
    (warehouse)/
    api/

  features/                    # Feature modules (primary place for product code)
    auth/
      api/                     # Auth route helpers / service bindings
      components/              # Auth-specific UI
      domain/                  # Entities, auth rules, use-cases
      schemas/                 # Zod schemas and DTO validation
      server/                  # Server-only auth helpers
      client/                  # Client hooks/adapters (if needed)
      __tests__/

    warehouses/
      api/
      components/
      domain/
      schemas/
      server/
      __tests__/

    zones/
    bins/
    items/
    users/
    dashboard/
    floor/

  shared/                      # Cross-feature shared code (small and intentional)
    ui/                        # Design-system primitives (button, dialog, input)
    components/                # Reusable app-level composites
    hooks/
    utils/                     # Pure generic helpers only
    types/
    constants/

  server/                      # App-wide server infrastructure
    db/                        # Prisma client setup, repositories base
    auth/                      # Global middleware/session glue
    logging/
    config/

  test/                        # Shared test factories, mocks, setup helpers
    factories/
    fixtures/
    utils/
```

---

## Route-to-Feature Ownership Pattern

Keep `src/app` lightweight:

- Route files should mainly orchestrate request/response behavior.
- Business rules should live under `src/features/<feature>/domain` or `server`.
- UI pages should compose components from `src/features/*/components` and `src/shared/*`.

Example:

```text
src/app/api/warehouses/route.ts
  -> uses src/features/warehouses/api/create-warehouse-handler.ts
  -> uses src/features/warehouses/domain/create-warehouse.ts
  -> uses src/features/warehouses/schemas/create-warehouse.schema.ts
```

---

## Mapping From Current Layout

- `src/components/ui/*` -> `src/shared/ui/*`
- `src/components/dashboard/*` -> `src/features/dashboard/components/*`
- `src/components/auth/*` -> `src/features/auth/components/*`
- `src/components/warehouse/*` -> `src/features/floor/components/*` (or `features/warehouse-ui` if preferred)
- `src/utils/auth/*` -> `src/features/auth/server/*`
- `src/utils/components/forms/schemas/*` -> corresponding `src/features/*/schemas/*`
- `src/types/models/*` -> nearest feature `domain` (or `src/shared/types` if truly cross-feature)
- `src/__tests__/app/...` and `src/__tests__/utils/...` -> colocated `__tests__` inside each feature

---

## Migration Plan

### Phase 1 (safe + low risk)

- Create `src/features`, `src/shared`, and `src/server` folders.
- Move only new code to the new structure.
- Add import aliases:
  - `@/features/*`
  - `@/shared/*`
  - `@/server/*`

### Phase 2 (incremental refactor)

- Migrate feature by feature (auth -> warehouses -> bins -> items -> users).
- Keep temporary re-export shims in old paths while moving imports gradually.
- Co-locate tests with migrated feature modules.

### Phase 3 (cleanup)

- Remove obsolete `src/utils/components/*` and duplicated input component variants.
- Remove shim exports.
- Enforce boundaries with ESLint rules (e.g., no feature importing another feature's internals directly).

---

## Naming Conventions

- Prefer singular feature directories (`auth`, `warehouse`, `item`) or plural consistently; choose one and document it.
- Use `*.schema.ts` for validation, `*.service.ts` for orchestration, `*.repo.ts` for data access.
- Put server-only code in `server/` folders to avoid client bundle leaks.

---

## Expected Outcomes

- Faster onboarding: clearer “where code lives” by feature.
- Lower coupling: fewer global helper dumping grounds.
- Better testability: feature-local tests + shared test utilities.
- Easier scaling: new business workflows can ship as self-contained feature modules.
