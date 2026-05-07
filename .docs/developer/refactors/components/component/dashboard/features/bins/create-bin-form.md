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
Bin create dialog form; receives **`zonesList`** + **`onCreateBin`** (**Phase 22-07**/**CFR-21**) — parent passes **`actions.createBin`** from **`DashboardBinsPage**.

Mutation calls:
`onCreateBin`

Hooks: **none**

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

## Logic Mapping

### Logic Found

Render logic:
- See Phase 18 inventory / Classification for JSX responsibilities; Phase 20 documents ownership only.

UI-only state:
- Local form/chart/table interaction state as implemented in source (no behavior change).

Data fetching logic:
- Typically owned by hooks noted in Inventory (`useDashboardWarehouse`, stock dashboard hooks, etc.) — not duplicated in these components.

Mutation logic:
- Feature forms invoke warehouse hook/provider actions (`createBin`, `createZone`, `createWarehouse`). Ownership documented in `.docs/developer/refactors/hooks/dashboard/warehouses/use-dashboard-warehouse.md`.

Data transformation logic:
- Presentation helpers remain **retained render** unless Inventory marks transformer extraction.

Validation logic:
- Stays component-local or schema-driven per source unless Phase 22 lifts shared validation.

Error handling logic:
- Align with hook/error-dialog patterns documented on canonical hook docs when mutations apply.

Reusable utility logic:
- Small formatters may become **`transformer`** modules in Phase 22 if duplication is proven.

Types/interfaces declared inline:
- Track **`types/dto`** moves only when Inventory lists inline types.

### Logic Movement Plan

| Logic | Current location | Target location | Reason | Risk |
| --- | --- | --- | --- | --- |
| Feature UI module | Current dashboard path | Planned `src/components/features/...` per Classification | Phase 22 move (**feature**) | medium |
| Async/mutation ownership | Consumed hooks/providers | Canonical paths under `.docs/developer/refactors/hooks/dashboard/` | Single responsibility (**hook**) | medium |
| Shared formatting helpers | Inline helpers | `src/lib/transformers/locations/` or `stock/` when deduped | **transformer** tier | low |

### New Files Needed

None beyond Classification target paths — physical files created in Phase 22.

### Notes

`createBin` + zone options flow through `useDashboardWarehouse` — target nested **`actions`** shape documented in canonical warehouse hook (CFR-12).
