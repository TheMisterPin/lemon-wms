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

## Logic Mapping

### Logic Found

Render logic:
- KPI metric strip composed of multiple KPI tiles for zone overview.

UI-only state:
- N/A.

Data fetching logic:
- N/A — consumes overview DTO props.

Mutation logic:
- N/A.

Data transformation logic:
- Formatting likely localized per KPI child — verify during Phase 22.

Validation logic:
- N/A.

Error handling logic:
- N/A.

Reusable utility logic:
- If KPI formatting repeats warehouse overview KPI merge patterns, extract shared transformer later.

Types/interfaces declared inline:
- Uses zone overview dashboard typings.

### Logic Movement Plan

| Logic | Current location | Target location | Reason | Risk |
| --- | --- | --- | --- | --- |
| Individual KPI components | Nested declarations | `src/components/features/locations/components/*` per dismount | Split multi-component module (**feature**) | medium |
| Strip layout orchestration | Parent export | **retained render** after extractions | Composition glue | low |

### New Files Needed

See **Dismounted Components**.

### Notes

Compare KPI presentation logic with `dashboard-warehouse-overview` KPI merge helpers before extracting shared transformers.

## Dismounted Components

| Component | New code path | New documentation path | Reason |
|---|---|---|---|
| `ZoneOverviewBinsKpi` | `src/components/features/locations/components/zone-overview-bins-kpi.tsx` | `.docs/developer/refactors/components/dismounted/zone-overview-bins-kpi.md` | Separate render child/helper responsibility so the future move keeps the parent focused and reviewable. |
| `ZoneOverviewStockKpi` | `src/components/features/locations/components/zone-overview-stock-kpi.tsx` | `.docs/developer/refactors/components/dismounted/zone-overview-stock-kpi.md` | Separate render child/helper responsibility so the future move keeps the parent focused and reviewable. |
| `ZoneOverviewFillageKpi` | `src/components/features/locations/components/zone-overview-fillage-kpi.tsx` | `.docs/developer/refactors/components/dismounted/zone-overview-fillage-kpi.md` | Separate render child/helper responsibility so the future move keeps the parent focused and reviewable. |
