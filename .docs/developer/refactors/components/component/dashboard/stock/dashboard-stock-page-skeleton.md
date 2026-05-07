---
source: src/components/dashboard/stock/dashboard-stock-page-skeleton.tsx
type: component
isCorrectCase: true
---

## Inventory (Phase 18)

Component name:
DashboardStockPageSkeleton (+ local shimmer blocks)

Current file path:
`src/components/dashboard/stock/dashboard-stock-page-skeleton.tsx`

Current responsibility:
Skeleton mirroring stock dashboard category KPI cards and chart/table placeholders.

Dependencies: shadcn `Skeleton`, `cn`

Recommended destination:
TBD Phase 19 — feature-specific

Refactor priority:
medium

## Classification

Classification: feature-component
Reason: Stock-specific skeleton cluster; keep grouped unless Phase 21 proves generic reuse.
Target folder: `src/components/features/stock/components`
Target file name: `dashboard-stock-page-skeleton.tsx`
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
- Skeleton mirrors stock dashboard KPI/chart/table placeholders using local shimmer blocks.

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
- Shared shimmer wrappers — evaluate duplication vs warehouse skeletons in Phase 22.

Types/interfaces declared inline:
- N/A.

### Logic Movement Plan

| Logic | Current location | Target location | Reason | Risk |
| --- | --- | --- | --- | --- |
| Nested skeleton components | Single module | `src/components/features/stock/components/*` per dismount | Split-or-keep grouping resolved during Phase 21/22 (**retained render**/**feature**) | medium |
| Potential generic shimmer | Duplicated across stock/warehouse skeletons | **deferred** Phase 21 primitive decision | Avoid premature extraction | medium |

### New Files Needed

See **Dismounted Components** — files created only after grouping decision.

### Notes

**Phase 21** chooses whether to split shimmer/KPI skeletons into primitives vs keep feature-scoped cluster.

## Dismounted Components

| Component | New code path | New documentation path | Reason |
|---|---|---|---|
| `Shimmer` | `src/components/features/stock/components/shimmer.tsx` | `.docs/developer/refactors/components/dismounted/shimmer.md` | Record grouped skeleton/component decision now; split only if Phase 21/22 confirms reuse or readability need. |
| `CategoryKpiCardSkeleton` | `src/components/features/stock/components/category-kpi-card-skeleton.tsx` | `.docs/developer/refactors/components/dismounted/category-kpi-card-skeleton.md` | Record grouped skeleton/component decision now; split only if Phase 21/22 confirms reuse or readability need. |
| `StockChartPanelSkeleton` | `src/components/features/stock/components/stock-chart-panel-skeleton.tsx` | `.docs/developer/refactors/components/dismounted/stock-chart-panel-skeleton.md` | Record grouped skeleton/component decision now; split only if Phase 21/22 confirms reuse or readability need. |
| `StockSectionSkeleton` | `src/components/features/stock/components/stock-section-skeleton.tsx` | `.docs/developer/refactors/components/dismounted/stock-section-skeleton.md` | Record grouped skeleton/component decision now; split only if Phase 21/22 confirms reuse or readability need. |
| `SubcategoryTableSkeleton` | `src/components/features/stock/components/subcategory-table-skeleton.tsx` | `.docs/developer/refactors/components/dismounted/subcategory-table-skeleton.md` | Record grouped skeleton/component decision now; split only if Phase 21/22 confirms reuse or readability need. |
