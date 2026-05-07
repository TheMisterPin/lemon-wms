---
source: src/components/dashboard/warehouses/dashboard-location-page.tsx
type: component
isCorrectCase: true
---

## Inventory (Phase 18)

**Constraints:** D-04, D-09. Target **TBD Phase 19**.

Component name:
DashboardLocationsPageView

Current file path:
`src/components/dashboard/warehouses/dashboard-location-page.tsx`

Current responsibility:
Root `/dashboard` locations hub: dashboard nav cards, aggregate overview cards, paginated warehouse/zone directories, bin grid, and bin contents modal. Uses `useDashboardHome` (not `useDashboardWarehouse`).

Dependencies:
  - Components:
    - `@/components/dashboard/dashboard-navigation` (`DASHBOARD_NAV_GROUPS`, `isRouteActive`)
    - `@/components/dashboard/home/use-dashboard-home` (`useDashboardHome`)
    - `./components/BinGrid`, `./components/DirectorySections`, `./components/OverviewCards`
    - `./dashboard-location-page-skeleton` (`DashboardLocationsPageSkeleton`)
    - `../features/bins/bin-contents-modal` (`BinContentsModal`)
  - Hooks:
    - `useDashboardHome`
  - Types:
    - (none declared in this file; hook returns inferred shape)
  - Utils:
    - `next/link`, `lucide-react` (`ChevronDown`)

Props:
(none — zero-arg export)

Internal state:
- `contentsBinId`, `contentsOpen` for modal
- `openContents`, `onContentsOpenChange` callbacks

API calls:
(none in file — delegated to `useDashboardHome`)

Mutation calls:
(none)

Main UI blocks:
- Loading: `DashboardLocationsPageSkeleton`
- Error: centered retry card + `refetch`
- Data: `<main>` with nav section (`Link` / `details`), `OverviewCards`, `DirectorySections`, `BinGrid`, `BinContentsModal`

Declared child components inside the file:
(none — helpers are local callbacks only)

Repeated styling:
CSS vars `--wh-page-bg`, `--wh-card-bg`, `--wh-border`, etc.; repeated rounded card shells — evidence only for Phase 19 primitive work.

Repeated logic:
Mapping `DASHBOARD_NAV_GROUPS` into link vs collapsible nav — inventory evidence only.

Recommended destination:
TBD Phase 19 (likely feature page under `components/features/locations/pages` per architecture rules).

Refactor priority:
medium — duplicates patterns with `DashboardWarehouseHomePageView`.
