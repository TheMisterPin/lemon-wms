---
source: src/components/dashboard/warehouses/use-dashboard-warehouse.tsx
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

- `src/components/dashboard/bins/DashboardBinsPageView.tsx`
- `src/components/dashboard/zones/DashboardZonesPageView.tsx`
- `src/components/dashboard/features/warehouses/create-warehouse-form.tsx`
- `src/components/dashboard/features/zones/create-zone-form.tsx`
- `src/components/dashboard/features/bins/create-bin-form.tsx`

### Context shape (`DashboardWarehouseContextValue`)

- **Data:** `warehouses` (`Warehouse[]`), `zones` (`ZoneTableRow[]` with `warehouseName` denormalized), `bins` (`BinTableRow[]` with `zoneName` / `warehouseName`), `warehouseOptions`, `zoneOptions`, `warehouseIdFilter` (`string | null`).
- **Status:** `isLoading`, `error` (string | null).
- **Actions:** `createWarehouse`, `createZone`, `createBin`, `refresh`.

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

- **`extractMutationError`:** Parses `AxiosError` + `ApiResponse` body for `MutationError`; falls back to generic message.
- **User-facing:** `useErrorDialog` `reportError` with titles/sources `dashboard/warehouses/create`, `dashboard/zones/create`, `dashboard/bins/create`; rethrows `Error` with message after reporting.

### Dependencies (imports)

- `dashboardApiClient`, `useErrorDialog`, entity config types (`BinTableRow`, `ZoneTableRow`), `Warehouse` / form value types from `@/lib/locations`, `SelectOption`, `ApiResponse`, `MutationError`.

### Internal helpers (meaningful)

- `extractMutationError`, inline API record types (`ZoneApiRecord`, `BinApiRecord`, `DashboardHomePayload`), `ApiPayload<T>`.

### Canonical hook doc

- See `.docs/developer/refactors/hooks/dashboard/warehouses/use-dashboard-warehouse.md` for the Hook Documentation Template snapshot used across phases.

## Phase 18 Inventory

Component name: Use Dashboard Warehouse generated hook/provider doc
Current file path: `src/components/dashboard/warehouses/use-dashboard-warehouse.tsx`
Current responsibility: Current hook + provider for Use Dashboard Warehouse. It owns the runtime data/state responsibilities recorded below; extraction or relocation is deferred to Phase 19/20.
Dependencies:
  - Components: @/components/configs/entities/bin/config, @/components/configs/entities/zone/config, @/components/shared/use-error-dialog, @/types/components/form/generic-form.types
  - Hooks: @/components/shared/use-error-dialog, useContext, useSearchParams, useErrorDialog, useDashboardWarehouse
  - Types: @/components/configs/entities/bin/config, @/components/configs/entities/zone/config, @/types, @/types/components/form/generic-form.types, @/types/responses/basic-response
  - Utils: next/navigation, @/lib/axios, @/lib/locations
Props: No named Props type detected; see hook responsibility doc.
Internal state: React useState, React useEffect lifecycle, React useMemo derived data, React useCallback actions/loaders, URL search params via useSearchParams
API calls: dashboardApiClient HTTP calls
Mutation calls: POST client mutation, createWarehouse, createZone, createBin, delete
Main UI blocks: T, WarehouseFormValues, DashboardWarehouseContextValue, Warehouse, ZoneApiRecord, BinApiRecord, ApiPayload, DashboardHomePayload, SelectOption, ZoneTableRow, BinTableRow, DashboardWarehouseContext.Provider
Declared child components inside the file: ApiPayload, ZoneApiRecord, BinApiRecord, DashboardHomePayload, DashboardWarehouseContextValue, DashboardWarehouseContext, extractMutationError, DashboardWarehouseProvider, useDashboardWarehouse
Repeated styling: None observed.
Repeated logic: .map(, .filter(, useMemo(
Recommended destination: TBD Phase 19/20; hook responsibility documented before any source movement.
Refactor priority: High for first-slice planning because it participates in provider, mutation, or route coupling.

### Provider / Hook Notes

- Canonical hook responsibility doc: `.docs/developer/refactors/hooks/dashboard/warehouses/use-dashboard-warehouse.md`.
- D-02 and D-03: DashboardWarehouseProvider/useDashboardWarehouse mixes provider state, API payload types, DTO shaping, mutation actions, mutation error parsing, search params, transformations, and direct consumers.
- D-05/D-07/D-09/D-10: metadata preserved, inventory current, no source movement or behavior change.
