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

## Classification

Classification: feature-component
Reason: Feature-specific locations skeleton cluster reused by two pages; generic extraction deferred to Phase 21.
Target folder: `src/components/features/locations/components`
Target file name: `dashboard-location-page-skeleton.tsx`
Keep / Move / Split / Delete: split or keep grouped
Risk level: medium

### Evaluation

- Duplicates shadcn/ui: no
- Project-wide reusable: no
- Domain-specific: yes
- Fetches data: no
- Mutates data: no
- Contains reusable transformation logic: no
- Defines types inline: no
- Contains repeated styling: yes
- Contains multiple components: yes
- Still needed: yes

### Decision

Record the split or keep grouped decision as planned ownership only. Phase 19 does not move source files, create target folders, rewrite imports, delete docs, or alter behavior.

## Dismounted Components

| Component | New code path | New documentation path | Reason |
|---|---|---|---|
| `Shimmer` | `src/components/features/locations/components/shimmer.tsx` | `.docs/developer/refactors/components/dismounted/shimmer.md` | Record grouped skeleton/component decision now; split only if Phase 21/22 confirms reuse or readability need. |
| `StatCardSkeleton` | `src/components/features/locations/components/stat-card-skeleton.tsx` | `.docs/developer/refactors/components/dismounted/stat-card-skeleton.md` | Record grouped skeleton/component decision now; split only if Phase 21/22 confirms reuse or readability need. |
| `SectionShell` | `src/components/features/locations/components/section-shell.tsx` | `.docs/developer/refactors/components/dismounted/section-shell.md` | Record grouped skeleton/component decision now; split only if Phase 21/22 confirms reuse or readability need. |
| `ListRowSkeleton` | `src/components/features/locations/components/list-row-skeleton.tsx` | `.docs/developer/refactors/components/dismounted/list-row-skeleton.md` | Record grouped skeleton/component decision now; split only if Phase 21/22 confirms reuse or readability need. |
| `BinCardSkeleton` | `src/components/features/locations/components/bin-card-skeleton.tsx` | `.docs/developer/refactors/components/dismounted/bin-card-skeleton.md` | Record grouped skeleton/component decision now; split only if Phase 21/22 confirms reuse or readability need. |
