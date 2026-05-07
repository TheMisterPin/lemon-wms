---
source: src/components/dashboard/warehouses/components/BinGrid.tsx
type: component
isCorrectCase: false
---

## Inventory (Phase 18)

**Constraints:** D-06 inventory lists internal declarations; D-09 docs-only. **TBD Phase 19** for targets.

Component name:
BinGrid

Current file path:
`src/components/dashboard/warehouses/components/BinGrid.tsx`

Current responsibility:
Paginated bin grid with fill bars and “View contents” callback; helpers `getBinStatus`, `getFillBarStyle`.

Dependencies:
  - Components: `PaginationSelector`, `BinRecord` type, lucide `PackageOpen`
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
`getBinStatus`, `getFillBarStyle`, local tile UI

Repeated styling:
Dashboard `--wh-*` token shells; record as evidence.

Repeated logic:
(see source maps/reducers — evidence only)

Recommended destination:
TBD Phase 19

Refactor priority:
medium
