# Phase 22: First locations slice — Context

**Gathered:** 2026-05-07  
**Status:** Execution started (22-01 complete)  
**GSD route:** `$gsd-next` → discuss Phase 22 → this context bundled without interactive gray-area menu (same pattern as Phase 21).

<domain>
## Phase Boundary

Milestone **v1.2** Phase **22** delivers the **first executable vertical slice**: create/maintain documented target folders (`src/components/features`, `src/components/primitives`, `src/hooks/...`, shared `lib`/`types` per refactor plans) and move code **without** API/mutation/semantic or visual behavior change (**CFR-16**). Refactor docs remain the source of truth for old vs new paths.

</domain>

<decisions>

- **D-22-01:** Execute in **small waves** with one atomic commit per wave when possible; verify import graph after each move.
- **D-22-02:** **P21-001** approved primitive — `warehouse-overview-primitives` is the first code move (**22-01**); all consumers use `@/components/primitives/warehouse-overview-primitives`.
- **D-22-03:** `DashboardWarehouseProvider`, hook splits, DTO/type migrations, and route thinning follow **subsequent** plans (not blocked by 22-01).
- **D-22-04:** No Prisma migrations, no new npm deps, no visual redesign — HARD per milestone rules.

</decisions>

<canonical_refs>

- `.planning/ROADMAP.md` — Phase 22 success criteria (CFR-18–CFR-22)
- `.docs/developer/refactors/_primitive-extraction-plan.md` — P21-001
- `.docs/developer/refactors/hooks/dashboard/warehouses/use-dashboard-warehouse.md` (canonical hook — future waves)
- `.cursor/rules/styling-and-primitives.mdc`

</canonical_refs>
