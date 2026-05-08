---
source: src/hooks/dashboard/locations/use-dashboard-warehouse.tsx
type: hook
isCorrectCase: true
---

## Inventory (Phase 18 — current state)

**Constraints:** D-02, D-03, D-05, D-07, D-09, D-10. Documentation-only; target paths remain **TBD Phase 19**.

### Provider and hook

- **`DashboardWarehouseProvider`:** Client component; wraps children with `DashboardWarehouseContext.Provider`. Reads `warehouseId` from URL search params (`useSearchParams`). Loads dashboard home payload, owns fetch state, maps API records to context value, exposes create mutations and `refresh`.
- **`useDashboardWarehouse`:** Context consumer; throws if used outside provider.

### Integration point (D-03)

- Provider mounted in `src/app/(dashboard)/layout.tsx` inside `DashboardShell` / `Suspense`.

### Direct `useDashboardWarehouse` consumers (verified D-03)

- `src/components/features/locations/pages/dashboard-bins-page.tsx`
- `src/components/features/locations/pages/dashboard-zones-page.tsx`

**(Forms)** consume mutations via **`onCreate*`** props from page containers (**Phase 22-07**) — no direct hook import.

### Context shape (`DashboardWarehouseContextValue`)

- **Data:** `warehouses` (`Warehouse[]`), `zones` (`ZoneTableRow[]` with `warehouseName` denormalized), `bins` (`BinTableRow[]` with `zoneName` / `warehouseName`), `warehouseOptions`, `zoneOptions`, `warehouseIdFilter` (`string | null`).
- **Status:** `isLoading`, `error` (string | null).
- **Actions:** flat `createWarehouse`, `createZone`, `createBin`, `refresh` plus **`actions`** object mirroring the same four (**Phase 22-06**).

### Fetching

- **GET** `dashboardApiClient.get('/dashboard/home')` inside `useEffect`, keyed by `warehouseIdFilter` and internal `refreshKey`.
- **Filter:** When `warehouseIdFilter` is set, zones and bins lists are filtered to that warehouse after map from payload.

### DTO / mapping (current location = this file)

- **`ZoneTableRow` / `BinTableRow`:** Built via `useMemo` from raw API-shaped state; adds `warehouseName` / `zoneName` from memoized name maps.
- **Warehouses:** API list mapped to full `Warehouse` objects with defaulted fields (`status`, `timezone`, `currency`, `address`, `createdById`, `createdAt`, `deletedAt`).
- **Zones/bins raw:** Intermediate `ZoneApiRecord` / `BinApiRecord` types declared inline in this file.

### Mutations

- **POST** `/dashboard/warehouses`, `/dashboard/zones`, `/dashboard/bins` via `dashboardApiClient.post`; each calls `refresh()` on success.

### Mutation error handling

- **`extractMutationError`:** Imported from `@/lib/api/extract-mutation-error` (**Phase 22-02**); parses `AxiosError` + `ApiResponse` body for `MutationError`; falls back to generic message.
- **User-facing:** `useErrorDialog` `reportError` with titles/sources `dashboard/warehouses/create`, `dashboard/zones/create`, `dashboard/bins/create`; rethrows `Error` with message after reporting.

### Dependencies (imports)

- `dashboardApiClient`, `extractMutationError` (`@/lib/api/extract-mutation-error`), `useErrorDialog`, entity config types (`BinTableRow`, `ZoneTableRow`), `Warehouse` / form value types from `@/lib/locations`, `SelectOption`.

### Internal helpers (meaningful)

- Inline API record types (`ZoneApiRecord`, `BinApiRecord`, `DashboardHomePayload`), `ApiPayload<T>`.

### Canonical hook doc

- See `.docs/developer/refactors/hooks/dashboard/warehouses/use-dashboard-warehouse.md` for the Hook Documentation Template snapshot used across phases.

## Phase 18 Inventory

Component name: Use Dashboard Warehouse generated hook/provider doc
Current file path: `src/hooks/dashboard/locations/use-dashboard-warehouse.tsx`
Current responsibility: Current hook + provider for Use Dashboard Warehouse. It owns the runtime data/state responsibilities recorded below; extraction or relocation is deferred to Phase 19/20.
Dependencies:
  - Components: @/components/configs/entities/bin/config, @/components/configs/entities/zone/config, @/components/shared/use-error-dialog, @/types/components/form/generic-form.types
  - Hooks: @/components/shared/use-error-dialog, useContext, useSearchParams, useErrorDialog, useDashboardWarehouse
  - Types: @/components/configs/entities/bin/config, @/components/configs/entities/zone/config, @/types, @/types/components/form/generic-form.types, @/types/responses/basic-response
  - Utils: next/navigation, @/lib/axios, @/lib/locations
Props: No named Props type detected; see hook responsibility doc.
Internal state: React useState, React useEffect lifecycle, React useMemo derived data, React useCallback actions/loaders, URL search params via useSearchParams
API calls: dashboardApiClient HTTP calls
Mutation calls: POST client mutations for createWarehouse, createZone, and createBin
Main UI blocks: T, WarehouseFormValues, DashboardWarehouseContextValue, Warehouse, ZoneApiRecord, BinApiRecord, ApiPayload, DashboardHomePayload, SelectOption, ZoneTableRow, BinTableRow, DashboardWarehouseContext.Provider
Declared child components inside the file: ApiPayload, ZoneApiRecord, BinApiRecord, DashboardHomePayload, DashboardWarehouseContextValue, DashboardWarehouseContext, DashboardWarehouseProvider, useDashboardWarehouse
Repeated styling: None observed.
Repeated logic: .map(, .filter(, useMemo(
Recommended destination: TBD Phase 19/20; hook responsibility documented before any source movement.
Refactor priority: High for first-slice planning because it participates in provider, mutation, or route coupling.

### Provider / Hook Notes

- Canonical hook responsibility doc: `.docs/developer/refactors/hooks/dashboard/warehouses/use-dashboard-warehouse.md`.
- D-02 and D-03: DashboardWarehouseProvider/useDashboardWarehouse mixes provider state, API payload types, DTO shaping, mutation actions, mutation error parsing, search params, transformations, and direct consumers.
- D-05/D-07/D-09/D-10: metadata preserved, inventory current, no source movement or behavior change.

## Classification

Classification: hook
Reason: Provider/hook/API payload/DTO/transformer/mutation cluster; split later while keeping compatibility provider.
Target folder: `src/hooks/dashboard/locations`
Target file name: `use-dashboard-warehouse.tsx`
Keep / Move / Split / Delete: split
Risk level: high

### Evaluation

- Duplicates shadcn/ui: no
- Project-wide reusable: no
- Domain-specific: yes
- Fetches data: yes
- Mutates data: yes
- Contains reusable transformation logic: no
- Defines types inline: yes
- Contains repeated styling: yes
- Contains multiple components: yes
- Still needed: yes

### Decision

Record the split decision as planned ownership only. Phase 19 does not move source files, create target folders, rewrite imports, delete docs, or alter behavior.

## Logic Mapping

**Canonical hook responsibility + full Logic Mapping:** `.docs/developer/refactors/hooks/dashboard/warehouses/use-dashboard-warehouse.md` — treat that file as source of truth for the split (`types/api`, `types/dto`, `lib/transformers/locations`, hook `actions`, **`src/lib/api/extract-mutation-error.ts`**, provider removal). This generated doc mirrors inventory/classification only; do not contradict the canonical movement table.

**CFR-13:** Shared **`extractMutationError`** (**Phase 22-02**) — see `@/lib/api/extract-mutation-error.ts` and devices hook consumer path above.

## Dismounted Components

| Component | New code path | New documentation path | Reason |
|---|---|---|---|
| `DashboardWarehouseProvider` | `src/components/features/locations/providers/dashboard-warehouse-provider.tsx` | `.docs/developer/refactors/components/dismounted/dashboard-warehouse-provider.md` | Separate render child/helper responsibility so the future move keeps the parent focused and reviewable. |
| `useDashboardWarehouse` | `src/hooks/dashboard/locations/use-dashboard-warehouse.tsx` | `.docs/developer/refactors/components/dismounted/use-dashboard-warehouse.md` | Separate render child/helper responsibility so the future move keeps the parent focused and reviewable. |
| `DashboardWarehouseContext` | `src/components/features/locations/providers/dashboard-warehouse-provider.tsx` | `.docs/developer/refactors/components/dismounted/dashboard-warehouse-context.md` | Separate render child/helper responsibility so the future move keeps the parent focused and reviewable. |
| `ApiPayload` | `src/types/api/locations/dashboard-warehouse.ts` | `.docs/developer/refactors/components/dismounted/api-payload.md` | Separate render child/helper responsibility so the future move keeps the parent focused and reviewable. |
| `ZoneApiRecord` | `src/types/api/locations/dashboard-warehouse.ts` | `.docs/developer/refactors/components/dismounted/zone-api-record.md` | Separate render child/helper responsibility so the future move keeps the parent focused and reviewable. |
| `BinApiRecord` | `src/types/api/locations/dashboard-warehouse.ts` | `.docs/developer/refactors/components/dismounted/bin-api-record.md` | Separate render child/helper responsibility so the future move keeps the parent focused and reviewable. |
| `DashboardHomePayload` | `src/types/api/locations/dashboard-warehouse.ts` | `.docs/developer/refactors/components/dismounted/dashboard-home-payload.md` | Separate render child/helper responsibility so the future move keeps the parent focused and reviewable. |
| `extractMutationError` | `src/lib/api/extract-mutation-error.ts` | `.docs/developer/refactors/components/dismounted/extract-mutation-error.md` | **Phase 22-02** ✅ shared utility (CFR-13); devices hook consumes same module — not under `lib/transformers`. |

## Refactor Status

Status: split
Old path: `src/hooks/dashboard/locations/use-dashboard-warehouse.tsx`
New path: `src/hooks/dashboard/locations/use-dashboard-warehouse.tsx`
Related files:
- `src/app/(dashboard)/layout.tsx`
- `src/components/features/locations/pages/dashboard-bins-page.tsx`
- `src/components/features/locations/pages/dashboard-zones-page.tsx`
Imports updated: yes
Typecheck status: `pnpm exec tsc --noEmit` passed; targeted ESLint passed; full `pnpm lint` still has unrelated pre-existing repo failures.
Notes: Generated doc updated after `DashboardWarehouseProvider` and context consumption were removed. Canonical behavior details live in the hook responsibility doc.
