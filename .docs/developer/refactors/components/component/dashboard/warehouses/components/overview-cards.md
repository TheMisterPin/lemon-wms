---
source: src/components/dashboard/warehouses/components/OverviewCards.tsx
type: component
isCorrectCase: false
---

## Inventory (Phase 18)

**Constraints:** D-06 inventory lists internal declarations; D-09 docs-only. **TBD Phase 19** for targets.

Component name:
OverviewCards

Current file path:
`src/components/dashboard/warehouses/components/OverviewCards.tsx`

Current responsibility:
Three-up stat cards (warehouses/zones/bins) from `DashboardOverviewCard[]`.

Dependencies:
  - Components: `dashboard-types`, lucide icons
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
`StatCard` (local)

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
Reason: Locations overview cards with reusable-looking StatCard; primitive approval deferred to Phase 21.
Target folder: `src/components/features/locations/components`
Target file name: `overview-cards.tsx`
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
- Three-up overview metrics cards driven by `DashboardOverviewCard[]`.

UI-only state:
- N/A.

Data fetching logic:
- N/A.

Mutation logic:
- N/A.

Data transformation logic:
- Card props consumed directly — minimal mapping.

Validation logic:
- N/A.

Error handling logic:
- N/A.

Reusable utility logic:
- N/A.

Types/interfaces declared inline:
- Uses dashboard overview card types from shared modules.

### Logic Movement Plan

| Logic | Current location | Target location | Reason | Risk |
| --- | --- | --- | --- | --- |
| `StatCard` implementation | Local nested component | `src/components/features/locations/components/stat-card.tsx` | Split reusable card (**feature**, Phase 21 primitive candidate) | medium |
| Card grid composition | `OverviewCards` | **retained render** in feature component | Layout orchestration | low |

### New Files Needed

See **Dismounted Components**.

### Notes

**Phase 21:** `StatCard` may graduate to `components/primitives` if approval proves domain-neutral styling.

## Dismounted Components

| Component | New code path | New documentation path | Reason |
|---|---|---|---|
| `StatCard` | `src/components/features/locations/components/stat-card.tsx` | `.docs/developer/refactors/components/dismounted/stat-card.md` | Separate render child/helper responsibility so the future move keeps the parent focused and reviewable. |

## Primitive candidate specification (Phase 21 / CFR-14)

### StatCard (nested implementation)

**Purpose:** Compact KPI tile with icon, accent stripe, title, and formatted value inside the locations overview grid.

**Reuse evidence:** `rg 'function StatCard' src` → **only** `src/components/dashboard/warehouses/components/OverviewCards.tsx` defines `StatCard`; it is not imported as a standalone component elsewhere.

**Target primitive path (only if promoted later):** `src/components/primitives/dashboard-stat-card.tsx` (name tentative).

**Props sketch:** `title`, `value`, `icon` (Lucide component), `accent` tone key — presentational only.

**Styling / tokens:** Uses dashboard card / `--wh-*` assumptions consistent with locations overview; extraction must be class-identical (**CFR-16**).

**Allowed:** Layout, typography, icon slot, accent bar styling.

**Forbidden:** Data fetching, mutations, hook imports, KPI semantics beyond props supplied by parent (**CFR-15**).

**Recommendation:** **defer** — no second independent feature module consumes an extractable `StatCard`; promote only after a proven second consumer or shared import path exists.

**Verification command logged:** `rg -n 'function StatCard' src/components`
