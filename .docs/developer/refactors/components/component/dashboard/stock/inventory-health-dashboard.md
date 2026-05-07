---
source: src/components/dashboard/stock/inventory-health-dashboard.tsx
type: component
isCorrectCase: true
---

## Inventory (Phase 18)

Component name:
InventoryHealthDashboard

Current file path:
`src/components/dashboard/stock/inventory-health-dashboard.tsx`

Current responsibility:
Renders inventory health DTO sections (KPIs/charts — see source).

Props: `{ data: InventoryHealthDashboardDTO }`

Recommended destination:
TBD Phase 19

Refactor priority:
medium

## Classification

Classification: feature-page
Reason: Stock health dashboard view with formatting helper and API/lib page data references.
Target folder: `src/components/features/stock/pages`
Target file name: `inventory-health-dashboard.tsx`
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
