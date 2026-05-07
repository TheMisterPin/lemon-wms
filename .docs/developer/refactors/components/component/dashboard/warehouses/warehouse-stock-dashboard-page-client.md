---
source: src/components/dashboard/warehouses/warehouse-stock-dashboard-page-client.tsx
type: component
isCorrectCase: true
---

## Inventory (Phase 18)

**Constraints:** D-04, D-09. Target **TBD Phase 19**.

Component name:
WarehouseStockDashboardPageClient

Current file path:
`src/components/dashboard/warehouses/warehouse-stock-dashboard-page-client.tsx`

Current responsibility:
Client shell for warehouse stock dashboard: fetches `WarehouseStockDashboardData` via GET `/dashboard/warehouses/${warehouseId}/stock`, loading via `WarehouseStockDashboardSkeleton`, success renders `DashboardWarehouseStockView`.

Dependencies:
  - Components: `WarehouseStockDashboardSkeleton`, `DashboardWarehouseStockView`
  - Hooks: `useState`, `useEffect`, `useCallback`, `useRouter`
  - Types: `ApiResponse`, `WarehouseStockDashboardData`
  - Utils: `dashboardApiClient`, `next/link`

Props:
`{ warehouseId: string }`

Internal state:
`data`, `isLoading`, `error`

API calls:
GET `/dashboard/warehouses/${warehouseId}/stock`

Mutation calls:
(none)

Main UI blocks:
Loading, error, success branches mirroring overview page client pattern.

Declared child components inside the file:
(none)

Repeated styling:
Shared error card layout with overview client.

Repeated logic:
Fetch + effect structure parallel to `WarehouseDashboardOverviewPageClient`.

Recommended destination:
TBD Phase 19

Refactor priority:
medium

## Classification

Classification: feature-page
Reason: Client wrapper for warehouse stock page.
Target folder: `src/components/features/locations/pages`
Target file name: `warehouse-stock-dashboard-page-client.tsx`
Keep / Move / Split / Delete: move
Risk level: low

### Evaluation

- Duplicates shadcn/ui: no
- Project-wide reusable: no
- Domain-specific: yes
- Fetches data: no
- Mutates data: no
- Contains reusable transformation logic: no
- Defines types inline: no
- Contains repeated styling: no
- Contains multiple components: no
- Still needed: yes

### Decision

Record the move decision as planned ownership only. Phase 19 does not move source files, create target folders, rewrite imports, delete docs, or alter behavior.
