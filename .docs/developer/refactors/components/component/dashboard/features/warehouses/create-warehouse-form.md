---
source: src/components/dashboard/features/warehouses/create-warehouse-form.tsx
type: component
isCorrectCase: true
---

## Inventory (Phase 18)

Component name:
CreateWarehouseForm (`export default function CreateWarehouseForm`)

Current file path:
`src/components/dashboard/features/warehouses/create-warehouse-form.tsx`

Current responsibility:
Header/dialog-style creator using Generic Form config; calls **`useDashboardWarehouse().createWarehouse(values)`** on submit (D-03).

Mutation calls:
`createWarehouse` from dashboard warehouse context (POST via provider implementation).

Dependencies:
  - Hooks: **`useDashboardWarehouse`**
  - Validation: `warehouseFormSchema` pick for create

Props:
(see default export props for trigger/slot pattern)

Main UI blocks:
Generic form submit surface

Repeated styling:
(via shared form primitives)

Recommended destination:
TBD Phase 19 — `components/features/...`

Refactor priority:
medium

## Classification

Classification: feature-component
Reason: Locations create-warehouse form currently has no observed consumer, but delete/replace needs later usage and replacement proof.
Target folder: `src/components/features/locations/components`
Target file name: `create-warehouse-form.tsx`
Keep / Move / Split / Delete: keep/move
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
- Still needed: yes; delete/replace requires later usage/import/replacement proof

### Decision

Record the keep/move decision as planned ownership only. Phase 19 does not move source files, create target folders, rewrite imports, delete docs, or alter behavior.
