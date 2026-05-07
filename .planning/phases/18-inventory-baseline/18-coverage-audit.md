# Phase 18 coverage audit

**Created:** 2026-05-07  
**Purpose:** Selected source-to-doc matrix for Phase 18 inventory execution (plan 18-01).  
**Rules:** No classification beyond `TBD Phase 19`. Duplicate or stale doc paths may be noted but **must not be deleted** in Phase 18 (D-05, D-06, research).

## Out of scope / explicit exclusions

- Whole-app inventory outside the D-01 dashboard warehouse/location/stock slice.
- Any **code moves**, **target source folder creation**, **import rewires**, **API/validation/mutation** changes, or **visual redesign** (D-08, D-09).
- `src/components/dashboard/features/devices/**` (not listed in CONTEXT D-01).

## Selected Source Scope

| Source path | Kind | Primary export / notes | Execution plan |
|-------------|------|------------------------|----------------|
| `src/components/dashboard/bins/DashboardBinsPageView.tsx` | component | D-03 consumer | 18-07 |
| `src/components/dashboard/bins/bin-dashboard-overview-page-client.tsx` | page client | — | 18-07 |
| `src/components/dashboard/bins/bin-overview-dashboard.tsx` | component | — | 18-07 |
| `src/components/dashboard/bins/use-dashboard-bin-overview.ts` | hook | — | 18-03 |
| `src/components/dashboard/features/bins/bin-contents-modal.tsx` | component | — | 18-09 |
| `src/components/dashboard/features/bins/create-bin-form.tsx` | component | D-03 consumer | 18-09 |
| `src/components/dashboard/features/warehouses/create-warehouse-form.tsx` | feature form | D-03 consumer | 18-09 |
| `src/components/dashboard/features/zones/create-zone-form.tsx` | component | D-03 consumer | 18-09 |
| `src/components/dashboard/stock/category-stock-dashboard.tsx` | component | — | 18-08 |
| `src/components/dashboard/stock/category-stock-page-client.tsx` | page client | — | 18-08 |
| `src/components/dashboard/stock/dashboard-stock-page-skeleton.tsx` | skeleton | — | 18-08 |
| `src/components/dashboard/stock/dashboard-stock-page.tsx` | component | — | 18-08 |
| `src/components/dashboard/stock/inventory-health-dashboard.tsx` | component | — | 18-08 |
| `src/components/dashboard/stock/inventory-health-page-client.tsx` | page client | — | 18-08 |
| `src/components/dashboard/stock/item-detail-dashboard.tsx` | component | — | 18-08 |
| `src/components/dashboard/stock/item-detail-page-client.tsx` | page client | — | 18-08 |
| `src/components/dashboard/stock/use-category-stock-dashboard.ts` | hook | — | 18-03 |
| `src/components/dashboard/stock/use-dashboard-stock.tsx` | hook | — | 18-03 |
| `src/components/dashboard/stock/use-inventory-health-dashboard.ts` | hook | — | 18-03 |
| `src/components/dashboard/stock/use-item-detail-dashboard.ts` | hook | — | 18-03 |
| `src/components/dashboard/warehouses/components/BinGrid.tsx` | child component | — | 18-05 |
| `src/components/dashboard/warehouses/components/DirectorySections.tsx` | child component | — | 18-05 |
| `src/components/dashboard/warehouses/components/OverviewCards.tsx` | child component | — | 18-05 |
| `src/components/dashboard/warehouses/components/WarehouseActivitySummary.tsx` | child component | — | 18-05 |
| `src/components/dashboard/warehouses/components/WarehouseDashboardOverviewSkeleton.tsx` | child component | — | 18-05 |
| `src/components/dashboard/warehouses/components/WarehouseOrderWorkload.tsx` | child component | — | 18-05 |
| `src/components/dashboard/warehouses/components/WarehouseStockAvailabilityBarChart.tsx` | child component | — | 18-05 |
| `src/components/dashboard/warehouses/components/WarehouseStockDashboardSkeleton.tsx` | child component | — | 18-05 |
| `src/components/dashboard/warehouses/components/WarehouseStockItemsTable.tsx` | child component | — | 18-06 |
| `src/components/dashboard/warehouses/components/WarehouseStockSummary.tsx` | child component | — | 18-06 |
| `src/components/dashboard/warehouses/components/WarehouseStockZonesTable.tsx` | child component | — | 18-06 |
| `src/components/dashboard/warehouses/components/WarehouseZoneSummary.tsx` | child component | — | 18-06 |
| `src/components/dashboard/warehouses/components/dashboard-types.ts` | types module | — | 18-06 |
| `src/components/dashboard/warehouses/components/warehouse-overview-icons.tsx` | child component | — | 18-05 |
| `src/components/dashboard/warehouses/components/warehouse-overview-primitives.tsx` | child component | — | 18-05 |
| `src/components/dashboard/warehouses/components/warehouse-overview-types.ts` | types module | — | 18-06 |
| `src/components/dashboard/warehouses/dashboard-location-page-skeleton.tsx` | skeleton | — | 18-04 |
| `src/components/dashboard/warehouses/dashboard-location-page.tsx` | page-level view | — | 18-04 |
| `src/components/dashboard/warehouses/dashboard-warehouse-home-page.tsx` | page-level view | — | 18-04 |
| `src/components/dashboard/warehouses/dashboard-warehouse-overview.tsx` | page-level view | — | 18-04 |
| `src/components/dashboard/warehouses/dashboard-warehouse-stock.tsx` | page-level view | — | 18-04 |
| `src/components/dashboard/warehouses/use-dashboard-warehouse.tsx` | hook + provider | `DashboardWarehouseProvider`, `useDashboardWarehouse` (D-02) | 18-02 |
| `src/components/dashboard/warehouses/warehouse-dashboard-overview-page-client.tsx` | page client | — | 18-04 |
| `src/components/dashboard/warehouses/warehouse-stock-dashboard-page-client.tsx` | page client | — | 18-04 |
| `src/components/dashboard/zones/DashboardZonesPageView.tsx` | component | D-03 consumer | 18-07 |
| `src/components/dashboard/zones/components/ZoneFillDistributionBarChart.tsx` | component | — | 18-07 |
| `src/components/dashboard/zones/components/ZoneOverviewKpiStrip.tsx` | component | — | 18-07 |
| `src/components/dashboard/zones/components/zone-bins-section.tsx` | component | — | 18-07 |
| `src/components/dashboard/zones/components/zone-overview-dashboard-skeleton.tsx` | skeleton | — | 18-07 |
| `src/components/dashboard/zones/zone-dashboard-overview-page-client.tsx` | page client | — | 18-07 |
| `src/components/dashboard/zones/zone-overview-dashboard.tsx` | component | — | 18-07 |
| `src/app/(dashboard)/layout.tsx` | route layout | `DashboardWarehouseProvider` integration only (CONTEXT) | 18-02 |

## Documentation Coverage Matrix

| Source | Generated-doc path (@doc) | Doc exists | Doc status | Canonical hook doc `.docs/.../hooks/...` | Plan |
|--------|---------------------------|------------|------------|---------------------------------------------|------|
| `src/app/(dashboard)/layout.tsx` | *no @doc in source* | false | missing | — | 18-02 |
| `src/components/dashboard/bins/DashboardBinsPageView.tsx` | `.docs/developer/refactors/components/component/dashboard/bins/dashboard-bins-page-view.md` | true | frontmatter-only | — | 18-07 |
| `src/components/dashboard/bins/bin-dashboard-overview-page-client.tsx` | `.docs/developer/refactors/components/component/dashboard/bins/bin-dashboard-overview-page-client.md` | true | frontmatter-only | — | 18-07 |
| `src/components/dashboard/bins/bin-overview-dashboard.tsx` | `.docs/developer/refactors/components/component/dashboard/bins/bin-overview-dashboard.md` | true | frontmatter-only | — | 18-07 |
| `src/components/dashboard/bins/use-dashboard-bin-overview.ts` | `.docs/developer/refactors/components/hook/dashboard/bins/use-dashboard-bin-overview.md` | true | frontmatter-only | `.docs/developer/refactors/hooks/dashboard/bins/use-dashboard-bin-overview.md` → missing | 18-03 |
| `src/components/dashboard/features/bins/bin-contents-modal.tsx` | `.docs/developer/refactors/components/component/dashboard/features/bins/bin-contents-modal.md` | true | frontmatter-only | — | 18-09 |
| `src/components/dashboard/features/bins/create-bin-form.tsx` | `.docs/developer/refactors/components/component/dashboard/features/bins/create-bin-form.md` | true | frontmatter-only | — | 18-09 |
| `src/components/dashboard/features/warehouses/create-warehouse-form.tsx` | `.docs/developer/refactors/components/component/dashboard/features/warehouses/create-warehouse-form.md` | true | frontmatter-only | — | 18-09 |
| `src/components/dashboard/features/zones/create-zone-form.tsx` | `.docs/developer/refactors/components/component/dashboard/features/zones/create-zone-form.md` | true | frontmatter-only | — | 18-09 |
| `src/components/dashboard/stock/category-stock-dashboard.tsx` | `.docs/developer/refactors/components/component/dashboard/stock/category-stock-dashboard.md` | true | frontmatter-only | — | 18-08 |
| `src/components/dashboard/stock/category-stock-page-client.tsx` | `.docs/developer/refactors/components/component/dashboard/stock/category-stock-page-client.md` | true | frontmatter-only | — | 18-08 |
| `src/components/dashboard/stock/dashboard-stock-page-skeleton.tsx` | `.docs/developer/refactors/components/component/dashboard/stock/dashboard-stock-page-skeleton.md` | true | frontmatter-only | — | 18-08 |
| `src/components/dashboard/stock/dashboard-stock-page.tsx` | `.docs/developer/refactors/components/component/dashboard/stock/dashboard-stock-page.md` | true | frontmatter-only | — | 18-08 |
| `src/components/dashboard/stock/inventory-health-dashboard.tsx` | `.docs/developer/refactors/components/component/dashboard/stock/inventory-health-dashboard.md` | true | frontmatter-only | — | 18-08 |
| `src/components/dashboard/stock/inventory-health-page-client.tsx` | `.docs/developer/refactors/components/component/dashboard/stock/inventory-health-page-client.md` | true | frontmatter-only | — | 18-08 |
| `src/components/dashboard/stock/item-detail-dashboard.tsx` | `.docs/developer/refactors/components/component/dashboard/stock/item-detail-dashboard.md` | true | frontmatter-only | — | 18-08 |
| `src/components/dashboard/stock/item-detail-page-client.tsx` | `.docs/developer/refactors/components/component/dashboard/stock/item-detail-page-client.md` | true | frontmatter-only | — | 18-08 |
| `src/components/dashboard/stock/use-category-stock-dashboard.ts` | `.docs/developer/refactors/components/hook/dashboard/stock/use-category-stock-dashboard.md` | true | frontmatter-only | `.docs/developer/refactors/hooks/dashboard/stock/use-category-stock-dashboard.md` → missing | 18-03 |
| `src/components/dashboard/stock/use-dashboard-stock.tsx` | `.docs/developer/refactors/components/hook/dashboard/stock/use-dashboard-stock.md` | true | frontmatter-only | `.docs/developer/refactors/hooks/dashboard/stock/use-dashboard-stock.md` → missing | 18-03 |
| `src/components/dashboard/stock/use-inventory-health-dashboard.ts` | `.docs/developer/refactors/components/hook/dashboard/stock/use-inventory-health-dashboard.md` | true | frontmatter-only | `.docs/developer/refactors/hooks/dashboard/stock/use-inventory-health-dashboard.md` → missing | 18-03 |
| `src/components/dashboard/stock/use-item-detail-dashboard.ts` | `.docs/developer/refactors/components/hook/dashboard/stock/use-item-detail-dashboard.md` | true | frontmatter-only | `.docs/developer/refactors/hooks/dashboard/stock/use-item-detail-dashboard.md` → missing | 18-03 |
| `src/components/dashboard/warehouses/components/BinGrid.tsx` | `.docs/developer/refactors/components/component/dashboard/warehouses/components/bin-grid.md` | true | frontmatter-only | — | 18-05 |
| `src/components/dashboard/warehouses/components/DirectorySections.tsx` | `.docs/developer/refactors/components/component/dashboard/warehouses/components/directory-sections.md` | true | frontmatter-only | — | 18-05 |
| `src/components/dashboard/warehouses/components/OverviewCards.tsx` | `.docs/developer/refactors/components/component/dashboard/warehouses/components/overview-cards.md` | true | frontmatter-only | — | 18-05 |
| `src/components/dashboard/warehouses/components/WarehouseActivitySummary.tsx` | `.docs/developer/refactors/components/component/dashboard/warehouses/components/warehouse-activity-summary.md` | true | frontmatter-only | — | 18-05 |
| `src/components/dashboard/warehouses/components/WarehouseDashboardOverviewSkeleton.tsx` | `.docs/developer/refactors/components/component/dashboard/warehouses/components/warehouse-dashboard-overview-skeleton.md` | true | frontmatter-only | — | 18-05 |
| `src/components/dashboard/warehouses/components/WarehouseOrderWorkload.tsx` | `.docs/developer/refactors/components/component/dashboard/warehouses/components/warehouse-order-workload.md` | true | frontmatter-only | — | 18-05 |
| `src/components/dashboard/warehouses/components/WarehouseStockAvailabilityBarChart.tsx` | `.docs/developer/refactors/components/component/dashboard/warehouses/components/warehouse-stock-availability-bar-chart.md` | true | frontmatter-only | — | 18-05 |
| `src/components/dashboard/warehouses/components/WarehouseStockDashboardSkeleton.tsx` | `.docs/developer/refactors/components/component/dashboard/warehouses/components/warehouse-stock-dashboard-skeleton.md` | true | frontmatter-only | — | 18-05 |
| `src/components/dashboard/warehouses/components/WarehouseStockItemsTable.tsx` | `.docs/developer/refactors/components/component/dashboard/warehouses/components/warehouse-stock-items-table.md` | true | frontmatter-only | — | 18-06 |
| `src/components/dashboard/warehouses/components/WarehouseStockSummary.tsx` | `.docs/developer/refactors/components/component/dashboard/warehouses/components/warehouse-stock-summary.md` | true | frontmatter-only | — | 18-06 |
| `src/components/dashboard/warehouses/components/WarehouseStockZonesTable.tsx` | `.docs/developer/refactors/components/component/dashboard/warehouses/components/warehouse-stock-zones-table.md` | true | frontmatter-only | — | 18-06 |
| `src/components/dashboard/warehouses/components/WarehouseZoneSummary.tsx` | `.docs/developer/refactors/components/component/dashboard/warehouses/components/warehouse-zone-summary.md` | true | frontmatter-only | — | 18-06 |
| `src/components/dashboard/warehouses/components/dashboard-types.ts` | `.docs/developer/refactors/components/misc/dashboard/warehouses/components/dashboard-types.md` | true | frontmatter-only | — | 18-06 |
| `src/components/dashboard/warehouses/components/warehouse-overview-icons.tsx` | `.docs/developer/refactors/components/component/dashboard/warehouses/components/warehouse-overview-icons.md` | true | frontmatter-only | — | 18-05 |
| `src/components/dashboard/warehouses/components/warehouse-overview-primitives.tsx` | `.docs/developer/refactors/components/component/dashboard/warehouses/components/warehouse-overview-primitives.md` | true | frontmatter-only | — | 18-05 |
| `src/components/dashboard/warehouses/components/warehouse-overview-types.ts` | `.docs/developer/refactors/components/misc/dashboard/warehouses/components/warehouse-overview-types.md` | true | frontmatter-only | — | 18-06 |
| `src/components/dashboard/warehouses/dashboard-location-page-skeleton.tsx` | `.docs/developer/refactors/components/component/dashboard/warehouses/dashboard-location-page-skeleton.md` | true | frontmatter-only | — | 18-04 |
| `src/components/dashboard/warehouses/dashboard-location-page.tsx` | `.docs/developer/refactors/components/component/dashboard/warehouses/dashboard-location-page.md` | true | frontmatter-only | — | 18-04 |
| `src/components/dashboard/warehouses/dashboard-warehouse-home-page.tsx` | `.docs/developer/refactors/components/component/dashboard/warehouses/dashboard-warehouse-home-page.md` | true | frontmatter-only | — | 18-04 |
| `src/components/dashboard/warehouses/dashboard-warehouse-overview.tsx` | `.docs/developer/refactors/components/component/dashboard/warehouses/dashboard-warehouse-overview.md` | true | frontmatter-only | — | 18-04 |
| `src/components/dashboard/warehouses/dashboard-warehouse-stock.tsx` | `.docs/developer/refactors/components/component/dashboard/warehouses/dashboard-warehouse-stock.md` | true | frontmatter-only | — | 18-04 |
| `src/components/dashboard/warehouses/use-dashboard-warehouse.tsx` | `.docs/developer/refactors/components/hook/dashboard/warehouses/use-dashboard-warehouse.md` | true | frontmatter-only | `.docs/developer/refactors/hooks/dashboard/warehouses/use-dashboard-warehouse.md` → missing | 18-02 |
| `src/components/dashboard/warehouses/warehouse-dashboard-overview-page-client.tsx` | `.docs/developer/refactors/components/component/dashboard/warehouses/warehouse-dashboard-overview-page-client.md` | true | frontmatter-only | — | 18-04 |
| `src/components/dashboard/warehouses/warehouse-stock-dashboard-page-client.tsx` | `.docs/developer/refactors/components/component/dashboard/warehouses/warehouse-stock-dashboard-page-client.md` | true | frontmatter-only | — | 18-04 |
| `src/components/dashboard/zones/DashboardZonesPageView.tsx` | `.docs/developer/refactors/components/component/dashboard/zones/dashboard-zones-page-view.md` | true | frontmatter-only | — | 18-07 |
| `src/components/dashboard/zones/components/ZoneFillDistributionBarChart.tsx` | `.docs/developer/refactors/components/component/dashboard/zones/components/zone-fill-distribution-bar-chart.md` | true | frontmatter-only | — | 18-07 |
| `src/components/dashboard/zones/components/ZoneOverviewKpiStrip.tsx` | `.docs/developer/refactors/components/component/dashboard/zones/components/zone-overview-kpi-strip.md` | true | frontmatter-only | — | 18-07 |
| `src/components/dashboard/zones/components/zone-bins-section.tsx` | `.docs/developer/refactors/components/component/dashboard/zones/components/zone-bins-section.md` | true | frontmatter-only | — | 18-07 |
| `src/components/dashboard/zones/components/zone-overview-dashboard-skeleton.tsx` | `.docs/developer/refactors/components/component/dashboard/zones/components/zone-overview-dashboard-skeleton.md` | true | frontmatter-only | — | 18-07 |
| `src/components/dashboard/zones/zone-dashboard-overview-page-client.tsx` | `.docs/developer/refactors/components/component/dashboard/zones/zone-dashboard-overview-page-client.md` | true | frontmatter-only | — | 18-07 |
| `src/components/dashboard/zones/zone-overview-dashboard.tsx` | `.docs/developer/refactors/components/component/dashboard/zones/zone-overview-dashboard.md` | true | frontmatter-only | — | 18-07 |

## Duplicate / stale candidate policy

- Paths under `components/component/...`, `components/hook/...`, `components/misc/...`, and historical duplicates may look redundant.
- **Phase 18:** label in summaries only; **no deletes** (research + D-06 discretion).

## Verification commands (plan 18-01)

```bash
rg -n "Selected Source Scope|Documentation Coverage Matrix|Out of scope" .planning/phases/18-inventory-baseline/18-coverage-audit.md
git diff --name-only -- 'src/**'
```
The second command must print no files after Phase 18 doc-only work.
