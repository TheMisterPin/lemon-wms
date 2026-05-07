---
source: src/components/dashboard/warehouses/dashboard-warehouse-home-page.tsx
type: component
isCorrectCase: true
---

## Inventory (Phase 18)

**Constraints:** D-04, D-09. Target **TBD Phase 19**.

Component name:
DashboardWarehouseHomePageView

Current file path:
`src/components/dashboard/warehouses/dashboard-warehouse-home-page.tsx`

Current responsibility:
`/dashboard/warehouses` aggregate hub — header copy, `OverviewCards`, directories, `BinGrid`, `BinContentsModal`. Same data pattern as `DashboardLocationsPageView` via `useDashboardHome`.

Dependencies:
  - Components: `useDashboardHome`, `BinGrid`, `DirectorySections`, `OverviewCards`, `DashboardLocationsPageSkeleton`, `BinContentsModal`
  - Hooks: `useDashboardHome`
  - Types: (from hook only)
  - Utils: `react` state/callbacks

Props:
(none)

Internal state:
Modal state (`contentsBinId`, `contentsOpen`) + handlers

API calls:
(none in file)

Mutation calls:
(none)

Main UI blocks:
Loading/error branches mirror `dashboard-location-page.tsx` minus the dashboard navigation section; data branch is header + overview + directories + grid + modal.

Declared child components inside the file:
(none)

Repeated styling:
Shared `--wh-*` dashboard matte pattern with location page.

Repeated logic:
Near-duplicate of `DashboardLocationsPageView` (inventory note for Phase 20 logic mapping).

Recommended destination:
TBD Phase 19

Refactor priority:
medium

## Classification

Classification: feature-page
Reason: Warehouse home page view for locations feature ownership.
Target folder: `src/components/features/locations/pages`
Target file name: `dashboard-warehouse-home-page.tsx`
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
