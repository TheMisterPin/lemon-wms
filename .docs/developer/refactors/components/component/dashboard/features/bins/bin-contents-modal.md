---
source: src/components/dashboard/features/bins/bin-contents-modal.tsx
type: component
isCorrectCase: true
---

## Inventory (Phase 18)

Component name:
BinContentsModal (+ helpers `quantityForBinItemStatus`, `toContentTableRows`)

Current file path:
`src/components/dashboard/features/bins/bin-contents-modal.tsx`

Current responsibility:
Dialog listing bin contents; fetches bin+lines via **`dashboardApiClient`** when opened; uses `TableShell` + column config; not a `useDashboardWarehouse` consumer but in selected feature bins scope.

API calls:
GET against bin contents endpoint (see source for exact path)

Mutation calls:
(none)

Dependencies:
  - `dashboardApiClient`, `TableShell`, `useTableShellController`, dialog primitives

Recommended destination:
TBD Phase 19

Refactor priority:
medium
