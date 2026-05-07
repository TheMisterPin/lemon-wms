---
source: src/components/dashboard/stock/use-dashboard-stock.tsx
type: hook
isCorrectCase: true
---

## Inventory (Phase 18)

**Canonical:** `.docs/developer/refactors/hooks/dashboard/stock/use-dashboard-stock.md`

### Summary

**`useDashboardStock(options?)`** — Optional `warehouseId` scopes GET `/dashboard/stock?warehouseId=...`. Returns `StockDashboardData | null`, loading, error, `refetch`.

### API

- **GET** `/dashboard/stock` with optional query string built in module helper `fetchStockDashboardData`.

### State

- `data`, `isLoading`, `error`; initial fetch in `useEffect` with cancellation guard; `refetch` uses inline async IIFE.

### Mutations

- None.

### Internal helpers

- `fetchStockDashboardData(warehouseId)` — shared by effect and refetch.

### Refactor notes

- Target hook path **TBD Phase 19/20**.

## Phase 18 Inventory

Component name: Use Dashboard Stock generated hook/provider doc
Current file path: `src/components/dashboard/stock/use-dashboard-stock.tsx`
Current responsibility: Current hook for Use Dashboard Stock. It owns the runtime data/state responsibilities recorded below; extraction or relocation is deferred to Phase 19/20.
Dependencies:
  - Components: None observed in current source.
  - Hooks: useDashboardStock
  - Types: @/types/responses/basic-response, @/types/stock-dashboard.types
  - Utils: @/lib/axios
Props: No named Props type detected; see hook responsibility doc.
Internal state: React useState, React useEffect lifecycle, React useCallback actions/loaders
API calls: dashboardApiClient HTTP calls
Mutation calls: None observed.
Main UI blocks: StockDashboardFetchResult, ApiResponse, StockDashboardData
Declared child components inside the file: UseDashboardStockOptions, UseDashboardStockReturn, StockDashboardFetchResult, useDashboardStock
Repeated styling: None observed.
Repeated logic: None significant observed.
Recommended destination: TBD Phase 19/20; hook responsibility documented before any source movement.
Refactor priority: Medium because it has repeated UI structure or multiple declarations to classify later.

### Provider / Hook Notes

- Canonical hook responsibility doc: `.docs/developer/refactors/hooks/dashboard/stock/use-dashboard-stock.md`.
- CFR-02: selected hook responsibility is documented under .docs/developer/refactors/hooks.
- D-05/D-07/D-09/D-10: metadata preserved, inventory current, no source movement or behavior change.
