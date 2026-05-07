---
source: src/components/dashboard/zones/zone-dashboard-overview-page-client.tsx
type: component
isCorrectCase: true
---

## Inventory (Phase 18)

Component name:
ZoneDashboardOverviewPageClient

Current file path:
`src/components/dashboard/zones/zone-dashboard-overview-page-client.tsx`

Current responsibility:
Fetches zone overview DTO via **GET** `/dashboard/zones/{zoneId}/overview`; loading uses `ZoneOverviewDashboardSkeleton`; success renders `DashboardZoneOverviewView`.

Dependencies:
  - Components: `ZoneOverviewDashboardSkeleton`, `DashboardZoneOverviewView` (from `zone-overview-dashboard`)
  - Hooks: `useState`, `useEffect`, `useCallback`, `useRouter`
  - Types: `ApiResponse`, `ZoneOverviewDashboardData`
  - Utils: `dashboardApiClient`, `next/link`

Props:
`{ zoneId: string }`

Internal state:
`data`, `isLoading`, `error`

API calls:
GET zone overview endpoint

Mutation calls:
(none)

Main UI blocks:
standard page-client loading/error/success branches

Declared child components inside the file:
(none)

Recommended destination:
TBD Phase 19

Refactor priority:
medium
