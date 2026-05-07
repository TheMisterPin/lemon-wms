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

## Classification

Classification: feature-page
Reason: Helper-heavy bin overview route view; split helpers and preview event list before movement.
Target folder: `src/components/features/locations/pages`
Target file name: `bin-overview-dashboard.tsx`
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
| `BinOperationsEventList` | `src/components/features/locations/pages/bin-operations-event-list.tsx` | `.docs/developer/refactors/components/dismounted/bin-operations-event-list.md` | Separate render child/helper responsibility so the future move keeps the parent focused and reviewable. |
| `humanizeEnumLabel` | `src/lib/transformers/locations/humanize-enum-label.ts` | `.docs/developer/refactors/components/dismounted/humanize-enum-label.md` | Separate render child/helper responsibility so the future move keeps the parent focused and reviewable. |
| `parseFillPercentValue` | `src/lib/transformers/locations/parse-fill-percent-value.ts` | `.docs/developer/refactors/components/dismounted/parse-fill-percent-value.md` | Separate render child/helper responsibility so the future move keeps the parent focused and reviewable. |
| `stockStatusTone` | `src/lib/transformers/locations/stock-status-tone.ts` | `.docs/developer/refactors/components/dismounted/stock-status-tone.md` | Separate render child/helper responsibility so the future move keeps the parent focused and reviewable. |
| `toWarehouseActivityRows` | `src/lib/transformers/locations/to-warehouse-activity-rows.ts` | `.docs/developer/refactors/components/dismounted/to-warehouse-activity-rows.md` | Separate render child/helper responsibility so the future move keeps the parent focused and reviewable. |
| `activityEventTone` | `src/lib/transformers/locations/activity-event-tone.ts` | `.docs/developer/refactors/components/dismounted/activity-event-tone.md` | Separate render child/helper responsibility so the future move keeps the parent focused and reviewable. |
