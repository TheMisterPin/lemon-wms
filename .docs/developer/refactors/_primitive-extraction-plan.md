# Primitive extraction plan (Phase 21)

**Status:** Phase 21 documentation — no `src/**` edits in this phase.  
**Context:** `.planning/phases/21-primitive-and-styling-plan/21-CONTEXT.md`  
**Rules:** `.cursor/rules/styling-and-primitives.mdc`

## Purpose

This file is the **single aggregation register** for primitive and skeleton-placement decisions before Phase 22 code moves.

- Phase **21** records **approve** / **defer** / **reject** recommendations with evidence pointers only.
- Phase **22** implements extraction **only** where this plan marks **approve**, or where **defer** is resolved with rationale unchanged — **without** visual regression (**CFR-16**): no broad Tailwind cleanup, spacing tastes, palette shifts, or layout redesign during extraction.

## CFR-15 — Primitive disqualifiers

A row **must not** be marked **approve** if the candidate would:

- Fetch data, call Axios/API routes, or mutate server state
- Import **feature** hooks or `dashboardApiClient` / `warehouseApiClient`
- Encode API response shapes or domain business rules (beyond presentational tone/CSS mappings)
- Act as a domain-aware or mega-primitive spanning unrelated features without neutral naming and reuse proof

## How to read recommendations

| Value | Meaning for Phase 22 |
|-------|----------------------|
| **approve** | Extract/move to `src/components/primitives/…` when executing slice — preserve classes verbatim |
| **defer** | Keep inline or feature-local until listed gate clears (second consumer, type split, GTB resume, etc.) |
| **reject** | Do **not** promote to primitives; may remain utility/feature |

## Master table — primitive candidates

Data rows are appended by Phase **21-02** through **21-05** (`P21-xxx` IDs).

| ID | Candidate name | Source doc path | Source code path | Repeated pattern evidence (short) | Target primitive path (if approve) | Recommendation | Risk | Notes / open questions |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| P21-001 | warehouse-overview-primitives | `.docs/developer/refactors/components/component/dashboard/warehouses/components/warehouse-overview-primitives.md` | `src/components/dashboard/warehouses/components/warehouse-overview-primitives.tsx` | Five importing dashboards (bins, devices, orders ×2, stock category); shared `--wh-*` KPI/chart shells | `src/components/primitives/warehouse-overview-primitives.tsx` | approve | high | See doc § Primitive candidate specification (Phase 21 / CFR-14); optional splits per Dismounted Components |
| P21-002 | StatCard (OverviewCards) | `.docs/developer/refactors/components/component/dashboard/warehouses/components/overview-cards.md` | `src/components/dashboard/warehouses/components/OverviewCards.tsx` (nested) | Single-module nested component; no external imports of `StatCard` | `src/components/primitives/dashboard-stat-card.tsx` (if promoted) | defer | medium | Second consumer gate — see overview-cards CFR-14 § |
| P21-003 | SectionBlock + ListCard (DirectorySections) | `.docs/developer/refactors/components/component/dashboard/warehouses/components/directory-sections.md` | `src/components/dashboard/warehouses/components/DirectorySections.tsx` | Directory-specific composition; separate `SectionBlock` in BinGrid | tentative `src/components/primitives/dashboard-*` | defer | medium | De-conflict BinGrid `SectionBlock` before any primitive; see directory-sections CFR-14 § |
| P21-004 | Stock chart shell (`StockChartPanel` cluster) | `.docs/developer/refactors/components/component/dashboard/stock/category-stock-page-client.md` | `src/components/dashboard/stock/category-stock-page-client.tsx` | Stock Recharts + color helpers; overlaps warehouse chart panel visually only | shared primitive **only after** diff — otherwise none | defer | medium | Class-list compare to `WarehouseOverviewChartPanel` in Phase 22 |
| P21-005 | Bin overview Recharts / KPI shells | `.docs/developer/refactors/components/component/dashboard/bins/bin-overview-dashboard.md` | `src/components/dashboard/bins/bin-overview-dashboard.tsx` | Imports warehouse overview primitives; bin-specific metrics | none (defer consolidation) | defer | medium | Avoid mega-primitive across bin/order/stock |
| P21-006 | Bin grid pagination chrome | `.docs/developer/refactors/components/component/dashboard/warehouses/components/bin-grid.md` | `src/components/dashboard/warehouses/components/BinGrid.tsx` | Single grid consumer; GTB paused | none until GTB / second consumer | defer | low | Revisit with GenericTable V2 or shared grid chrome |
| P21-007 | warehouse-overview-icons | `.docs/developer/refactors/components/component/dashboard/warehouses/components/warehouse-overview-icons.md` | `src/components/dashboard/warehouses/components/warehouse-overview-icons.tsx` | Glyph map shared across several dashboards but **domain-semantically** coupled | *(not primitive)* | reject | low | Remains utility/feature-adjacent — see icons doc § |

## Phase 21 completeness (vs ROADMAP)

Maps `.planning/ROADMAP.md` Phase 21 success criteria:

1. **Primitive candidate docs** — CFR-14 sections added on: `warehouse-overview-primitives.md`, `overview-cards.md`, `directory-sections.md`, `category-stock-page-client.md`, `bin-overview-dashboard.md`, `bin-grid.md`, `warehouse-overview-icons.md`.
2. **`_primitive-extraction-plan.md`** — Master rows **P21-001**–**P21-007** + skeleton annex (four cluster docs).
3. **CFR-15** — Disqualifiers section above; **reject** row **P21-007**; no approve rows with hooks/API shapes.
4. **CFR-17** — Skeleton annex + per-doc **`## Skeleton placement (Phase 21 / CFR-17)`** on four skeleton cluster markdown files; **no** standalone skeleton primitives approved.

**Execution status:** Phase 21 **documentation wave** complete — no `src/**` edits. Phase 22 implements **P21-001 approve** first; resolve **defer** rows before promoting additional primitives.


Feature-specific skeleton **clusters** default to staying near their feature. Generic loading/error/empty primitives require **documented reuse** across consumers before **approve**.

**Phase 21 execution:** No standalone skeleton primitives approved — clusters remain feature-local pending shimmer/KPI byte comparisons in Phase 22.

| Skeleton cluster doc | Placement decision | Rationale |
| --- | --- | --- |
| `.docs/developer/refactors/components/component/dashboard/warehouses/components/warehouse-dashboard-overview-skeleton.md` | Feature-local grouped | Warehouse overview layout skeleton; shimmer overlap deferred |
| `.docs/developer/refactors/components/component/dashboard/warehouses/dashboard-location-page-skeleton.md` | Feature-local grouped | Two routes but locations-scoped; not cross-domain generic |
| `.docs/developer/refactors/components/component/dashboard/stock/dashboard-stock-page-skeleton.md` | Feature-local grouped | Stock-specific KPI/chart/table placeholders |
| `.docs/developer/refactors/components/component/dashboard/zones/components/zone-overview-dashboard-skeleton.md` | Feature-local | Zone overview single-file skeleton |


---

*Cross-ref: Phase 20 logic summary — `.docs/developer/refactors/_logic-mapping-summary.md`*
