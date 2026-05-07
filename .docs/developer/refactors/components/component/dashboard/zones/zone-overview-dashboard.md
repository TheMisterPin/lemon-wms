---
source: src/components/dashboard/zones/zone-overview-dashboard.tsx
type: component
isCorrectCase: true
---

## Inventory (Phase 18)

Component name:
DashboardZoneOverviewView (+ helpers `zoneStatusPillTone`, `zoneStatusLabel`, `toWarehouseStockCategories`)

Current file path:
`src/components/dashboard/zones/zone-overview-dashboard.tsx`

Current responsibility:
Zone command-center layout from `ZoneOverviewDashboardData`: KPI strip, fill chart, stock summary reuse, bins section, activity summary reuse.

Dependencies:
  - Components: warehouse `WarehouseActivitySummary`, `WarehouseStockSummary`, `WarehouseOverviewStatusPill`, zone child chart/sections
  - Hooks: (none)
  - Types: `ZoneOverviewDashboardData`, warehouse overview row types
  - Utils: `next/link`

Props:
`{ data: ZoneOverviewDashboardData }`

Internal state:
(none)

API calls:
(none)

Mutation calls:
(none)

Main UI blocks:
Header row, KPI strip, charts/sections grid — see JSX.

Declared child components inside the file:
Helper functions listed in component name line.

Recommended destination:
TBD Phase 19

Refactor priority:
high
