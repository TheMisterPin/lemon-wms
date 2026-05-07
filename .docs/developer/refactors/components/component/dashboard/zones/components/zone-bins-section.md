---
source: src/components/dashboard/zones/components/zone-bins-section.tsx
type: component
isCorrectCase: true
---

## Inventory (Phase 18)

Component name:
ZoneBinStockCard, ZoneBinsSection

Current file path:
`src/components/dashboard/zones/components/zone-bins-section.tsx`

Current responsibility:
Renders bin stock cards/grid for zone overview.

Dependencies: (see source imports)

Props: (see `ZoneBinsSectionProps`, `ZoneBinStockCardProps`)

Declared child components inside the file:
`ZoneBinStockCard`, `ZoneBinsSection`

Recommended destination:
TBD Phase 19

Refactor priority:
medium

## Classification

Classification: feature-component
Reason: Zone bins section declares bin card and availability bar children.
Target folder: `src/components/features/locations/components`
Target file name: `zone-bins-section.tsx`
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
| `ZoneBinStockCard` | `src/components/features/locations/components/zone-bin-stock-card.tsx` | `.docs/developer/refactors/components/dismounted/zone-bin-stock-card.md` | Separate render child/helper responsibility so the future move keeps the parent focused and reviewable. |
| `ZoneBinAvailabilityBar` | `src/components/features/locations/components/zone-bin-availability-bar.tsx` | `.docs/developer/refactors/components/dismounted/zone-bin-availability-bar.md` | Separate render child/helper responsibility so the future move keeps the parent focused and reviewable. |
| `statusTone` | `src/components/features/locations/components/status-tone.tsx` | `.docs/developer/refactors/components/dismounted/status-tone.md` | Separate render child/helper responsibility so the future move keeps the parent focused and reviewable. |
