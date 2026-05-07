# Phase 19 Classification Summary

**Generated:** 2026-05-07
**Scope:** 52 inherited selected rows from Phase 18 dashboard warehouse/location/stock refactor docs.
**Status:** Complete for Phase 19 documentation-only classification.

## Phase 19 Scope

Phase 19 records planned classification, target ownership, target path, action, risk, and split planning before code movement. It does not move source files, create target folders, rewrite imports, delete duplicate-looking docs, change styling, alter API contracts, or change app behavior.

## Allowed Classification Categories

- `shadcn/base`
- `primitive`
- `feature-component`
- `feature-page`
- `route-file`
- `hook`
- `utility`
- `type-only`
- `delete/replace`

## Required Per-Doc Fields

Each selected doc includes: `Classification`, `Reason`, `Target folder`, `Target file name`, `Keep / Move / Split / Delete`, `Risk level`, and an `Evaluation` row for `Contains multiple components`.

## Target ownership map

| Target area | Owns | Does not own | Phase 19 decision |
|---|---|---|---|
| `src/components/ui` | shadcn/base components only | Feature UI, domain logic, API calls | No selected row targets this area for source movement. |
| `src/components/primitives` | Domain-neutral reusable Lemon WMS UI candidates | Domain business rules, feature hooks, API shapes | Candidate-only; Phase 21 approval required. |
| `src/components/features/[domain]` | Feature pages and feature components under their domain | Fetching, mutation logic, raw API types | Locations and stock targets are planned only. |
| `src/hooks` | Data fetching, loading/error/refetch, mutations, DTO preparation | JSX layout and visual styling | Hook movement deferred to Phase 20/22. |
| `src/types/api` | Raw transport/API payload shapes | UI-ready DTOs and component props | Planned for provider/hook split rows only. |
| `src/types/dto` | UI-ready display records, KPI/table/chart rows | Raw API/database shapes | Exact DTO boundaries deferred to Phase 20. |
| `src/types/components` | Shared component-only prop/utility types | Domain DTOs and API payloads | Use only where feature-local types are insufficient. |
| `src/lib/transformers` | Reusable/non-trivial mapping and normalization | Fetching, state, JSX | Locations/stock transformer candidates are future-only. |
| shared styling files | Repeated classes/tokens after evidence | One-off Tailwind cleanup or redesign | Phase 21 only; no styling files changed in Phase 19. |

## Coverage Matrix

| # | Source path | Current doc path | Classification | Action | Future target path | Risk | Multi-component | Split plan |
|---|---|---|---|---|---|---|---|---|
| 1 | `src/app/(dashboard)/layout.tsx` | `.docs/developer/refactors/components/_refactor-map.md` | route-file | keep | `src/app/(dashboard)/layout.tsx` | medium | no | n/a |
| 2 | `src/components/dashboard/bins/bin-dashboard-overview-page-client.tsx` | `.docs/developer/refactors/components/component/dashboard/bins/bin-dashboard-overview-page-client.md` | feature-page | move | `src/components/features/locations/pages/bin-dashboard-overview-page-client.tsx` | low | no | n/a |
| 3 | `src/components/dashboard/bins/bin-overview-dashboard.tsx` | `.docs/developer/refactors/components/component/dashboard/bins/bin-overview-dashboard.md` | feature-page | split | `src/components/features/locations/pages/bin-overview-dashboard.tsx` | high | yes | yes |
| 4 | `src/components/dashboard/bins/DashboardBinsPageView.tsx` | `.docs/developer/refactors/components/component/dashboard/bins/dashboard-bins-page-view.md` | feature-page | move | `src/components/features/locations/pages/dashboard-bins-page-view.tsx` | medium | no | n/a |
| 5 | `src/components/dashboard/bins/use-dashboard-bin-overview.ts` | `.docs/developer/refactors/components/hook/dashboard/bins/use-dashboard-bin-overview.md` | hook | move | `src/hooks/dashboard/locations/use-dashboard-bin-overview.ts` | medium | no | n/a |
| 6 | `src/components/dashboard/features/bins/bin-contents-modal.tsx` | `.docs/developer/refactors/components/component/dashboard/features/bins/bin-contents-modal.md` | feature-component | split | `src/components/features/locations/components/bin-contents-modal.tsx` | high | yes | yes |
| 7 | `src/components/dashboard/features/bins/create-bin-form.tsx` | `.docs/developer/refactors/components/component/dashboard/features/bins/create-bin-form.md` | feature-component | move | `src/components/features/locations/components/create-bin-form.tsx` | medium | yes | n/a |
| 8 | `src/components/dashboard/features/warehouses/create-warehouse-form.tsx` | `.docs/developer/refactors/components/component/dashboard/features/warehouses/create-warehouse-form.md` | feature-component | keep/move | `src/components/features/locations/components/create-warehouse-form.tsx` | medium | yes | n/a |
| 9 | `src/components/dashboard/features/zones/create-zone-form.tsx` | `.docs/developer/refactors/components/component/dashboard/features/zones/create-zone-form.md` | feature-component | move | `src/components/features/locations/components/create-zone-form.tsx` | medium | yes | n/a |
| 10 | `src/components/dashboard/stock/category-stock-dashboard.tsx` | `.docs/developer/refactors/components/component/dashboard/stock/category-stock-dashboard.md` | feature-page | move | `src/components/features/stock/pages/category-stock-dashboard.tsx` | medium | no | n/a |
| 11 | `src/components/dashboard/stock/category-stock-page-client.tsx` | `.docs/developer/refactors/components/component/dashboard/stock/category-stock-page-client.md` | feature-page | split | `src/components/features/stock/pages/category-stock-page-client.tsx` | high | yes | yes |
| 12 | `src/components/dashboard/stock/dashboard-stock-page-skeleton.tsx` | `.docs/developer/refactors/components/component/dashboard/stock/dashboard-stock-page-skeleton.md` | feature-component | split or keep grouped | `src/components/features/stock/components/dashboard-stock-page-skeleton.tsx` | medium | yes | yes |
| 13 | `src/components/dashboard/stock/dashboard-stock-page.tsx` | `.docs/developer/refactors/components/component/dashboard/stock/dashboard-stock-page.md` | feature-page | split | `src/components/features/stock/pages/dashboard-stock-page.tsx` | high | yes | yes |
| 14 | `src/components/dashboard/stock/inventory-health-dashboard.tsx` | `.docs/developer/refactors/components/component/dashboard/stock/inventory-health-dashboard.md` | feature-page | move | `src/components/features/stock/pages/inventory-health-dashboard.tsx` | medium | yes | n/a |
| 15 | `src/components/dashboard/stock/inventory-health-page-client.tsx` | `.docs/developer/refactors/components/component/dashboard/stock/inventory-health-page-client.md` | feature-page | move | `src/components/features/stock/pages/inventory-health-page-client.tsx` | low | no | n/a |
| 16 | `src/components/dashboard/stock/item-detail-dashboard.tsx` | `.docs/developer/refactors/components/component/dashboard/stock/item-detail-dashboard.md` | feature-page | move | `src/components/features/stock/pages/item-detail-dashboard.tsx` | medium | yes | n/a |
| 17 | `src/components/dashboard/stock/item-detail-page-client.tsx` | `.docs/developer/refactors/components/component/dashboard/stock/item-detail-page-client.md` | feature-page | move | `src/components/features/stock/pages/item-detail-page-client.tsx` | low | no | n/a |
| 18 | `src/components/dashboard/stock/use-category-stock-dashboard.ts` | `.docs/developer/refactors/components/hook/dashboard/stock/use-category-stock-dashboard.md` | hook | move | `src/hooks/dashboard/stock/use-category-stock-dashboard.ts` | medium | yes | n/a |
| 19 | `src/components/dashboard/stock/use-dashboard-stock.tsx` | `.docs/developer/refactors/components/hook/dashboard/stock/use-dashboard-stock.md` | hook | move | `src/hooks/dashboard/stock/use-dashboard-stock.tsx` | medium | yes | n/a |
| 20 | `src/components/dashboard/stock/use-inventory-health-dashboard.ts` | `.docs/developer/refactors/components/hook/dashboard/stock/use-inventory-health-dashboard.md` | hook | move | `src/hooks/dashboard/stock/use-inventory-health-dashboard.ts` | medium | yes | n/a |
| 21 | `src/components/dashboard/stock/use-item-detail-dashboard.ts` | `.docs/developer/refactors/components/hook/dashboard/stock/use-item-detail-dashboard.md` | hook | move | `src/hooks/dashboard/stock/use-item-detail-dashboard.ts` | medium | yes | n/a |
| 22 | `src/components/dashboard/warehouses/components/BinGrid.tsx` | `.docs/developer/refactors/components/component/dashboard/warehouses/components/bin-grid.md` | feature-component | split | `src/components/features/locations/components/bin-grid.tsx` | medium | yes | yes |
| 23 | `src/components/dashboard/warehouses/components/dashboard-types.ts` | `.docs/developer/refactors/components/misc/dashboard/warehouses/components/dashboard-types.md` | type-only | move | `src/types/dto/locations/dashboard-types.ts` | medium | no | n/a |
| 24 | `src/components/dashboard/warehouses/components/DirectorySections.tsx` | `.docs/developer/refactors/components/component/dashboard/warehouses/components/directory-sections.md` | feature-component | split | `src/components/features/locations/components/directory-sections.tsx` | medium | yes | yes |
| 25 | `src/components/dashboard/warehouses/components/OverviewCards.tsx` | `.docs/developer/refactors/components/component/dashboard/warehouses/components/overview-cards.md` | feature-component | split | `src/components/features/locations/components/overview-cards.tsx` | medium | yes | yes |
| 26 | `src/components/dashboard/warehouses/components/warehouse-overview-icons.tsx` | `.docs/developer/refactors/components/component/dashboard/warehouses/components/warehouse-overview-icons.md` | utility | move | `src/components/features/locations/components/warehouse-overview-icons.tsx` | medium | no | n/a |
| 27 | `src/components/primitives/warehouse-overview-primitives.tsx` | `.docs/developer/refactors/components/component/dashboard/warehouses/components/warehouse-overview-primitives.md` | primitive | split | `src/components/primitives/warehouse-overview-primitives.tsx` | high | yes | yes |
| 28 | `src/components/dashboard/warehouses/components/warehouse-overview-types.ts` | `.docs/developer/refactors/components/misc/dashboard/warehouses/components/warehouse-overview-types.md` | type-only | move | `src/types/dto/locations/warehouse-overview-types.ts` | medium | no | n/a |
| 29 | `src/components/dashboard/warehouses/components/WarehouseActivitySummary.tsx` | `.docs/developer/refactors/components/component/dashboard/warehouses/components/warehouse-activity-summary.md` | feature-component | move | `src/components/features/locations/components/warehouse-activity-summary.tsx` | medium | yes | n/a |
| 30 | `src/components/dashboard/warehouses/components/WarehouseDashboardOverviewSkeleton.tsx` | `.docs/developer/refactors/components/component/dashboard/warehouses/components/warehouse-dashboard-overview-skeleton.md` | feature-component | split or keep grouped | `src/components/features/locations/components/warehouse-dashboard-overview-skeleton.tsx` | medium | yes | yes |
| 31 | `src/components/dashboard/warehouses/components/WarehouseOrderWorkload.tsx` | `.docs/developer/refactors/components/component/dashboard/warehouses/components/warehouse-order-workload.md` | feature-component | move | `src/components/features/locations/components/warehouse-order-workload.tsx` | medium | yes | n/a |
| 32 | `src/components/dashboard/warehouses/components/WarehouseStockAvailabilityBarChart.tsx` | `.docs/developer/refactors/components/component/dashboard/warehouses/components/warehouse-stock-availability-bar-chart.md` | feature-component | move | `src/components/features/locations/components/warehouse-stock-availability-bar-chart.tsx` | medium | yes | n/a |
| 33 | `src/components/dashboard/warehouses/components/WarehouseStockDashboardSkeleton.tsx` | `.docs/developer/refactors/components/component/dashboard/warehouses/components/warehouse-stock-dashboard-skeleton.md` | feature-component | move | `src/components/features/locations/components/warehouse-stock-dashboard-skeleton.tsx` | low | no | n/a |
| 34 | `src/components/dashboard/warehouses/components/WarehouseStockItemsTable.tsx` | `.docs/developer/refactors/components/component/dashboard/warehouses/components/warehouse-stock-items-table.md` | feature-component | move | `src/components/features/locations/components/warehouse-stock-items-table.tsx` | medium | yes | n/a |
| 35 | `src/components/dashboard/warehouses/components/WarehouseStockSummary.tsx` | `.docs/developer/refactors/components/component/dashboard/warehouses/components/warehouse-stock-summary.md` | feature-component | split | `src/components/features/locations/components/warehouse-stock-summary.tsx` | medium | yes | yes |
| 36 | `src/components/dashboard/warehouses/components/WarehouseStockZonesTable.tsx` | `.docs/developer/refactors/components/component/dashboard/warehouses/components/warehouse-stock-zones-table.md` | feature-component | move | `src/components/features/locations/components/warehouse-stock-zones-table.tsx` | medium | yes | n/a |
| 37 | `src/components/dashboard/warehouses/components/WarehouseZoneSummary.tsx` | `.docs/developer/refactors/components/component/dashboard/warehouses/components/warehouse-zone-summary.md` | feature-component | move | `src/components/features/locations/components/warehouse-zone-summary.tsx` | high | yes | n/a |
| 38 | `src/components/dashboard/warehouses/dashboard-location-page-skeleton.tsx` | `.docs/developer/refactors/components/component/dashboard/warehouses/dashboard-location-page-skeleton.md` | feature-component | split or keep grouped | `src/components/features/locations/components/dashboard-location-page-skeleton.tsx` | medium | yes | yes |
| 39 | `src/components/dashboard/warehouses/dashboard-location-page.tsx` | `.docs/developer/refactors/components/component/dashboard/warehouses/dashboard-location-page.md` | feature-page | move | `src/components/features/locations/pages/dashboard-location-page.tsx` | medium | no | n/a |
| 40 | `src/components/dashboard/warehouses/dashboard-warehouse-home-page.tsx` | `.docs/developer/refactors/components/component/dashboard/warehouses/dashboard-warehouse-home-page.md` | feature-page | move | `src/components/features/locations/pages/dashboard-warehouse-home-page.tsx` | medium | no | n/a |
| 41 | `src/components/dashboard/warehouses/dashboard-warehouse-overview.tsx` | `.docs/developer/refactors/components/component/dashboard/warehouses/dashboard-warehouse-overview.md` | feature-page | split | `src/components/features/locations/pages/dashboard-warehouse-overview.tsx` | high | yes | yes |
| 42 | `src/components/dashboard/warehouses/dashboard-warehouse-stock.tsx` | `.docs/developer/refactors/components/component/dashboard/warehouses/dashboard-warehouse-stock.md` | feature-page | split | `src/components/features/locations/pages/dashboard-warehouse-stock.tsx` | high | yes | yes |
| 43 | `src/components/dashboard/warehouses/use-dashboard-warehouse.tsx` | `.docs/developer/refactors/components/hook/dashboard/warehouses/use-dashboard-warehouse.md` | hook | split | `src/hooks/dashboard/locations/use-dashboard-warehouse.ts` | high | yes | yes |
| 44 | `src/components/dashboard/warehouses/warehouse-dashboard-overview-page-client.tsx` | `.docs/developer/refactors/components/component/dashboard/warehouses/warehouse-dashboard-overview-page-client.md` | feature-page | move | `src/components/features/locations/pages/warehouse-dashboard-overview-page-client.tsx` | low | no | n/a |
| 45 | `src/components/dashboard/warehouses/warehouse-stock-dashboard-page-client.tsx` | `.docs/developer/refactors/components/component/dashboard/warehouses/warehouse-stock-dashboard-page-client.md` | feature-page | move | `src/components/features/locations/pages/warehouse-stock-dashboard-page-client.tsx` | low | no | n/a |
| 46 | `src/components/dashboard/zones/components/zone-bins-section.tsx` | `.docs/developer/refactors/components/component/dashboard/zones/components/zone-bins-section.md` | feature-component | split | `src/components/features/locations/components/zone-bins-section.tsx` | medium | yes | yes |
| 47 | `src/components/dashboard/zones/components/zone-overview-dashboard-skeleton.tsx` | `.docs/developer/refactors/components/component/dashboard/zones/components/zone-overview-dashboard-skeleton.md` | feature-component | move | `src/components/features/locations/components/zone-overview-dashboard-skeleton.tsx` | low | no | n/a |
| 48 | `src/components/dashboard/zones/components/ZoneFillDistributionBarChart.tsx` | `.docs/developer/refactors/components/component/dashboard/zones/components/zone-fill-distribution-bar-chart.md` | feature-component | move | `src/components/features/locations/components/zone-fill-distribution-bar-chart.tsx` | medium | yes | n/a |
| 49 | `src/components/dashboard/zones/components/ZoneOverviewKpiStrip.tsx` | `.docs/developer/refactors/components/component/dashboard/zones/components/zone-overview-kpi-strip.md` | feature-component | split | `src/components/features/locations/components/zone-overview-kpi-strip.tsx` | medium | yes | yes |
| 50 | `src/components/dashboard/zones/DashboardZonesPageView.tsx` | `.docs/developer/refactors/components/component/dashboard/zones/dashboard-zones-page-view.md` | feature-page | move | `src/components/features/locations/pages/dashboard-zones-page-view.tsx` | medium | no | n/a |
| 51 | `src/components/dashboard/zones/zone-dashboard-overview-page-client.tsx` | `.docs/developer/refactors/components/component/dashboard/zones/zone-dashboard-overview-page-client.md` | feature-page | move | `src/components/features/locations/pages/zone-dashboard-overview-page-client.tsx` | low | no | n/a |
| 52 | `src/components/dashboard/zones/zone-overview-dashboard.tsx` | `.docs/developer/refactors/components/component/dashboard/zones/zone-overview-dashboard.md` | feature-page | split | `src/components/features/locations/pages/zone-overview-dashboard.tsx` | high | yes | yes |

## Category counts

- feature-component: 22
- feature-page: 19
- hook: 6
- primitive: 1
- route-file: 1
- type-only: 2
- utility: 1

## Action counts

- keep: 1
- keep/move: 1
- move: 32
- split: 15
- split or keep grouped: 3

## Risk counts

- high: 10
- low: 8
- medium: 34

## Multi-component count

- Contains multiple components: 34

## Split rows

- `src/components/dashboard/bins/bin-overview-dashboard.tsx` -> `.docs/developer/refactors/components/component/dashboard/bins/bin-overview-dashboard.md` (split, high risk)
- `src/components/dashboard/features/bins/bin-contents-modal.tsx` -> `.docs/developer/refactors/components/component/dashboard/features/bins/bin-contents-modal.md` (split, high risk)
- `src/components/dashboard/stock/category-stock-page-client.tsx` -> `.docs/developer/refactors/components/component/dashboard/stock/category-stock-page-client.md` (split, high risk)
- `src/components/dashboard/stock/dashboard-stock-page-skeleton.tsx` -> `.docs/developer/refactors/components/component/dashboard/stock/dashboard-stock-page-skeleton.md` (split or keep grouped, medium risk)
- `src/components/dashboard/stock/dashboard-stock-page.tsx` -> `.docs/developer/refactors/components/component/dashboard/stock/dashboard-stock-page.md` (split, high risk)
- `src/components/dashboard/warehouses/components/BinGrid.tsx` -> `.docs/developer/refactors/components/component/dashboard/warehouses/components/bin-grid.md` (split, medium risk)
- `src/components/dashboard/warehouses/components/DirectorySections.tsx` -> `.docs/developer/refactors/components/component/dashboard/warehouses/components/directory-sections.md` (split, medium risk)
- `src/components/dashboard/warehouses/components/OverviewCards.tsx` -> `.docs/developer/refactors/components/component/dashboard/warehouses/components/overview-cards.md` (split, medium risk)
- `src/components/primitives/warehouse-overview-primitives.tsx` -> `.docs/developer/refactors/components/component/dashboard/warehouses/components/warehouse-overview-primitives.md` (split, high risk; **moved Phase 22-01**)
- `src/components/dashboard/warehouses/components/WarehouseDashboardOverviewSkeleton.tsx` -> `.docs/developer/refactors/components/component/dashboard/warehouses/components/warehouse-dashboard-overview-skeleton.md` (split or keep grouped, medium risk)
- `src/components/dashboard/warehouses/components/WarehouseStockSummary.tsx` -> `.docs/developer/refactors/components/component/dashboard/warehouses/components/warehouse-stock-summary.md` (split, medium risk)
- `src/components/dashboard/warehouses/dashboard-location-page-skeleton.tsx` -> `.docs/developer/refactors/components/component/dashboard/warehouses/dashboard-location-page-skeleton.md` (split or keep grouped, medium risk)
- `src/components/dashboard/warehouses/dashboard-warehouse-overview.tsx` -> `.docs/developer/refactors/components/component/dashboard/warehouses/dashboard-warehouse-overview.md` (split, high risk)
- `src/components/dashboard/warehouses/dashboard-warehouse-stock.tsx` -> `.docs/developer/refactors/components/component/dashboard/warehouses/dashboard-warehouse-stock.md` (split, high risk)
- `src/components/dashboard/warehouses/use-dashboard-warehouse.tsx` -> `.docs/developer/refactors/components/hook/dashboard/warehouses/use-dashboard-warehouse.md` (split, high risk)
- `src/components/dashboard/zones/components/zone-bins-section.tsx` -> `.docs/developer/refactors/components/component/dashboard/zones/components/zone-bins-section.md` (split, medium risk)
- `src/components/dashboard/zones/components/ZoneOverviewKpiStrip.tsx` -> `.docs/developer/refactors/components/component/dashboard/zones/components/zone-overview-kpi-strip.md` (split, medium risk)
- `src/components/dashboard/zones/zone-overview-dashboard.tsx` -> `.docs/developer/refactors/components/component/dashboard/zones/zone-overview-dashboard.md` (split, high risk)

## Delete/replace candidates

None. The unused-looking warehouse form remains `feature-component` with `keep/move`; any future delete/replace decision requires usage search, import search, replacement proof, and Phase 23/implementation confirmation.

## Unresolved follow-ups

- Phase 20 must map exact logic movement for hook/provider, DTO, API type, utility, and transformer responsibilities.
- Phase 21 must approve or reject primitive and shared styling candidates with reuse evidence — **canonical register:** `.docs/developer/refactors/_primitive-extraction-plan.md` (master table + skeleton annex).
- Phase 22 must create target folders and move code only after Phase 20/21 decisions are complete.
- Phase 23 must verify imports/usages before any compatibility or duplicate cleanup.
