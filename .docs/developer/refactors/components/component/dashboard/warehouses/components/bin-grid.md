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

## Logic Mapping

### Logic Found

Render logic:
- Paginated bin grid tiles with fill visualization and “view contents” affordance.

UI-only state:
- Pagination UI state if handled internally (confirm in Phase 22).

Data fetching logic:
- N/A — props-driven grid data.

Mutation logic:
- N/A.

Data transformation logic:
- `getBinStatus`, `getFillBarStyle` map bin records to presentation.

Validation logic:
- N/A.

Error handling logic:
- N/A.

Reusable utility logic:
- Status/fill style helpers — candidate **`transformer`** modules if reused beyond grid.

Types/interfaces declared inline:
- N/A — relies on imported bin record types.

### Logic Movement Plan

| Logic | Current location | Target location | Reason | Risk |
| --- | --- | --- | --- | --- |
| Status/fill helpers | Inline | `src/lib/transformers/locations/*` if deduped | Pure mapping (**transformer**) | medium |
| Tile/card UI children | Nested in file | `src/components/features/locations/components/*` | Split multi-component (**feature**) | medium |
| Pagination wiring | Grid composition | **retained render** or co-locate with grid feature module | UX coupling | low |

### New Files Needed

See **Dismounted Components**.

### Notes

Phase 21 may evaluate whether pagination chrome becomes a primitive — **deferred**.

## Dismounted Components

| Component | New code path | New documentation path | Reason |
|---|---|---|---|
| `BinCard` | `src/components/features/locations/components/bin-card.tsx` | `.docs/developer/refactors/components/dismounted/bin-card.md` | Separate render child/helper responsibility so the future move keeps the parent focused and reviewable. |
| `SectionBlock` | `src/components/features/locations/components/section-block.tsx` | `.docs/developer/refactors/components/dismounted/section-block.md` | Separate render child/helper responsibility so the future move keeps the parent focused and reviewable. |
| `getBinStatus` | `src/lib/transformers/locations/get-bin-status.ts` | `.docs/developer/refactors/components/dismounted/get-bin-status.md` | Separate render child/helper responsibility so the future move keeps the parent focused and reviewable. |
| `getFillBarStyle` | `src/lib/transformers/locations/get-fill-bar-style.ts` | `.docs/developer/refactors/components/dismounted/get-fill-bar-style.md` | Separate render child/helper responsibility so the future move keeps the parent focused and reviewable. |

## Primitive candidate specification (Phase 21 / CFR-14)

### Pagination chrome

**Purpose:** Bin grid pagination controls are composed with bin-specific counts and labels.

**Reuse:** GenericTable V2 (**paused** — `.planning/REQUIREMENTS.md`) would be the natural home for shared table/grid pagination; until GTB resumes, **do not** invent a one-off `components/primitives` pagination for a single grid.

**Recommendation:** **defer** — second consumer + GTB alignment required; **reject** as standalone primitive today due to single-feature coupling.
