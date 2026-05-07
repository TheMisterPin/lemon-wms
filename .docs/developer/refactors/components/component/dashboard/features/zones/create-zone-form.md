---
source: src/components/dashboard/features/zones/create-zone-form.tsx
type: component
isCorrectCase: true
---

## Inventory (Phase 18)

Component name:
CreateZoneForm

Current file path:
`src/components/dashboard/features/zones/create-zone-form.tsx`

Current responsibility:
Zone create form; **`useDashboardWarehouse().createZone`** on submit; receives `warehouseList` prop from page for selects.

Mutation calls:
`createZone`

Hooks: **`useDashboardWarehouse`**

Recommended destination:
TBD Phase 19

Refactor priority:
medium

## Classification

Classification: feature-component
Reason: Locations create-zone form; mutation wiring remains future hook/provider work.
Target folder: `src/components/features/locations/components`
Target file name: `create-zone-form.tsx`
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
