---
source: src/components/dashboard/stock/category-stock-dashboard.tsx
type: component
isCorrectCase: true
---

## Inventory (Phase 18)

Component name:
CategoryStockDashboard

Current file path:
`src/components/dashboard/stock/category-stock-dashboard.tsx`

Current responsibility:
Presentational dashboard body for `CategoryStockDashboardDTO` — charts/tables (see source; file length significant).

Props: `{ data: CategoryStockDashboardDTO }`

Hooks: (none)

Recommended destination:
TBD Phase 19

Refactor priority:
high

## Classification

Classification: feature-page
Reason: Stock-owned dashboard view with API/lib references; keep stock-specific ownership.
Target folder: `src/components/features/stock/pages`
Target file name: `category-stock-dashboard.tsx`
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
