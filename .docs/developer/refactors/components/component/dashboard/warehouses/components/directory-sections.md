---
source: src/components/dashboard/warehouses/components/DirectorySections.tsx
type: component
isCorrectCase: false
---

## Inventory (Phase 18)

**Constraints:** D-06 inventory lists internal declarations; D-09 docs-only. **TBD Phase 19** for targets.

Component name:
DirectorySections

Current file path:
`src/components/dashboard/warehouses/components/DirectorySections.tsx`

Current responsibility:
Two-column directory sections for warehouses and zones with pagination controls.

Dependencies:
  - Components: `PaginationSelector`, `dashboard-types` display records, `next/link`, lucide
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
`SectionBlock`, list row renderers (see source)

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
Reason: Locations directory sections with reusable-looking section/list children; primitive status remains Phase 21 candidate-only.
Target folder: `src/components/features/locations/components`
Target file name: `directory-sections.tsx`
Keep / Move / Split / Delete: split
Risk level: medium

### Evaluation

- Duplicates shadcn/ui: no
- Project-wide reusable: no
- Domain-specific: yes
- Fetches data: no
- Mutates data: no
- Contains reusable transformation logic: no
- Defines types inline: no
- Contains repeated styling: yes
- Contains multiple components: yes
- Still needed: yes

### Decision

Record the split decision as planned ownership only. Phase 19 does not move source files, create target folders, rewrite imports, delete docs, or alter behavior.

## Dismounted Components

| Component | New code path | New documentation path | Reason |
|---|---|---|---|
| `SectionBlock` | `src/components/features/locations/components/section-block.tsx` | `.docs/developer/refactors/components/dismounted/section-block.md` | Separate render child/helper responsibility so the future move keeps the parent focused and reviewable. |
| `ListCard` | `src/components/features/locations/components/list-card.tsx` | `.docs/developer/refactors/components/dismounted/list-card.md` | Separate render child/helper responsibility so the future move keeps the parent focused and reviewable. |
