# Dashboard Component Standardization Plan

## Purpose

Standardize dashboard UI around entity-aligned feature folders and shared dashboard primitives while preserving route behavior and API contracts.

## Scope

- Dashboard stock overview is the visual reference for KPI cards, chart panels, donut breakdowns, status breakdowns, and table spacing.
- Zone detail is the visual reference for bin fill distribution and zone/bin preview sections.
- Table-only routes remain available for deep links, but table-only links are removed from dashboard sidebar navigation.
- Entity-owned feature files move toward `features/warehouse`, `features/zone`, `features/bin`, `features/item`, `features/user`, `features/device`, and `features/order`.

## Approved Shared Primitives

| Primitive | Target path | Purpose | Status |
|---|---|---|---|
| DashboardPageShell | `src/components/primitives/dashboard/dashboard-page-shell.tsx` | Shared dashboard loading, error, header, and width shell | created |
| DashboardSection | `src/components/primitives/dashboard/dashboard-section.tsx` | Stock-style section frame with title/action/content areas | created |
| DashboardChartPanel | `src/components/primitives/dashboard/dashboard-section.tsx` | Stock-style inner chart/card panel | created |
| DashboardKpiGrid | `src/components/primitives/dashboard/dashboard-kpis.tsx` | Standard dashboard KPI grid | created |
| DashboardKpiCard | `src/components/primitives/dashboard/dashboard-kpis.tsx` | Plain KPI card without icon/color emphasis for stock/item metrics | created |
| DashboardItemTotalsCard | `src/components/primitives/dashboard/dashboard-kpis.tsx` | One card containing on hand, available, reserved, and blocked totals | created |
| DashboardDonutBreakdown | `src/components/primitives/dashboard/dashboard-breakdowns.tsx` | Stock-page donut with legend and center total | created |
| DashboardStatusBreakdown | `src/components/primitives/dashboard/dashboard-breakdowns.tsx` | Stock-page stacked status breakdown | created |
| DashboardEntityPreviewSection | `src/components/primitives/dashboard/dashboard-preview-sections.tsx` | Three-card entity preview with show-all sheet | created |
| DashboardActivityPreviewSection | `src/components/primitives/dashboard/dashboard-preview-sections.tsx` | Four-row activity preview with show-all sheet | created |
| DashboardDataTable | `src/components/primitives/dashboard/dashboard-data-table.tsx` | Dashboard wrapper around existing GenericTable/TableShell | created |

## Sidebar Decision

| Destination | Action | Reason |
|---|---|---|
| `/dashboard/locations/zones` | hide from sidebar | Table-only list route; keep deep link alive |
| `/dashboard/locations/bins` | hide from sidebar | Table-only list route; keep deep link alive |
| `/dashboard/catalog/items` | hide from sidebar | Table-only list route; keep deep link alive until upgraded |
| `/dashboard/orders/purchase` | hide from sidebar | Table-only list route; keep deep link alive |

## Donut Rule

Location dashboard donuts should show parent categories only. Child or subcategory rows belong in detail tables or breakdown sections, not donut slices.

## Refactor Status

Status: in-progress
Old path: dashboard-local stock, location, and order table primitives
New path: `src/components/primitives/dashboard/*`
Related files: stock dashboard, warehouse summary, zone bins section, warehouse activity summary, orders overview, dashboard navigation
Imports updated: yes for current batch
Typecheck status: `pnpm exec tsc --noEmit` passed
Notes: Visual intent is standardization, not redesign. Routes and API contracts remain unchanged. Remaining dashboard raw tables are documented as follow-up work in users/devices/detail dashboards and selected warehouse stock detail tables.

## Verification

| Check | Status | Notes |
|---|---|---|
| Targeted ESLint | passed | Changed dashboard primitive/entity/navigation files pass targeted ESLint. |
| TypeScript | passed | `pnpm exec tsc --noEmit` passed. |
| Targeted dashboard test | passed | `pnpm vitest run src/__tests__/dashboard/pages/domain-page-components.test.ts` passed. |
| Demo browser smoke | passed | `IS_DEMO=true pnpm dev`; demo OWNER login; verified Dashboard, Warehouses, Orders overview, Stock overview/categories/health, Users, Devices, and zone detail routes load. |
| Sidebar smoke | passed | Zones, Bins, Items, and Purchase Orders no longer appear in sidebar navigation; deep-link routes remain available. |
| Full lint | failed | Existing repo-wide lint issues remain outside the changed batch, mostly generated-doc blank-line/import-order errors plus pre-existing dashboard/detail formatting issues. |
| Full test | failed | Existing unrelated failures remain in auth hook, purchase order, business-party, and warehouse transition tests. |
| In-app browser control | blocked | Computer/in-app browser control was unavailable because local Accessibility/Screen Recording permission grant was still pending; Playwright smoke was used against localhost instead. |

## Entity Folder Moves

| Component | Old code path | New code path | Status |
|---|---|---|---|
| BinContentsModal | `src/components/dashboard/features/bins/bin-contents-modal.tsx` | `src/components/features/bin/components/bin-contents-modal.tsx` | moved |
| CreateBinForm | `src/components/dashboard/features/bins/create-bin-form.tsx` | `src/components/features/bin/components/create-bin-form.tsx` | moved |
| DashboardBinsPage | `src/components/features/locations/pages/dashboard-bins-page.tsx` | `src/components/features/bin/pages/dashboard-bins-page.tsx` | moved |
| CreateZoneForm | `src/components/dashboard/features/zones/create-zone-form.tsx` | `src/components/features/zone/components/create-zone-form.tsx` | moved |
| DashboardZonesPage | `src/components/features/locations/pages/dashboard-zones-page.tsx` | `src/components/features/zone/pages/dashboard-zones-page.tsx` | moved |
| CreateWarehouseForm | `src/components/dashboard/features/warehouses/create-warehouse-form.tsx` | `src/components/features/warehouse/components/create-warehouse-form.tsx` | moved |

## Applied Standards

| Area | Change | Status |
|---|---|---|
| `/dashboard/stock` | Uses shared KPI grid/cards, item totals card, donut breakdown, status breakdown, section/chart panel primitives | done |
| Warehouse stock summary | Uses shared parent-category donut breakdown | done |
| Zone bins | Uses shared entity preview section with 3 visible cards and show-all sheet | done |
| Warehouse activity | Uses shared activity preview section with 4 visible rows and show-all sheet | done |
| Orders overview tables | Warehouse workload and orders tables use `DashboardDataTable` | done |
| Sidebar navigation | Table-only list links hidden; routes preserved | done |
