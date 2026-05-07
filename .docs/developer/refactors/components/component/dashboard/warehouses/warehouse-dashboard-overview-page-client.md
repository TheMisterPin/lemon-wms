---
source: src/components/dashboard/warehouses/warehouse-dashboard-overview-page-client.tsx
type: component
isCorrectCase: true
---

## Inventory (Phase 18)

**Constraints:** D-04, D-09. Target **TBD Phase 19**.

Component name:
WarehouseDashboardOverviewPageClient

Current file path:
`src/components/dashboard/warehouses/warehouse-dashboard-overview-page-client.tsx`

Current responsibility:
Client page shell for warehouse overview route: loads overview DTO via `dashboardApiClient.get('/dashboard/warehouses/{warehouseId}/overview')`, handles loading skeleton, error+retry, success renders `DashboardWarehouseOverviewView` in `variant="page"`; includes back navigation controls (see source for full button/link wiring).

Dependencies:
  - Components: `WarehouseDashboardOverviewSkeleton`, `DashboardWarehouseOverviewView`
  - Hooks: `useState`, `useEffect`, `useCallback`, `useRouter` (`next/navigation`)
  - Types: `ApiResponse`, `WarehouseOverviewDashboardData`
  - Utils: `dashboardApiClient`, `next/link`

Props:
`{ warehouseId: string }`

Internal state:
`data`, `isLoading`, `error`

API calls:
GET `/dashboard/warehouses/${warehouseId}/overview`

Mutation calls:
(none)

Main UI blocks:
Loading main + skeleton; error card with actions; success `DashboardWarehouseOverviewView`.

Declared child components inside the file:
(none)

Repeated styling:
Error/loading cards reuse dashboard matte shell (`--wh-*`).

Repeated logic:
Same fetch effect pattern as stock page client — candidate for shared hook later (not in Phase 18).

Recommended destination:
TBD Phase 19 — route should stay thin per `hooks-and-data-flow.mdc`.

Refactor priority:
medium
