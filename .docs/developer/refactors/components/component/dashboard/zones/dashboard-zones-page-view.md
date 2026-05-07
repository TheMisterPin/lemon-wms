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
