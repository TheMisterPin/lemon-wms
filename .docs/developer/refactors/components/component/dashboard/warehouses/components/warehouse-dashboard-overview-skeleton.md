---
source: src/components/dashboard/warehouses/components/warehouse-dashboard-overview-skeleton.tsx
type: component
isCorrectCase: false
---

## Inventory (Phase 18)

**Constraints:** D-06 inventory lists internal declarations; D-09 docs-only. **TBD Phase 19** for targets.

Component name:
WarehouseDashboardOverviewSkeleton

Current file path:
`src/components/dashboard/warehouses/components/warehouse-dashboard-overview-skeleton.tsx`

Current responsibility:
Skeleton for warehouse overview page loading state.

Dependencies:
  - Components: shadcn `Skeleton`, `cn`
  - Hooks: (none)
  - Types: (see imports in source — Phase 18 summary only)
  - Utils: (see source)

Props:
(see exported component signature in source)

Internal state:
(see source — prefer none for presentational)

API calls:
(none)

Mutation calls:
(none)

Main UI blocks:
(see JSX return in source)

Declared child components inside the file:
`Shimmer`, `OverviewHeaderSkeleton`, `KpiSkeletonTile`, section/grid skeletons

Repeated styling:
Dashboard `--wh-*` token shells; record as evidence.

Repeated logic:
(see source maps/reducers — evidence only)

Recommended destination:
TBD Phase 19

Refactor priority:
medium

## Classification

Classification: feature-component
Reason: Feature-specific warehouse overview skeleton cluster; generic primitive extraction is Phase 21-only.
Target folder: `src/components/features/locations/components`
Target file name: `warehouse-dashboard-overview-skeleton.tsx`
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

## Logic Mapping

### Logic Found

Render logic:
- Warehouse overview loading skeleton with header, KPI tiles, multi-column placeholders.

UI-only state:
- N/A.

Data fetching logic:
- N/A.

Mutation logic:
- N/A.

Data transformation logic:
- N/A.

Validation logic:
- N/A.

Error handling logic:
- N/A.

Reusable utility logic:
- Local shimmer helper may overlap other locations skeletons — dedupe in Phase 22 if identical.

Types/interfaces declared inline:
- N/A.

### Logic Movement Plan

| Logic | Current location | Target location | Reason | Risk |
| --- | --- | --- | --- | --- |
| Nested skeleton exports | Module cluster | `src/components/features/locations/components/*` per dismount | Maintain parity with real overview layout (**feature**) | medium |
| Shared shimmer | Possibly duplicated | **deferred** pending Phase 21 primitive decision | Document overlap only | medium |

### New Files Needed

See **Dismounted Components**.

### Notes

Grouping vs splitting aligns with `dashboard-location-page-skeleton` — track reuse evidence together.

## Dismounted Components

| Component | New code path | New documentation path | Reason |
|---|---|---|---|
| `Shimmer` | `src/components/features/locations/components/shimmer.tsx` | `.docs/developer/refactors/components/dismounted/shimmer.md` | Record grouped skeleton/component decision now; split only if Phase 21/22 confirms reuse or readability need. |
| `OverviewHeaderSkeleton` | `src/components/features/locations/components/overview-header-skeleton.tsx` | `.docs/developer/refactors/components/dismounted/overview-header-skeleton.md` | Record grouped skeleton/component decision now; split only if Phase 21/22 confirms reuse or readability need. |
| `KpiSkeletonTile` | `src/components/features/locations/components/kpi-skeleton-tile.tsx` | `.docs/developer/refactors/components/dismounted/kpi-skeleton-tile.md` | Record grouped skeleton/component decision now; split only if Phase 21/22 confirms reuse or readability need. |
| `SectionGridSkeleton` | `src/components/features/locations/components/section-grid-skeleton.tsx` | `.docs/developer/refactors/components/dismounted/section-grid-skeleton.md` | Record grouped skeleton/component decision now; split only if Phase 21/22 confirms reuse or readability need. |
| `TwoColumnPanelsSkeleton` | `src/components/features/locations/components/two-column-panels-skeleton.tsx` | `.docs/developer/refactors/components/dismounted/two-column-panels-skeleton.md` | Record grouped skeleton/component decision now; split only if Phase 21/22 confirms reuse or readability need. |
| `BottomRowSkeleton` | `src/components/features/locations/components/bottom-row-skeleton.tsx` | `.docs/developer/refactors/components/dismounted/bottom-row-skeleton.md` | Record grouped skeleton/component decision now; split only if Phase 21/22 confirms reuse or readability need. |

## Skeleton placement (Phase 21 / CFR-17)

- **Decision:** **feature-local grouped** — keep this cluster under locations feature ownership (`src/components/features/locations/components/*` per dismount table).
- **Rationale:** Mirrors warehouse overview layout; copy/stagger timings are overview-specific. Generic KPI/shimmer primitives **not approved** here (**defer**) pending byte comparison with `dashboard-location-page-skeleton` and stock skeleton `Shimmer` variants.
- **Related dismounted docs:** `.docs/developer/refactors/components/dismounted/shimmer.md`, `overview-header-skeleton.md`, `kpi-skeleton-tile.md`, etc.
- **Phase 22:** Split inner files only for readability; **CFR-16** prohibits visual drift.
