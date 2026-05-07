---
source: src/components/dashboard/zones/DashboardZonesPageView.tsx
type: component
isCorrectCase: true
---

## Inventory (Phase 18)

Component name:
DashboardZonesPageView

Current file path:
`src/components/dashboard/zones/DashboardZonesPageView.tsx`

Current responsibility:
Zones list page via `PageWithGrid`. Consumes **`useDashboardWarehouse()`** for `zones`, `warehouseOptions`, loading/error (D-03). Header hosts `CreateZoneForm`.

Dependencies:
  - Components: `PageWithGrid`, zone table columns, `CreateZoneForm`
  - Hooks: **`useDashboardWarehouse`**
  - Types: `ZoneTableRow`
  - Utils: `lucide-react`

Props:
(none)

Internal state:
(none)

API calls:
(none in file)

Mutation calls:
(none)

Main UI blocks:
`PageWithGrid`

Declared child components inside the file:
(none)

Repeated styling:
entity tone via `PageWithGrid`

Repeated logic:
`handleRowClick` currently logs — inventory note only.

Recommended destination:
TBD Phase 19

Refactor priority:
medium — required D-03 consumer

## Classification

Classification: feature-page
Reason: Page-level zones list view consuming dashboard warehouse hook output.
Target folder: `src/components/features/locations/pages`
Target file name: `dashboard-zones-page-view.tsx`
Keep / Move / Split / Delete: move
Risk level: medium

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
