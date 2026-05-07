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

## Classification

Classification: feature-component
Reason: Locations bin grid component declares child card/section components and status helpers.
Target folder: `src/components/features/locations/components`
Target file name: `bin-grid.tsx`
Keep / Move / Split / Delete: split
Risk level: medium

### Evaluation

- Duplicates shadcn/ui: no
- Project-wide reusable: no
- Domain-specific: yes
- Fetches data: no
- Mutates data: no
- Contains reusable transformation logic: yes
- Defines types inline: no
- Contains repeated styling: yes
- Contains multiple components: yes
- Still needed: yes

### Decision

Record the split decision as planned ownership only. Phase 19 does not move source files, create target folders, rewrite imports, delete docs, or alter behavior.

## Dismounted Components

| Component | New code path | New documentation path | Reason |
|---|---|---|---|
| `BinCard` | `src/components/features/locations/components/bin-card.tsx` | `.docs/developer/refactors/components/dismounted/bin-card.md` | Separate render child/helper responsibility so the future move keeps the parent focused and reviewable. |
| `SectionBlock` | `src/components/features/locations/components/section-block.tsx` | `.docs/developer/refactors/components/dismounted/section-block.md` | Separate render child/helper responsibility so the future move keeps the parent focused and reviewable. |
| `getBinStatus` | `src/lib/transformers/locations/get-bin-status.ts` | `.docs/developer/refactors/components/dismounted/get-bin-status.md` | Separate render child/helper responsibility so the future move keeps the parent focused and reviewable. |
| `getFillBarStyle` | `src/lib/transformers/locations/get-fill-bar-style.ts` | `.docs/developer/refactors/components/dismounted/get-fill-bar-style.md` | Separate render child/helper responsibility so the future move keeps the parent focused and reviewable. |
