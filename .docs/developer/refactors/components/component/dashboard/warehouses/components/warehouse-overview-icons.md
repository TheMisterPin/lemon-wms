---
source: src/components/dashboard/warehouses/components/warehouse-overview-icons.tsx
type: component
isCorrectCase: true
---

## Inventory (Phase 18)

**Constraints:** D-06 inventory lists internal declarations; D-09 docs-only. **TBD Phase 19** for targets.

Component name:
WarehouseOverviewIconGlyph + warehouseOverviewIcons

Current file path:
`src/components/dashboard/warehouses/components/warehouse-overview-icons.tsx`

Current responsibility:
Shared SVG icon components + icon map for warehouse dashboard KPIs/charts.

Dependencies:
  - Components: react `ComponentType`
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
`WarehouseOverviewIconGlyph`, icon record

Repeated styling:
Dashboard `--wh-*` token shells; record as evidence.

Repeated logic:
(see source maps/reducers — evidence only)

Recommended destination:
TBD Phase 19

Refactor priority:
medium

## Classification

Classification: utility
Reason: Icon glyph map used by selected locations and overview rows; keep domain-adjacent until Phase 21/22 prove generic ownership.
Target folder: `src/components/features/locations/components`
Target file name: `warehouse-overview-icons.tsx`
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
- Contains multiple components: no
- Still needed: yes

### Decision

Record the move decision as planned ownership only. Phase 19 does not move source files, create target folders, rewrite imports, delete docs, or alter behavior.
