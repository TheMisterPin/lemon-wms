---
source: src/components/dashboard/stock/dashboard-stock-page.tsx
type: component
isCorrectCase: true
---

## Inventory (Phase 18)

Component name:
DashboardStockPage

Current file path:
`src/components/dashboard/stock/dashboard-stock-page.tsx`

Current responsibility:
Global stock dashboard page: uses **`useDashboardStock()`** (optional warehouse filter via internal options — see source), recharts pie/bar sections, category KPI cards, loading via `DashboardStockPageSkeleton`.

Dependencies:
  - Hooks: **`useDashboardStock`**
  - Components: `DashboardStockPageSkeleton`, shadcn `Card`, `recharts`
  - Types: `StockDashboardCategoryRow`, `StockDashboardData` via hook

Props:
(none on exported page)

Internal state:
(see source — warehouse filter wiring if any)

API calls:
(via hook)

Mutation calls:
(none)

Main UI blocks:
Skeleton branch; error; multi-section charts and tables (large file — ~400 lines)

Declared child components inside the file:
`StockSection`, chart helpers (see source)

Repeated styling:
`rechartsTooltip` constant, `chartColors`, card shells

Repeated logic:
Category icon rotation via `useMemo`

Recommended destination:
TBD Phase 19

Refactor priority:
high

## Classification

Classification: feature-page
Reason: Stock dashboard page contains chart helpers, icon maps, child panels, and href helper.
Target folder: `src/components/features/stock/pages`
Target file name: `dashboard-stock-page.tsx`
Keep / Move / Split / Delete: split
Risk level: high

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

Record the split decision as planned ownership only. Phase 19 does not move source files, create target folders, rewrite imports, delete docs, or alter behavior.

## Dismounted Components

| Component | New code path | New documentation path | Reason |
|---|---|---|---|
| `chartColors` | `src/components/features/stock/pages/chart-colors.ts` | `.docs/developer/refactors/components/dismounted/chart-colors.md` | Separate render child/helper responsibility so the future move keeps the parent focused and reviewable. |
| `categoryIcons` | `src/components/features/stock/pages/category-icons.ts` | `.docs/developer/refactors/components/dismounted/category-icons.md` | Separate render child/helper responsibility so the future move keeps the parent focused and reviewable. |
| `rechartsTooltip` | `src/components/features/stock/pages/recharts-tooltip.ts` | `.docs/developer/refactors/components/dismounted/recharts-tooltip.md` | Separate render child/helper responsibility so the future move keeps the parent focused and reviewable. |
| `StockSection` | `src/components/features/stock/pages/stock-section.tsx` | `.docs/developer/refactors/components/dismounted/stock-section.md` | Separate render child/helper responsibility so the future move keeps the parent focused and reviewable. |
| `StockChartPanel` | `src/components/features/stock/pages/stock-chart-panel.tsx` | `.docs/developer/refactors/components/dismounted/stock-chart-panel.md` | Separate render child/helper responsibility so the future move keeps the parent focused and reviewable. |
| `categoryHref` | `src/lib/transformers/stock/category-href.ts` | `.docs/developer/refactors/components/dismounted/category-href.md` | Separate render child/helper responsibility so the future move keeps the parent focused and reviewable. |
