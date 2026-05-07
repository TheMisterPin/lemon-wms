---
source: src/components/dashboard/features/warehouses/create-warehouse-form.tsx
type: component
isCorrectCase: true
---

## Inventory (Phase 18)

Component name:
CreateWarehouseForm (default export pattern — verify in source)

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
