---
source: src/components/dashboard/zones/components/ZoneOverviewKpiStrip.tsx
type: component
isCorrectCase: true
---

## Inventory (Phase 18)

Component name:
ZoneOverviewKpiStrip

Current file path:
`src/components/dashboard/zones/components/ZoneOverviewKpiStrip.tsx`

Current responsibility:
KPI metric strip for zone overview dashboard.

Recommended destination:
TBD Phase 19

Refactor priority:
medium

## Classification

Classification: feature-component
Reason: Zone KPI strip declares multiple KPI child components.
Target folder: `src/components/features/locations/components`
Target file name: `zone-overview-kpi-strip.tsx`
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
| `ZoneOverviewBinsKpi` | `src/components/features/locations/components/zone-overview-bins-kpi.tsx` | `.docs/developer/refactors/components/dismounted/zone-overview-bins-kpi.md` | Separate render child/helper responsibility so the future move keeps the parent focused and reviewable. |
| `ZoneOverviewStockKpi` | `src/components/features/locations/components/zone-overview-stock-kpi.tsx` | `.docs/developer/refactors/components/dismounted/zone-overview-stock-kpi.md` | Separate render child/helper responsibility so the future move keeps the parent focused and reviewable. |
| `ZoneOverviewFillageKpi` | `src/components/features/locations/components/zone-overview-fillage-kpi.tsx` | `.docs/developer/refactors/components/dismounted/zone-overview-fillage-kpi.md` | Separate render child/helper responsibility so the future move keeps the parent focused and reviewable. |
