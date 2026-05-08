---
source: src/components/dashboard/bins/dashboard-bins-page-view.tsx
type: component
isCorrectCase: false
---

## Inventory (Phase 18)

Component name:
DashboardBinsPageView

Current file path:
`src/components/dashboard/bins/dashboard-bins-page-view.tsx`

Current responsibility:
Bins list page using `PageWithGrid`; **prop-driven** — receives **`bins`**, loading/error, and **`headerActions`** (**Phase 22-07**/**CFR-21**). Owns only **`BinContentsModal`** UI state. Page container **`DashboardBinsPage`** (`src/components/features/locations/pages/dashboard-bins-page.tsx`) calls **`useDashboardWarehouse`** and passes **`CreateBinForm`** wired with **`onCreateBin`** (**Phase 23** verified).

Dependencies:
  - Components: `PageWithGrid`, entity bin config columns, **`headerActions`** slot (typically **`CreateBinForm`**), `BinContentsModal`
  - Hooks: **none** (data supplied via props)
  - Types: `BinTableRow`, `ReactNode` for header slot

Props:
`DashboardBinsPageViewProps` — **`bins`**, **`isLoading`**, **`error`**, **`headerActions`**

Internal state:
Modal open/bin id state

Mutation calls:
(none — parent passes **`onCreateBin`** into header form)

Hooks: **none**

Main UI blocks:
`PageWithGrid` + `BinContentsModal`

Declared child components inside the file:
(none)

Repeated styling:
via `PageWithGrid` + entity tone

Repeated logic:
`openContents` / `onContentsOpenChange`

Recommended destination:
TBD Phase 19

Refactor priority:
medium — D-03 consumer documented

## Classification

Classification: feature-page
Reason: Page-level bins list view consuming the dashboard warehouse hook output.
Target folder: `src/components/features/locations/pages`
Target file name: `dashboard-bins-page-view.tsx`
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
- Contains multiple components: no
- Still needed: yes

### Decision

Record the move decision as planned ownership only. Phase 19 does not move source files, create target folders, rewrite imports, delete docs, or alter behavior.

## Logic Mapping

Thin route/page shells assemble hooks + presentational children — **no standalone fetching**.

### Logic Found

- **Render / wiring:** Compose bins listing via `useDashboardWarehouse` outputs — duplicate warehouse hook movement narrative intentionally omitted here (single-component move scope).
- **Data:** Owned by documented hooks (`useDashboardWarehouse`, bin overview hooks, stock health/item hooks, etc.).
- **Other CFR-09 rows:** N/A or delegated upstream.

### Logic Movement Plan

| Logic | Current location | Target location | Reason | Risk |
| --- | --- | --- | --- | --- |
| Composition JSX | Current dashboard path | `src/components/features/...` per Classification | Phase 22 path migration (**feature**) | low |

### Notes

See canonical warehouse hook Logic Mapping when touching warehouse-context mutations (`hooks/dashboard/warehouses/use-dashboard-warehouse.md`).

