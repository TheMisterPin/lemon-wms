---
source: src/components/dashboard/bins/DashboardBinsPageView.tsx
type: component
isCorrectCase: false
---

## Inventory (Phase 18)

Component name:
DashboardBinsPageView

Current file path:
`src/components/dashboard/bins/DashboardBinsPageView.tsx`

Current responsibility:
Bins list page using `PageWithGrid`; consumes **`useDashboardWarehouse()`** for `bins`, `zoneOptions`, loading/error (D-03). Embeds `CreateBinForm`, `BinContentsModal`, row action opens contents modal.

Dependencies:
  - Components: `PageWithGrid`, entity bin config columns, `CreateBinForm`, `BinContentsModal`
  - Hooks: **`useDashboardWarehouse`**
  - Types: `ZoneTableRow` / bin row types via config
  - Utils: `lucide-react` `Box`

Props:
(none)

Internal state:
Modal open/bin id state

API calls:
(none in component — provider/hook owns fetches)

Mutation calls:
(none — forms own mutations via context)

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
