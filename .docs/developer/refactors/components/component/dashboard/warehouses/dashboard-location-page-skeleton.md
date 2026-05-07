---
source: src/components/dashboard/warehouses/dashboard-location-page-skeleton.tsx
type: component
isCorrectCase: true
---

## Inventory (Phase 18)

**Constraints:** D-04, D-09. Skeleton stays colocated until classification. Target **TBD Phase 19**.

Component name:
DashboardLocationsPageSkeleton

Current file path:
`src/components/dashboard/warehouses/dashboard-location-page-skeleton.tsx`

Current responsibility:
Loading placeholder for `DashboardLocationsPageView` / `DashboardWarehouseHomePageView`: shimmer stat cards, section shells, list/bin card stubs.

Dependencies:
  - Components: `@/components/ui/skeleton`, `@/lib/utils` (`cn`)
  - Hooks: (none)
  - Types: (inline props on `SectionShell` only)
  - Utils: `cn`

Props:
(none)

Internal state:
(none)

API calls:
(none)

Mutation calls:
(none)

Main UI blocks:
`Shimmer`, `StatCardSkeleton`, `SectionShell`, `ListRowSkeleton`, `BinCardSkeleton`, exported skeleton layout.

Declared child components inside the file:
`Shimmer`, `StatCardSkeleton`, `SectionShell`, `ListRowSkeleton`, `BinCardSkeleton`

Repeated styling:
Heavy use of `var(--wh-*)` tokens and shadcn `Skeleton` — feature-specific today; note for generic primitive extraction in later phase only.

Repeated logic:
(none significant)

Recommended destination:
TBD Phase 19 — colocate vs `components/primitives` depends on reuse proof.

Refactor priority:
low–medium
