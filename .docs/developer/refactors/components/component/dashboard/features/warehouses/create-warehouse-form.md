---
source: src/components/features/locations/components/create-warehouse-form.tsx
type: component
isCorrectCase: true
---

## Inventory (Phase 18)

Component name:
CreateWarehouseForm (`export default function CreateWarehouseForm`)

Current file path:
`src/components/features/locations/components/create-warehouse-form.tsx`

Current responsibility:
Header/dialog-style creator using Generic Form config; calls **`onCreateWarehouse(values)`** on submit (**Phase 22-07**) — **required prop** (no hook inside module).

Mutation calls:
parent-supplied **`onCreateWarehouse`**

Dependencies:
  - Validation: `warehouseFormSchema` pick for create

Props:
**`onCreateWarehouse`** (**required**); **no default consumers** in-tree yet (**Phase 23** inventory note).

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

**Keep/move** ambiguity: prove consumers before delete/replace; mutations still follow warehouse hook `actions` documentation.

## Refactor Status

Status: moved
Old path: `src/components/dashboard/features/warehouses/create-warehouse-form.tsx`
New path: `src/components/features/warehouse/components/create-warehouse-form.tsx`
Related files: none observed
Imports updated: yes
Typecheck status: `pnpm exec tsc --noEmit` passed; targeted ESLint passed; full `pnpm lint` still has unrelated pre-existing repo failures.
Notes: Component remains available for warehouse-owned feature use; usage search found no current runtime consumer.
