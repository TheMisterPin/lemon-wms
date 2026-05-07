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

## Classification

Classification: feature-page
Reason: Warehouse overview page view contains KPI types, icon maps, merge/parse helpers, and child KPI card.
Target folder: `src/components/features/locations/pages`
Target file name: `dashboard-warehouse-overview.tsx`
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
| `WarehouseOverviewKpiCard` | `src/components/features/locations/pages/warehouse-overview-kpi-card.tsx` | `.docs/developer/refactors/components/dismounted/warehouse-overview-kpi-card.md` | Separate render child/helper responsibility so the future move keeps the parent focused and reviewable. |
| `KpiRenderable` | `src/types/dto/locations/kpi-renderable.ts` | `.docs/developer/refactors/components/dismounted/kpi-renderable.md` | Separate render child/helper responsibility so the future move keeps the parent focused and reviewable. |
| `WAREHOUSE_OVERVIEW_KPI_ICONS` | `src/components/features/locations/pages/w-a-r-e-h-o-u-s-e-o-v-e-r-v-i-e-w-k-p-i-i-c-o-n-s.ts` | `.docs/developer/refactors/components/dismounted/w-a-r-e-h-o-u-s-e-o-v-e-r-v-i-e-w-k-p-i-i-c-o-n-s.md` | Separate render child/helper responsibility so the future move keeps the parent focused and reviewable. |
| `mergeWarehouseOverviewKpis` | `src/lib/transformers/locations/merge-warehouse-overview-kpis.ts` | `.docs/developer/refactors/components/dismounted/merge-warehouse-overview-kpis.md` | Separate render child/helper responsibility so the future move keeps the parent focused and reviewable. |
| `parseWarehouseFillPercent` | `src/lib/transformers/locations/parse-warehouse-fill-percent.ts` | `.docs/developer/refactors/components/dismounted/parse-warehouse-fill-percent.md` | Separate render child/helper responsibility so the future move keeps the parent focused and reviewable. |
