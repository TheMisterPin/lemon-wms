---
source: src/components/dashboard/bins/bin-overview-dashboard.tsx
type: component
isCorrectCase: true
---

## Inventory (Phase 18)

Component name:
BinOverviewDashboard (+ inner helpers — see source)

Current file path:
`src/components/dashboard/bins/bin-overview-dashboard.tsx`

Current responsibility:
Large presentational bin detail dashboard: KPIs, charts (recharts), activity feed, bin contents sheet UI, uses warehouse overview primitives/icons for visual consistency.

Dependencies:
  - Components: warehouse overview primitives/icons, shadcn `Sheet`, `recharts`
  - Hooks: (none — receives `BinDetailDashboardDTO` via props from parent)
  - Types: `BinDetailDashboardDTO`, bin row types from `@/types/bin-detail-dashboard.types`
  - Utils: `date-fns` `format`, `next/link`

Props:
See `BinOverviewDashboardProps` in source (`data` + callbacks)

Internal state:
Local UI state for sheets/toggles (see source)

API calls:
(none)

Mutation calls:
(none)

Main UI blocks:
Multiple sections: header, KPI row, charts, tables, sheet — detail in JSX.

Declared child components inside the file:
Several local chart/table helpers — **list in Phase 19 when splitting**; Phase 18 references line count >400.

Repeated styling:
Warehouse dashboard tokens + recharts containers

Repeated logic:
Mappings from DTO sections to chart series — inventory evidence only.

Recommended destination:
TBD Phase 19

Refactor priority:
high
