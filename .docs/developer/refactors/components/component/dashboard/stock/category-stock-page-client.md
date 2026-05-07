---
source: src/components/dashboard/stock/category-stock-page-client.tsx
type: component
isCorrectCase: true
---

## Inventory (Phase 18)

Component name:
CategoryStockPageClient

Current file path:
`src/components/dashboard/stock/category-stock-page-client.tsx`

Current responsibility:
Large client page for category-scoped stock analytics; uses **`useCategoryStockDashboard(categoryId?)`**, recharts, sheets for drilldown, skeleton loading states.

Hooks: **`useCategoryStockDashboard`**

Recommended destination:
TBD Phase 19

Refactor priority:
high

## Classification

Classification: feature-page
Reason: Stock page client also declares chart config, DTO-like types, and child panels.
Target folder: `src/components/features/stock/pages`
Target file name: `category-stock-page-client.tsx`
Keep / Move / Split / Delete: split
Risk level: high

### Evaluation

- Duplicates shadcn/ui: no
- Project-wide reusable: no
- Domain-specific: yes
- Fetches data: no
- Mutates data: no
- Contains reusable transformation logic: no
- Defines types inline: yes
- Contains repeated styling: yes
- Contains multiple components: yes
- Still needed: yes

### Decision

Record the split decision as planned ownership only. Phase 19 does not move source files, create target folders, rewrite imports, delete docs, or alter behavior.

## Dismounted Components

| Component | New code path | New documentation path | Reason |
|---|---|---|---|
| `chartColors` | `src/components/features/stock/pages/chart-colors.ts` | `.docs/developer/refactors/components/dismounted/chart-colors.md` | Separate render child/helper responsibility so the future move keeps the parent focused and reviewable. |
| `rechartsTooltip` | `src/components/features/stock/pages/recharts-tooltip.ts` | `.docs/developer/refactors/components/dismounted/recharts-tooltip.md` | Separate render child/helper responsibility so the future move keeps the parent focused and reviewable. |
| `StockSection` | `src/components/features/stock/pages/stock-section.tsx` | `.docs/developer/refactors/components/dismounted/stock-section.md` | Separate render child/helper responsibility so the future move keeps the parent focused and reviewable. |
| `StockChartPanel` | `src/components/features/stock/pages/stock-chart-panel.tsx` | `.docs/developer/refactors/components/dismounted/stock-chart-panel.md` | Separate render child/helper responsibility so the future move keeps the parent focused and reviewable. |
| `SubcategoryCardDatum` | `src/types/dto/stock/subcategory-card-datum.ts` | `.docs/developer/refactors/components/dismounted/subcategory-card-datum.md` | Separate render child/helper responsibility so the future move keeps the parent focused and reviewable. |
| `StockBreakdownDatum` | `src/types/dto/stock/stock-breakdown-datum.ts` | `.docs/developer/refactors/components/dismounted/stock-breakdown-datum.md` | Separate render child/helper responsibility so the future move keeps the parent focused and reviewable. |
