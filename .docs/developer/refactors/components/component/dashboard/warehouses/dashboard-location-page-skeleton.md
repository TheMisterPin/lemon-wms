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

## Logic Mapping

### Logic Found

Render logic:
- Locations page skeleton shared by warehouse home + locations dashboard views.

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
- Potential overlap with warehouse overview skeleton shimmer — consolidate only with measured duplication.

Types/interfaces declared inline:
- Minimal props on `SectionShell` only.

### Logic Movement Plan

| Logic | Current location | Target location | Reason | Risk |
| --- | --- | --- | --- | --- |
| Nested skeleton exports | Clustered module | `src/components/features/locations/components/*` per dismount | Split-or-keep grouping (**feature**) | medium |
| Generic shimmer/stat shells | Duplicated patterns | **deferred** Phase 21 | Await primitive approval | medium |

### New Files Needed

See **Dismounted Components**.

### Notes

Reuse across two route shells — prove usage before promoting any piece to `components/primitives`.

## Dismounted Components

| Component | New code path | New documentation path | Reason |
|---|---|---|---|
| `Shimmer` | `src/components/features/locations/components/shimmer.tsx` | `.docs/developer/refactors/components/dismounted/shimmer.md` | Record grouped skeleton/component decision now; split only if Phase 21/22 confirms reuse or readability need. |
| `StatCardSkeleton` | `src/components/features/locations/components/stat-card-skeleton.tsx` | `.docs/developer/refactors/components/dismounted/stat-card-skeleton.md` | Record grouped skeleton/component decision now; split only if Phase 21/22 confirms reuse or readability need. |
| `SectionShell` | `src/components/features/locations/components/section-shell.tsx` | `.docs/developer/refactors/components/dismounted/section-shell.md` | Record grouped skeleton/component decision now; split only if Phase 21/22 confirms reuse or readability need. |
| `ListRowSkeleton` | `src/components/features/locations/components/list-row-skeleton.tsx` | `.docs/developer/refactors/components/dismounted/list-row-skeleton.md` | Record grouped skeleton/component decision now; split only if Phase 21/22 confirms reuse or readability need. |
| `BinCardSkeleton` | `src/components/features/locations/components/bin-card-skeleton.tsx` | `.docs/developer/refactors/components/dismounted/bin-card-skeleton.md` | Record grouped skeleton/component decision now; split only if Phase 21/22 confirms reuse or readability need. |

## Skeleton placement (Phase 21 / CFR-17)

- **Decision:** **feature-local grouped** — reused by two route shells but still **locations**-scoped; not a cross-domain generic primitive.
- **Rationale:** Stat/list/bin card placeholders encode locations directory UX; shimmer overlap with warehouse overview skeleton is **evidence only** until source diff proves identical (**defer** generic primitive).
- **Related dismounted docs:** `stat-card-skeleton.md`, `section-shell.md`, `list-row-skeleton.md`, `bin-card-skeleton.md`, `shimmer.md`.
- **Phase 22:** Move cluster with feature; optional dedupe of `Shimmer` after comparison — no redesign.
