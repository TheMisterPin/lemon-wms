---
source: src/components/dashboard/warehouses/dashboard-warehouse-overview.tsx
type: component
isCorrectCase: true
---

## Inventory (Phase 18)

**Constraints:** D-04, D-09. Target **TBD Phase 19**.

Component name:
DashboardWarehouseOverviewView

Current file path:
`src/components/dashboard/warehouses/dashboard-warehouse-overview.tsx`

Current responsibility:
Warehouse command-center UI from `WarehouseOverviewDashboardData`: KPI cards (with optional warehouse-fill progress), workload vs stock summary grid, zone summary + activity grid. Supports `variant`: `page` (wraps `<main>`) or `embedded` (inner layout only).

Dependencies:
  - Components:
    - `./components/warehouse-overview-icons`, `./components/warehouse-overview-primitives`
    - `./components/WarehouseActivitySummary`, `WarehouseOrderWorkload`, `WarehouseStockSummary`, `WarehouseZoneSummary`
  - Hooks:
    - (none — presentational + local helpers)
  - Types:
    - `@/types/warehouse-overview-dashboard.types`, local icon/tone types from child modules
  - Utils:
    - `react` `ComponentType`

Props:
`DashboardWarehouseOverviewViewProps` — `data: WarehouseOverviewDashboardData`, optional `variant?: 'page' | 'embedded'`

Internal state:
(none — derives KPI list via `mergeWarehouseOverviewKpis`, fill % via `parseWarehouseFillPercent`)

API calls:
(none)

Mutation calls:
(none)

Main UI blocks:
KPI grid, dual-column workload/stock, dual-column zones/activity, optional `<main>` shell when `variant === 'page'`.

Declared child components inside the file:
`KpiRenderable` (type alias), `WAREHOUSE_OVERVIEW_KPI_ICONS`, `mergeWarehouseOverviewKpis`, `parseWarehouseFillPercent`, `WarehouseOverviewKpiCard`, `DashboardWarehouseOverviewView`

Repeated styling:
KPI card tile pattern repeated via map; `--wh-*` tokens.

Repeated logic:
KPI merge maps labels to icons; fill percent parse — evidence for future transformer/helper.

Recommended destination:
TBD Phase 19 (likely `components/features/locations/...` page assembly).

Refactor priority:
high — multiple child imports and local chart/card helpers.
