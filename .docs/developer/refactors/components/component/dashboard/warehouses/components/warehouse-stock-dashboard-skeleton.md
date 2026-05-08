---
source: src/components/dashboard/warehouses/components/warehouse-stock-dashboard-skeleton.tsx
type: component
isCorrectCase: false
---

## Inventory (Phase 18)

**Constraints:** D-06 inventory lists internal declarations; D-09 docs-only. **TBD Phase 19** for targets.

Component name:
WarehouseStockDashboardSkeleton

Current file path:
`src/components/dashboard/warehouses/components/warehouse-stock-dashboard-skeleton.tsx`

Current responsibility:
Skeleton matching warehouse stock dashboard layout.

Dependencies:
  - Components: Skeleton, cn
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
local shimmer blocks

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
Reason: Feature-specific warehouse stock dashboard skeleton; keep near feature owner.
Target folder: `src/components/features/locations/components`
Target file name: `warehouse-stock-dashboard-skeleton.tsx`
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
- Contains repeated styling: yes
- Contains multiple components: no
- Still needed: yes

### Decision

Record the move decision as planned ownership only. Phase 19 does not move source files, create target folders, rewrite imports, delete docs, or alter behavior.

## Logic Mapping

Feature skeleton adjacent to warehouse stock dashboard — align removals with stock dashboard page split.

### Logic Movement Plan

| Logic | Current location | Target location | Reason | Risk |
| --- | --- | --- | --- | --- |
| Primary artifact | Current dashboard/misc path | `src/components/features/...` or `src/types/dto/locations/...` per Classification | Phase 22 move (**feature** / **types**) | low |

### Notes

Classification rows remain authoritative — Phase 20 captures linkage only.

