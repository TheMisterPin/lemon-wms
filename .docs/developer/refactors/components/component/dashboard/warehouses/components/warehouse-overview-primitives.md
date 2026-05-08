---
source: src/components/primitives/warehouse-overview-primitives.tsx
type: component
isCorrectCase: true
---

## Inventory (Phase 18)

**Constraints:** D-06 inventory lists internal declarations; D-09 docs-only. **TBD Phase 19** for targets.

Component name:
Warehouse overview primitives module

Current file path:
`src/components/primitives/warehouse-overview-primitives.tsx`

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

## Logic Mapping

### Logic Found

Render logic:
- Shared warehouse dashboard primitives: buttons, shell sections, chart panels, status pills, tone style maps.

UI-only state:
- Prefer none — presentational exports.

Data fetching logic:
- N/A.

Mutation logic:
- N/A.

Data transformation logic:
- Tone/style maps map statuses to classes — borderline presentation tokens.

Validation logic:
- N/A.

Error handling logic:
- N/A.

Reusable utility logic:
- Tooltip props helper for recharts — thin adapter.

Types/interfaces declared inline:
- Local prop types for primitives — migrate with components.

### Logic Movement Plan

| Logic | Current location | Target location | Reason | Risk |
| --- | --- | --- | --- | --- |
| Each exported primitive | Single module today | `src/components/primitives/*` per dismount rows | **Approved** Phase 21 (**P21-001**) — Phase 22 executes | high |
| Tone maps / tooltip adapters | Module-level constants | Collocate with primitive or `src/lib/**` if proven domain-neutral | Decision deferred pending Phase 21 verdict | medium |

### New Files Needed

See **Dismounted Components** — instantiate only after Phase 21 primitive approval.

### Notes

**Phase 21 gate:** **Approved** — see `_primitive-extraction-plan.md` row **P21-001**; Phase 22 executes the move.

## Dismounted Components

| Component | New code path | New documentation path | Reason |
|---|---|---|---|
| `WarehouseOverviewButton` | `src/components/primitives/warehouse-overview-button.tsx` | `.docs/developer/refactors/components/dismounted/warehouse-overview-button.md` | Separate render child/helper responsibility so the future move keeps the parent focused and reviewable. |
| `WarehouseOverviewShellSection` | `src/components/primitives/warehouse-overview-shell-section.tsx` | `.docs/developer/refactors/components/dismounted/warehouse-overview-shell-section.md` | Separate render child/helper responsibility so the future move keeps the parent focused and reviewable. |
| `WarehouseOverviewChartPanel` | `src/components/primitives/warehouse-overview-chart-panel.tsx` | `.docs/developer/refactors/components/dismounted/warehouse-overview-chart-panel.md` | Separate render child/helper responsibility so the future move keeps the parent focused and reviewable. |
| `WarehouseOverviewStatusPill` | `src/components/primitives/warehouse-overview-status-pill.tsx` | `.docs/developer/refactors/components/dismounted/warehouse-overview-status-pill.md` | Separate render child/helper responsibility so the future move keeps the parent focused and reviewable. |
| `warehouseOverviewToneStyles` | `src/components/primitives/warehouse-overview-tone-styles.tsx` | `.docs/developer/refactors/components/dismounted/warehouse-overview-tone-styles.md` | Separate render child/helper responsibility so the future move keeps the parent focused and reviewable. |
| `warehouseOverviewRechartsTooltipProps` | `src/components/primitives/warehouse-overview-recharts-tooltip-props.tsx` | `.docs/developer/refactors/components/dismounted/warehouse-overview-recharts-tooltip-props.md` | Separate render child/helper responsibility so the future move keeps the parent focused and reviewable. |

## Primitive candidate specification (Phase 21 / CFR-14)

### Purpose

Provide a shared, dashboard-neutral **visual shell** for warehouse-toned KPI surfaces: buttons, section shells, chart panel wrapper, status pills, tone class maps, and the shared Recharts tooltip preset — without data loading or domain mutations.

### Source module

`src/components/primitives/warehouse-overview-primitives.tsx`

### Consumers

Verified cross-dashboard imports (inventory summary + source tree):

1. `src/components/dashboard/bins/bin-overview-dashboard.tsx`
2. `src/components/dashboard/devices/device-detail-dashboard.tsx`
3. `src/components/dashboard/orders/dashboard-orders-overview-view.tsx`
4. `src/components/dashboard/orders/order-detail-dashboard.tsx`
5. `src/components/dashboard/stock/category-stock-dashboard.tsx`

### Target path (Phase 22)

`src/components/primitives/warehouse-overview-primitives.tsx` (single module move first; optional splits per **Dismounted Components** table during later micro-phases — **CFR-16**: preserve JSX/class output).

### Props / exports sketch

- **`warehouseOverviewToneStyles`** — const map `WarehouseOverviewTone` → Tailwind-style class strings (presentation only).
- **`WarehouseOverviewButton`** — `href`, `selected`, `disabled`, `title`, `children`, `onClick`.
- **`WarehouseOverviewShellSection`** — titled section shell with optional pill/action slot.
- **`WarehouseOverviewChartPanel`** — `children` wrapper for chart height/card chrome.
- **`WarehouseOverviewStatusPill`** — label + tone-driven border/text classes.
- **`warehouseOverviewRechartsTooltipProps`** — preset tooltip styling object for Recharts.

### Styling and tokens

Heavy reliance on dashboard **`--wh-*`** CSS variables and Lemon matte dashboard card shells (see `src/styles/tokens.css` / component usage). Phase 22 extraction **must** copy classes verbatim — token drift is out of scope for Phase 21–22 extraction (**CFR-16**).

### Allowed responsibilities

- Presentational layout, spacing, hover/disabled visual states
- Tone/status → CSS class mapping that encodes **display** semantics only (no API shapes)

### Forbidden responsibilities (**CFR-15**)

- Network I/O, mutations, feature hooks, Axios/API clients
- Imports from feature modules that embed business rules or DTO manipulation
- Awareness of API response types beyond presentational props passed by parents

### Migration usage sketch (Phase 22)

Feature pages continue to own data; they **import presentational exports** from `src/components/primitives/warehouse-overview-primitives` (or split children per dismount table) and pass ready-to-render labels/URLs/boolean flags only.

### Open questions

- Inline prop types vs relocation to `src/types/dto` / `src/types/components` — decide during Phase 22 split to avoid circular imports; **no** semantic DTO changes.
- Whether to physically split dismounted files in one commit or incremental waves — planner/executor choice; behavior-preserving.

### Phase 21 recommendation

**Approve** for Phase 22 primitive extraction: module has **no hooks or API clients** (verified imports: `react` types only). Recorded as **`P21-001`** in `.docs/developer/refactors/_primitive-extraction-plan.md`.
