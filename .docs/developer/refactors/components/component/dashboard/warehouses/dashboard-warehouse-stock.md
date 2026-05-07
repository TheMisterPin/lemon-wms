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

## Classification

Classification: feature-page
Reason: Warehouse stock page view contains KPI types, icon maps, merge helper, and child KPI card.
Target folder: `src/components/features/locations/pages`
Target file name: `dashboard-warehouse-stock.tsx`
Keep / Move / Split / Delete: split
Risk level: high

### Evaluation

- Duplicates shadcn/ui: no
- Project-wide reusable: no
- Domain-specific: yes
- Fetches data: no
- Mutates data: no
- Contains reusable transformation logic: yes
- Defines types inline: yes
- Contains repeated styling: yes
- Contains multiple components: yes
- Still needed: yes

### Decision

Record the split decision as planned ownership only. Phase 19 does not move source files, create target folders, rewrite imports, delete docs, or alter behavior.

## Dismounted Components

| Component | New code path | New documentation path | Reason |
|---|---|---|---|
| `WarehouseStockKpiCard` | `src/components/features/locations/pages/warehouse-stock-kpi-card.tsx` | `.docs/developer/refactors/components/dismounted/warehouse-stock-kpi-card.md` | Separate render child/helper responsibility so the future move keeps the parent focused and reviewable. |
| `StockKpiRenderable` | `src/types/dto/locations/stock-kpi-renderable.ts` | `.docs/developer/refactors/components/dismounted/stock-kpi-renderable.md` | Separate render child/helper responsibility so the future move keeps the parent focused and reviewable. |
| `STOCK_KPI_ICONS` | `src/components/features/locations/pages/s-t-o-c-k-k-p-i-i-c-o-n-s.ts` | `.docs/developer/refactors/components/dismounted/s-t-o-c-k-k-p-i-i-c-o-n-s.md` | Separate render child/helper responsibility so the future move keeps the parent focused and reviewable. |
| `mergeStockKpis` | `src/lib/transformers/locations/merge-stock-kpis.ts` | `.docs/developer/refactors/components/dismounted/merge-stock-kpis.md` | Separate render child/helper responsibility so the future move keeps the parent focused and reviewable. |
