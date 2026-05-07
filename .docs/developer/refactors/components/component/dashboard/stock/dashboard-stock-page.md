---
source: src/components/dashboard/stock/dashboard-stock-page.tsx
type: component
isCorrectCase: true
---

## Inventory (Phase 18)

Component name:
DashboardStockPage

Current file path:
`src/components/dashboard/stock/dashboard-stock-page.tsx`

Current responsibility:
Global stock dashboard page: uses **`useDashboardStock()`** (optional warehouse filter via internal options — see source), recharts pie/bar sections, category KPI cards, loading via `DashboardStockPageSkeleton`.

Dependencies:
  - Hooks: **`useDashboardStock`**
  - Components: `DashboardStockPageSkeleton`, shadcn `Card`, `recharts`
  - Types: `StockDashboardCategoryRow`, `StockDashboardData` via hook

Props:
(none on exported page)

Internal state:
(see source — warehouse filter wiring if any)

API calls:
(via hook)

Mutation calls:
(none)

Main UI blocks:
Skeleton branch; error; multi-section charts and tables (large file — ~400 lines)

Declared child components inside the file:
`StockSection`, chart helpers (see source)

Repeated styling:
`rechartsTooltip` constant, `chartColors`, card shells

Repeated logic:
Category icon rotation via `useMemo`

Recommended destination:
TBD Phase 19

Refactor priority:
high
