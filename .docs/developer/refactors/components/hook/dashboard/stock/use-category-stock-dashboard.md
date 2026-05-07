---
source: src/components/dashboard/stock/use-category-stock-dashboard.ts
type: hook
isCorrectCase: true
---

## Inventory (Phase 18)

**Canonical:** `.docs/developer/refactors/hooks/dashboard/stock/use-category-stock-dashboard.md`

### Summary

**`useCategoryStockDashboard(categoryId?)`** — GET `/dashboard/stock/categories/overview` with optional `?categoryId=`.

### Fetch / state

- Same pattern as other stock read hooks: `load` in `useEffect`, `data` / `isLoading` / `error` / `refetch`.

### Mutations

- None.

### Types

- `CategoryStockDashboardDTO` from `@/types/category-stock-dashboard.types`.

### Refactor notes

- Target **TBD Phase 19/20**.

## Phase 18 Inventory

Component name: Use Category Stock Dashboard generated hook/provider doc
Current file path: `src/components/dashboard/stock/use-category-stock-dashboard.ts`
Current responsibility: Current hook for Use Category Stock Dashboard. It owns the runtime data/state responsibilities recorded below; extraction or relocation is deferred to Phase 19/20.
Dependencies:
  - Components: None observed in current source.
  - Hooks: useCategoryStockDashboard
  - Types: @/types/category-stock-dashboard.types, @/types/responses/basic-response
  - Utils: @/lib/axios
Props: No named Props type detected; see hook responsibility doc.
Internal state: React useState, React useEffect lifecycle, React useCallback actions/loaders
API calls: dashboardApiClient HTTP calls
Mutation calls: None observed.
Main UI blocks: CategoryStockDashboardDTO, ApiResponse
Declared child components inside the file: UseCategoryStockDashboardReturn, useCategoryStockDashboard
Repeated styling: None observed.
Repeated logic: None significant observed.
Recommended destination: TBD Phase 19/20; hook responsibility documented before any source movement.
Refactor priority: Normal baseline inventory priority.

### Provider / Hook Notes

- Canonical hook responsibility doc: `.docs/developer/refactors/hooks/dashboard/stock/use-category-stock-dashboard.md`.
- CFR-02: selected hook responsibility is documented under .docs/developer/refactors/hooks.
- D-05/D-07/D-09/D-10: metadata preserved, inventory current, no source movement or behavior change.
