---
source: src/components/features/locations/components/bin-contents-modal.tsx
type: component
isCorrectCase: true
---

## Inventory (Phase 18)

Component name:
BinContentsModal (+ helpers `quantityForBinItemStatus`, `toContentTableRows`)

Current file path:
`src/components/features/locations/components/bin-contents-modal.tsx`

Current responsibility:
Dialog listing bin contents; fetches bin+lines via **`dashboardApiClient`** when opened; uses `TableShell` + column config; not a `useDashboardWarehouse` consumer but in selected feature bins scope.

API calls:
GET against bin contents endpoint (see source for exact path)

Mutation calls:
(none)

Dependencies:
  - `dashboardApiClient`, `TableShell`, `useTableShellController`, dialog primitives

Recommended destination:
TBD Phase 19

Refactor priority:
medium

## Classification

Classification: feature-component
Reason: Shared locations modal with table-row mapping and helper logic used by multiple dashboard pages.
Target folder: `src/components/features/locations/components`
Target file name: `bin-contents-modal.tsx`
Keep / Move / Split / Delete: split
Risk level: high

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
- Modal/dialog shell with table listing bin contents; composes `TableShell` and column definitions.

UI-only state:
- Open/loading/error UI tied to dialog lifecycle and fetch outcome.

Data fetching logic:
- GET bin contents via `dashboardApiClient` when modal opens (see source path).

Mutation logic:
- N/A.

Data transformation logic:
- `quantityForBinItemStatus`, `toContentTableRows`, column builders map API rows to table presentation.

Validation logic:
- N/A.

Error handling logic:
- Loading/error branches around fetch — retain UX messaging when splitting.

Reusable utility logic:
- Quantity + row-mapping helpers suitable for `src/lib/transformers/locations/*`.

Types/interfaces declared inline:
- N/A beyond table row helpers — types sourced from configs/API shapes per source.

### Logic Movement Plan

| Logic | Current location | Target location | Reason | Risk |
| --- | --- | --- | --- | --- |
| Client fetch for bin contents | Effect inside modal | Future **`hook`** (`src/hooks/dashboard/locations/*`) or co-located data hook | Keeps feature component render-focused (CFR-09) | high |
| Row/column mapping helpers | Inside modal module | `src/lib/transformers/locations/*` per dismount rows | Reusable mapping (CFR-10 **transformer**) | medium |
| `ContentLine` / column config | Nested components | `src/components/features/locations/components/*` | Split multi-component file before move | medium |
| Dialog shell / TableShell wiring | Modal JSX | **retained render** in feature component | shadcn/dialog composition stays local | low |

### New Files Needed

See **Dismounted Components** for Phase 22 paths.

### Notes

Evaluation checkbox “Fetches data: no” is inconsistent with inventory — Phase 22 treats fetch ownership explicitly when extracting hook logic.

## Dismounted Components

| Component | New code path | New documentation path | Reason |
|---|---|---|---|
| `ContentLine` | `src/components/features/locations/components/content-line.tsx` | `.docs/developer/refactors/components/dismounted/content-line.md` | Separate render child/helper responsibility so the future move keeps the parent focused and reviewable. |
| `quantityForBinItemStatus` | `src/lib/transformers/locations/quantity-for-bin-item-status.ts` | `.docs/developer/refactors/components/dismounted/quantity-for-bin-item-status.md` | Separate render child/helper responsibility so the future move keeps the parent focused and reviewable. |
| `toContentTableRows` | `src/lib/transformers/locations/to-content-table-rows.ts` | `.docs/developer/refactors/components/dismounted/to-content-table-rows.md` | Separate render child/helper responsibility so the future move keeps the parent focused and reviewable. |
| `contentColumns` | `src/components/features/locations/components/content-columns.ts` | `.docs/developer/refactors/components/dismounted/content-columns.md` | Separate render child/helper responsibility so the future move keeps the parent focused and reviewable. |

## Refactor Status

Status: split
Old path: `src/components/dashboard/features/bins/bin-contents-modal.tsx`
New path: `src/components/features/bin/components/bin-contents-modal.tsx`
Related files:
- `src/hooks/dashboard/locations/use-bin-contents.ts`
- `src/types/dto/locations/bin-contents.ts`
- `src/components/dashboard/bins/dashboard-bins-page-view.tsx`
Imports updated: yes
Typecheck status: `pnpm exec tsc --noEmit` passed; targeted ESLint passed; full `pnpm lint` still has unrelated pre-existing repo failures.
Notes: Client fetching and table-row DTO preparation moved out of the modal into `useBinContents`; the modal remains responsible for Dialog/TableShell rendering and table interaction state. Updated from temporary locations feature ownership to entity-aligned bin ownership.
