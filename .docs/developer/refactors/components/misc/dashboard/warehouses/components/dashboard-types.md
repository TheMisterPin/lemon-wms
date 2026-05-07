---
source: src/components/dashboard/warehouses/components/dashboard-types.ts
type: misc
isCorrectCase: true
---

## Inventory (Phase 18) — Type-only

**Constraints:** D-06. No render component.

Current file path:
`src/components/dashboard/warehouses/components/dashboard-types.ts`

Current responsibility:
Shared DTO/display row types for warehouse overview + locations directory/bin grid.

Exported types:
DashboardOverviewCard, DashboardWarehouseDisplayRecord, DashboardZoneDisplayRecord, DashboardBinDisplayRecord, BinRecord

Recommended destination:
TBD Phase 19 (likely `src/types/dto` or domain types — not decided in Phase 18).

Refactor priority:
low–medium

## Classification

Classification: type-only
Reason: Type-only display records shared by dashboard locations components; exact DTO boundary deferred to Phase 20.
Target folder: `src/types/dto/locations`
Target file name: `dashboard-types.ts`
Keep / Move / Split / Delete: move
Risk level: medium

### Evaluation

- Duplicates shadcn/ui: no
- Project-wide reusable: no
- Domain-specific: yes
- Fetches data: no
- Mutates data: no
- Contains reusable transformation logic: no
- Defines types inline: yes
- Contains repeated styling: no
- Contains multiple components: no
- Still needed: yes

### Decision

Record the move decision as planned ownership only. Phase 19 does not move source files, create target folders, rewrite imports, delete docs, or alter behavior.
