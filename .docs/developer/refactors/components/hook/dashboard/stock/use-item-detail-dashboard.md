---
source: src/components/dashboard/stock/use-item-detail-dashboard.ts
type: hook
isCorrectCase: true
---

## Inventory (Phase 18)

**Canonical:** `.docs/developer/refactors/hooks/dashboard/stock/use-item-detail-dashboard.md`

### Summary

**`useItemDetailDashboard(itemId: string)`** — GET `/dashboard/stock/items/:itemId/overview`.

### Fetch / state

- Same read-hook pattern; `refetch` = `load`.

### Mutations

- None.

### Types

- `ItemDetailDashboardDTO` from `@/types/item-detail-dashboard.types`.

### Refactor notes

- Target **TBD Phase 19/20**.

## Phase 18 Inventory

Component name: Use Item Detail Dashboard generated hook/provider doc
Current file path: `src/components/dashboard/stock/use-item-detail-dashboard.ts`
Current responsibility: Current hook for Use Item Detail Dashboard. It owns the runtime data/state responsibilities recorded below; extraction or relocation is deferred to Phase 19/20.
Dependencies:
  - Components: None observed in current source.
  - Hooks: useItemDetailDashboard
  - Types: @/types/item-detail-dashboard.types, @/types/responses/basic-response
  - Utils: @/lib/axios
Props: No named Props type detected; see hook responsibility doc.
Internal state: React useState, React useEffect lifecycle, React useCallback actions/loaders
API calls: dashboardApiClient HTTP calls
Mutation calls: None observed.
Main UI blocks: ItemDetailDashboardDTO, ApiResponse
Declared child components inside the file: UseItemDetailDashboardReturn, useItemDetailDashboard
Repeated styling: None observed.
Repeated logic: None significant observed.
Recommended destination: TBD Phase 19/20; hook responsibility documented before any source movement.
Refactor priority: Normal baseline inventory priority.

### Provider / Hook Notes

- Canonical hook responsibility doc: `.docs/developer/refactors/hooks/dashboard/stock/use-item-detail-dashboard.md`.
- CFR-02: selected hook responsibility is documented under .docs/developer/refactors/hooks.
- D-05/D-07/D-09/D-10: metadata preserved, inventory current, no source movement or behavior change.

## Classification

Classification: hook
Reason: Stock hook owns item detail fetching/loading/error state.
Target folder: `src/hooks/dashboard/stock`
Target file name: `use-item-detail-dashboard.ts`
Keep / Move / Split / Delete: move
Risk level: medium

### Evaluation

- Duplicates shadcn/ui: no
- Project-wide reusable: no
- Domain-specific: yes
- Fetches data: yes
- Mutates data: no
- Contains reusable transformation logic: no
- Defines types inline: yes
- Contains repeated styling: no
- Contains multiple components: yes
- Still needed: yes

### Decision

Record the move decision as planned ownership only. Phase 19 does not move source files, create target folders, rewrite imports, delete docs, or alter behavior.

## Logic Mapping

### Logic Found

Render logic:
- N/A — hook module only.

UI-only state:
- Loading/error flags plus cached data refs per hook implementation.

Data fetching logic:
- Primary responsibility — HTTP reads via `dashboardApiClient` as documented in Inventory.

Mutation logic:
- Document per hook (`None` for listed dashboard hooks unless source changes).

Data transformation logic:
- Maps API envelopes to page-ready DTOs — expand rows when transforms grow beyond inline parsing.

Validation logic:
- N/A unless hook validates params client-side.

Error handling logic:
- Maps failed responses to `error` string/state consistent with existing hook contract.

Reusable utility logic:
- **Special:** `use-dashboard-stock` module-level `fetchStockDashboardData` — retain colocated with hook unless duplication emerges elsewhere (Phase 22 reassessment).

Types/interfaces declared inline:
- Lift to `src/types/api/stock` / `src/types/dto/stock` when hooks stabilize.

### Logic Movement Plan

| Logic | Current location | Target location | Reason | Risk |
| --- | --- | --- | --- | --- |
| Hook implementation | Current component-adjacent path | Planned `src/hooks/dashboard/{locations|stock}/...` per Classification | Phase 22 move (**hook**) | medium |
| API wiring | Hook body | Optional `src/types/api/...` for payloads | Contract clarity (**types/api**) | low |
| Page-ready DTO shaping | Hook return | `src/types/dto/...` + **`transformer`** helpers when non-trivial | Separation (**types/dto**/ **transformer**) | medium |
| `fetchStockDashboardData` helper | `use-dashboard-stock` module | **Retained** adjacent to hook until duplication proven | RESEARCH Q5 default | low |

### New Files Needed

Deferred to Phase 22 — only documentation here.

### Notes

Canonical Logic Mapping: `.docs/developer/refactors/hooks/dashboard/stock/use-item-detail-dashboard.md`.

