---
source: src/components/dashboard/stock/inventory-health-page-client.tsx
type: component
isCorrectCase: true
---

## Inventory (Phase 18)

Component name:
InventoryHealthPageClient

Current file path:
`src/components/dashboard/stock/inventory-health-page-client.tsx`

Current responsibility:
Thin shell: **`useInventoryHealthDashboard()`**, renders `InventoryHealthDashboard` or skeleton/error.

Hooks: **`useInventoryHealthDashboard`**

Recommended destination:
TBD Phase 19

Refactor priority:
medium

## Classification

Classification: feature-page
Reason: Client wrapper for stock inventory health page.
Target folder: `src/components/features/stock/pages`
Target file name: `inventory-health-page-client.tsx`
Keep / Move / Split / Delete: move
Risk level: low

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
