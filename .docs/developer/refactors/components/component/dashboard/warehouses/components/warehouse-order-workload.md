---
source: src/components/dashboard/warehouses/components/WarehouseOrderWorkload.tsx
type: component
isCorrectCase: false
---

## Inventory (Phase 18)

**Constraints:** D-06 inventory lists internal declarations; D-09 docs-only. **TBD Phase 19** for targets.

Component name:
WarehouseOrderWorkload

Current file path:
`src/components/dashboard/warehouses/components/WarehouseOrderWorkload.tsx`

Current responsibility:
Order-type workload breakdown panel for warehouse overview.

Dependencies:
  - Components: primitives/icons, overview types
  - Hooks: (none)
  - Types: (see imports in source — Phase 18 summary only)
  - Utils: (see source)

Props:
(see exported component signature in source)

Internal state:
(see source — prefer none for presentational)

API calls:
(none)

Mutation calls:
(none)

Main UI blocks:
(see JSX return in source)

Declared child components inside the file:
(see source for local row helpers)

Repeated styling:
Dashboard `--wh-*` token shells; record as evidence.

Repeated logic:
(see source maps/reducers — evidence only)

Recommended destination:
TBD Phase 19

Refactor priority:
medium

## Classification

Classification: feature-component
Reason: Orders workload panel inside locations dashboard context; keep feature component ownership.
Target folder: `src/components/features/locations/components`
Target file name: `warehouse-order-workload.tsx`
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

Orders workload panel — feature component without dashboard-scope mutations.
