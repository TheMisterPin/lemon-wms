---
source: src/components/dashboard/stock/item-detail-dashboard.tsx
type: component
isCorrectCase: true
---

## Inventory (Phase 18)

Component name:
ItemDetailDashboard

Current file path:
`src/components/dashboard/stock/item-detail-dashboard.tsx`

Current responsibility:
Item detail DTO layout: warehouses stock grid, orders, movement, etc. (see source).

Props: `{ data: ItemDetailDashboardDTO }`

Recommended destination:
TBD Phase 19

Refactor priority:
high

## Classification

Classification: feature-page
Reason: Stock item detail dashboard with status/format helpers and API/lib references.
Target folder: `src/components/features/stock/pages`
Target file name: `item-detail-dashboard.tsx`
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
- Contains multiple components: yes
- Still needed: yes

### Decision

Record the move decision as planned ownership only. Phase 19 does not move source files, create target folders, rewrite imports, delete docs, or alter behavior.
