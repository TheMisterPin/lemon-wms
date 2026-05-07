---
source: src/components/dashboard/warehouses/dashboard-warehouse-stock.tsx
type: component
isCorrectCase: true
---

## Inventory (Phase 18)

**Constraints:** D-04, D-09. Target **TBD Phase 19**.

Component name:
DashboardWarehouseStockView

Current file path:
`src/components/dashboard/warehouses/dashboard-warehouse-stock.tsx`

Current responsibility:
Warehouse-scoped stock analytics view from `WarehouseStockDashboardData`: KPI strip, category mix chart, zones table, items table, availability bar chart. Breadcrumb links back to warehouses routes.

Dependencies:
  - Components:
    - `warehouse-overview-icons`, `warehouse-overview-primitives` (tone + icons)
    - `WarehouseStockAvailabilityBarChart`, `WarehouseStockItemsTable`, `WarehouseStockSummary`, `WarehouseStockZonesTable`
  - Hooks:
    - (none)
  - Types:
    - `@/types/warehouse-stock-dashboard.types`
  - Utils:
    - `next/link`

Props:
`DashboardWarehouseStockViewProps` — `{ data: WarehouseStockDashboardData }`

Internal state:
(none — maps KPI rows with `mergeStockKpis`)

API calls:
(none)

Mutation calls:
(none)

Main UI blocks:
Breadcrumb row, responsive KPI grid, chart + tables composition per JSX return tail (see source for full tree).

Declared child components inside the file:
`StockKpiRenderable` (alias), `STOCK_KPI_ICONS`, `mergeStockKpis`, `WarehouseStockKpiCard`, `DashboardWarehouseStockView`

Repeated styling:
KPI card matches overview pattern; shared tokens.

Repeated logic:
Label→icon map for KPIs — similar to overview KPI merge.

Recommended destination:
TBD Phase 19

Refactor priority:
high
