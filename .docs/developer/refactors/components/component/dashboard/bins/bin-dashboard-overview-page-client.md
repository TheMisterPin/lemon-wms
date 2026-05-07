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

## Classification

Classification: feature-page
Reason: Client page wrapper for the bin overview route; future ownership is a locations feature page.
Target folder: `src/components/features/locations/pages`
Target file name: `bin-dashboard-overview-page-client.tsx`
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
