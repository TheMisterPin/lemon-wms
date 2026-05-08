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

## Logic Mapping

### Logic Found

Render logic:
- Global stock dashboard layout: KPI cards, pie/bar charts, skeleton gate, error branch.

UI-only state:
- Warehouse filter wiring and UI toggles as recorded in Phase 18 inventory.

Data fetching logic:
- **`useDashboardStock`** owns requests and loading/error.

Mutation logic:
- N/A.

Data transformation logic:
- Icon rotation memo, chart constants, `categoryHref` helper bridge routing concerns.

Validation logic:
- N/A.

Error handling logic:
- Surfaced via hook output — component chooses rendering branch.

Reusable utility logic:
- `chartColors`, `rechartsTooltip`, `categoryIcons`, `categoryHref` candidates for modules.

Types/interfaces declared inline:
- N/A — relies on hook-provided `StockDashboardCategoryRow` / `StockDashboardData`.

### Logic Movement Plan

| Logic | Current location | Target location | Reason | Risk |
| --- | --- | --- | --- | --- |
| Stock dashboard fetch/state | `useDashboardStock` | `src/hooks/dashboard/stock/use-dashboard-stock.tsx` (planned) | hook-owned async (**hook**) | medium |
| Chart helper constants/components | Inside page file | `src/components/features/stock/pages/*` per dismount | Split large multi-component page | high |
| `categoryHref` URL builder | Inline helper | `src/lib/transformers/stock/category-href.ts` | Shared routing helper (**transformer**/utility boundary) | medium |
| Page orchestration JSX | Component | **retained render** after child extraction | Keeps page composition readable | medium |

### New Files Needed

See **Dismounted Components**.

### Notes

Consider aligning chart helper extraction with `category-stock-page-client` shared modules where duplicates exist — Phase 22 proves duplication before merging.

## Dismounted Components

| Component | New code path | New documentation path | Reason |
|---|---|---|---|
| `chartColors` | `src/components/features/stock/pages/chart-colors.ts` | `.docs/developer/refactors/components/dismounted/chart-colors.md` | Separate render child/helper responsibility so the future move keeps the parent focused and reviewable. |
| `categoryIcons` | `src/components/features/stock/pages/category-icons.ts` | `.docs/developer/refactors/components/dismounted/category-icons.md` | Separate render child/helper responsibility so the future move keeps the parent focused and reviewable. |
| `rechartsTooltip` | `src/components/features/stock/pages/recharts-tooltip.ts` | `.docs/developer/refactors/components/dismounted/recharts-tooltip.md` | Separate render child/helper responsibility so the future move keeps the parent focused and reviewable. |
| `StockSection` | `src/components/features/stock/pages/stock-section.tsx` | `.docs/developer/refactors/components/dismounted/stock-section.md` | Separate render child/helper responsibility so the future move keeps the parent focused and reviewable. |
| `StockChartPanel` | `src/components/features/stock/pages/stock-chart-panel.tsx` | `.docs/developer/refactors/components/dismounted/stock-chart-panel.md` | Separate render child/helper responsibility so the future move keeps the parent focused and reviewable. |
| `categoryHref` | `src/lib/transformers/stock/category-href.ts` | `.docs/developer/refactors/components/dismounted/category-href.md` | Separate render child/helper responsibility so the future move keeps the parent focused and reviewable. |

## Refactor Status

Status: in-progress
Old path: `src/components/dashboard/stock/dashboard-stock-page.tsx`
New path: current batch keeps path; shared render pieces moved to `src/components/primitives/dashboard/*`
Related files: `src/components/primitives/dashboard/dashboard-kpis.tsx`, `src/components/primitives/dashboard/dashboard-breakdowns.tsx`, `src/components/primitives/dashboard/dashboard-section.tsx`, `src/components/primitives/dashboard/dashboard-page-shell.tsx`
Imports updated: yes
Typecheck status: `pnpm exec tsc --noEmit` passed
Notes: Stock page now consumes standardized KPI, item-total, donut, status-breakdown, section, chart-panel, and page-shell primitives.
