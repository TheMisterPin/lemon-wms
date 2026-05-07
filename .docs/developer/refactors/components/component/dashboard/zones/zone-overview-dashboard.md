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

## Classification

Classification: feature-page
Reason: Zone overview page contains status helpers and transformer-like mapping helpers.
Target folder: `src/components/features/locations/pages`
Target file name: `zone-overview-dashboard.tsx`
Keep / Move / Split / Delete: split
Risk level: high

### Evaluation

- Duplicates shadcn/ui: no
- Project-wide reusable: no
- Domain-specific: yes
- Fetches data: no
- Mutates data: no
- Contains reusable transformation logic: yes
- Defines types inline: no
- Contains repeated styling: yes
- Contains multiple components: yes
- Still needed: yes

### Decision

Record the split decision as planned ownership only. Phase 19 does not move source files, create target folders, rewrite imports, delete docs, or alter behavior.

## Dismounted Components

| Component | New code path | New documentation path | Reason |
|---|---|---|---|
| `zoneStatusPillTone` | `src/lib/transformers/locations/zone-status-pill-tone.ts` | `.docs/developer/refactors/components/dismounted/zone-status-pill-tone.md` | Separate render child/helper responsibility so the future move keeps the parent focused and reviewable. |
| `zoneStatusLabel` | `src/lib/transformers/locations/zone-status-label.ts` | `.docs/developer/refactors/components/dismounted/zone-status-label.md` | Separate render child/helper responsibility so the future move keeps the parent focused and reviewable. |
| `toWarehouseStockCategories` | `src/lib/transformers/locations/to-warehouse-stock-categories.ts` | `.docs/developer/refactors/components/dismounted/to-warehouse-stock-categories.md` | Separate render child/helper responsibility so the future move keeps the parent focused and reviewable. |
| `toWarehouseActivityRows` | `src/lib/transformers/locations/to-warehouse-activity-rows.ts` | `.docs/developer/refactors/components/dismounted/to-warehouse-activity-rows.md` | Separate render child/helper responsibility so the future move keeps the parent focused and reviewable. |
