---
source: src/components/dashboard/orders/dashboard-orders-overview-view.tsx
type: component
isCorrectCase: false
---

## Refactor Status

Status: in-progress
Old path: `src/components/dashboard/orders/dashboard-orders-overview-view.tsx`
New path: current batch keeps path; dashboard table wrapper created at `src/components/primitives/dashboard/dashboard-data-table.tsx`
Related files: `src/components/primitives/dashboard/dashboard-data-table.tsx`
Imports updated: yes
Typecheck status: `pnpm exec tsc --noEmit` passed
Notes: Warehouse workload and orders tables now render through `DashboardDataTable`; route and API behavior unchanged.
