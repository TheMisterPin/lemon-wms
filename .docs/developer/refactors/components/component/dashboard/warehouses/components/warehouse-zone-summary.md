---
source: src/components/dashboard/warehouses/components/WarehouseZoneSummary.tsx
type: component
isCorrectCase: false
---

## Inventory (Phase 18)

**Constraints:** D-06 inventory lists internal declarations; D-09 docs-only. **TBD Phase 19** for targets.

Component name:
WarehouseZoneSummary

Current file path:
`src/components/dashboard/warehouses/components/WarehouseZoneSummary.tsx`

Current responsibility:
Zone cards/list for warehouse overview.

Dependencies:
  - Components: overview types/primitives
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
(source)

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
Reason: Zone summary component crosses component, lib page data, and shared type references; move only after usage checks.
Target folder: `src/components/features/locations/components`
Target file name: `warehouse-zone-summary.tsx`
Keep / Move / Split / Delete: move
Risk level: high

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

## Logic Mapping

### Logic Found

Render logic:
- Zone cards/list region inside warehouse overview composition.

UI-only state:
- Confirm during Phase 22 source read whether any local toggles exist.

Data fetching logic:
- N/A — consumes props from parent overview view.

Mutation logic:
- N/A.

Data transformation logic:
- Any formatting helpers inline or imported — consolidate only if duplication emerges in Phase 22.

Validation logic:
- N/A.

Error handling logic:
- N/A.

Reusable utility logic:
- Potential small formatters — **deferred** until duplication proven.

Types/interfaces declared inline:
- Primarily imported overview DTO types — follow `warehouse-overview-types` relocation plan.

### Logic Movement Plan

| Logic | Current location | Target location | Reason | Risk |
| --- | --- | --- | --- | --- |
| Component body | `WarehouseZoneSummary.tsx` | `src/components/features/locations/components/warehouse-zone-summary.tsx` | Planned **move** per Classification | high |
| Coupled imports (overview primitives/types) | Current graph | Explicit feature imports post-move | Phase 19 high-risk coupling | high |
| Inner helpers (if split later) | TBD | **deferred** | Avoid speculative extraction | medium |

### New Files Needed

None beyond planned feature component path until usage audit completes.

### Notes

Record import/usage searches before removing legacy paths in Phase 22.
