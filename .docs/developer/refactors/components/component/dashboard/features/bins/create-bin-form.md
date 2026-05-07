---
source: src/components/dashboard/features/bins/create-bin-form.tsx
type: component
isCorrectCase: true
---

## Inventory (Phase 18)

Component name:
CreateBinForm

Current file path:
`src/components/dashboard/features/bins/create-bin-form.tsx`

Current responsibility:
Bin create form; **`useDashboardWarehouse().createBin`**; receives `zonesList` for select.

Mutation calls:
`createBin`

Hooks: **`useDashboardWarehouse`**

Recommended destination:
TBD Phase 19

Refactor priority:
medium

## Classification

Classification: feature-component
Reason: Locations create-bin form; context/mutation ownership remains future hook work.
Target folder: `src/components/features/locations/components`
Target file name: `create-bin-form.tsx`
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
