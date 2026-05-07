---
source: src/components/dashboard/zones/components/ZoneFillDistributionBarChart.tsx
type: component
isCorrectCase: true
---

## Inventory (Phase 18)

Component name:
ZoneFillDistributionBarChart

Current file path:
`src/components/dashboard/zones/components/ZoneFillDistributionBarChart.tsx`

Current responsibility:
Bar chart for zone fill distribution (recharts or similar — see source).

Recommended destination:
TBD Phase 19

Refactor priority:
medium

## Classification

Classification: feature-component
Reason: Zone fill distribution chart component with local fill bucket constants.
Target folder: `src/components/features/locations/components`
Target file name: `zone-fill-distribution-bar-chart.tsx`
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
