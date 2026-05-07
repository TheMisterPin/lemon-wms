---
source: src/components/dashboard/warehouses/components/warehouse-overview-primitives.tsx
type: component
isCorrectCase: true
---

## Inventory (Phase 18)

**Constraints:** D-06 inventory lists internal declarations; D-09 docs-only. **TBD Phase 19** for targets.

Component name:
Warehouse overview primitives module

Current file path:
`src/components/dashboard/warehouses/components/warehouse-overview-primitives.tsx`

Current responsibility:
Buttons, shell sections, chart panel wrapper, status pills, tone style map.

Dependencies:
  - Components: recharts tooltip props constant
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
multiple exports — see source

Repeated styling:
Dashboard `--wh-*` token shells; record as evidence.

Repeated logic:
(see source maps/reducers — evidence only)

Recommended destination:
TBD Phase 19

Refactor priority:
medium

## Classification

Classification: primitive
Reason: Reusable-looking UI cluster used across several dashboards; Phase 19 records primitive candidate only and Phase 21 must approve.
Target folder: `src/components/primitives`
Target file name: `warehouse-overview-primitives.tsx`
Keep / Move / Split / Delete: split
Risk level: high

### Evaluation

- Duplicates shadcn/ui: no
- Project-wide reusable: candidate pending Phase 21
- Domain-specific: candidate
- Fetches data: no
- Mutates data: no
- Contains reusable transformation logic: no
- Defines types inline: yes
- Contains repeated styling: yes
- Contains multiple components: yes
- Still needed: yes

### Decision

Record the split decision as planned ownership only. Phase 19 does not move source files, create target folders, rewrite imports, delete docs, or alter behavior. Primitive extraction is candidate-only and requires Phase 21 approval.

## Dismounted Components

| Component | New code path | New documentation path | Reason |
|---|---|---|---|
| `WarehouseOverviewButton` | `src/components/primitives/warehouse-overview-button.tsx` | `.docs/developer/refactors/components/dismounted/warehouse-overview-button.md` | Separate render child/helper responsibility so the future move keeps the parent focused and reviewable. |
| `WarehouseOverviewShellSection` | `src/components/primitives/warehouse-overview-shell-section.tsx` | `.docs/developer/refactors/components/dismounted/warehouse-overview-shell-section.md` | Separate render child/helper responsibility so the future move keeps the parent focused and reviewable. |
| `WarehouseOverviewChartPanel` | `src/components/primitives/warehouse-overview-chart-panel.tsx` | `.docs/developer/refactors/components/dismounted/warehouse-overview-chart-panel.md` | Separate render child/helper responsibility so the future move keeps the parent focused and reviewable. |
| `WarehouseOverviewStatusPill` | `src/components/primitives/warehouse-overview-status-pill.tsx` | `.docs/developer/refactors/components/dismounted/warehouse-overview-status-pill.md` | Separate render child/helper responsibility so the future move keeps the parent focused and reviewable. |
| `warehouseOverviewToneStyles` | `src/components/primitives/warehouse-overview-tone-styles.tsx` | `.docs/developer/refactors/components/dismounted/warehouse-overview-tone-styles.md` | Separate render child/helper responsibility so the future move keeps the parent focused and reviewable. |
| `warehouseOverviewRechartsTooltipProps` | `src/components/primitives/warehouse-overview-recharts-tooltip-props.tsx` | `.docs/developer/refactors/components/dismounted/warehouse-overview-recharts-tooltip-props.md` | Separate render child/helper responsibility so the future move keeps the parent focused and reviewable. |
