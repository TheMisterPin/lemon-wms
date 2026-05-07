---
source: src/components/dashboard/bins/bin-dashboard-overview-page-client.tsx
type: component
isCorrectCase: true
---

## Inventory (Phase 18)

Component name:
BinDashboardOverviewPageClient

Current file path:
`src/components/dashboard/bins/bin-dashboard-overview-page-client.tsx`

Current responsibility:
Client shell for bin overview route; uses `useDashboardBinOverview(binId)` (not warehouse provider). Renders loading skeletons, error states, success `BinOverviewDashboard`.

Dependencies:
  - Components: `BinOverviewDashboard`, shadcn `Skeleton`
  - Hooks: `useDashboardBinOverview`, `useRouter`
  - Types: (DTO via hook)
  - Utils: `next/link`

Props:
`{ binId: string }`

Internal state:
(none beyond hook return)

API calls:
(in hook — GET bin overview)

Mutation calls:
(none)

Main UI blocks:
loading main + skeleton grid; error card; success dashboard

Declared child components inside the file:
(none)

Repeated styling:
`--wh-*` error/loading cards

Repeated logic:
mirrors other dashboard *PageClient shells

Recommended destination:
TBD Phase 19

Refactor priority:
medium
