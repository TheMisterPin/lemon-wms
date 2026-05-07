# Phase 20: Logic mapping and hook decisions - Context

**Gathered:** 2026-05-07
**Status:** Ready for planning

<domain>
## Phase Boundary

Phase 20 is a documentation-only logic mapping phase for the selected dashboard warehouse/location/stock refactor scope. It records which responsibilities currently live in render components, hooks, providers, inline types, transformation helpers, and utilities, then maps each responsibility to its planned future home before implementation.

This phase does not move source files, create target folders, rewrite imports, change hook return shapes in code, change API contracts, change DTO meanings, change mutation semantics, or alter UI/visual output.

</domain>

<decisions>
## Implementation Decisions

### Logic Mapping Defaults
- **D-20-01:** Each relevant selected component/hook doc should identify render logic, UI-only state, fetching, mutations, data transformation, validation, error handling, reusable utility logic, and inline types/interfaces.
- **D-20-02:** Movement tables should map each logic item to one of: retained render code, hook, transformer, API type, DTO type, shared utility, or deferred.
- **D-20-03:** Every mapping row must include reason and risk so Phase 22 can implement without re-deciding ownership.

### Dashboard Warehouse Provider Split
- **D-20-04:** Raw `/dashboard/home` payload and mutation response shapes should be planned under `src/types/api`.
- **D-20-05:** UI-ready warehouse, zone, bin, option, table, KPI, and page DTOs should be planned under `src/types/dto`.
- **D-20-06:** Reusable data mapping and normalization from dashboard payloads to DTOs should be planned under `src/lib/transformers/locations`.
- **D-20-07:** Mutation error parsing should be planned as a shared utility only if reuse is confirmed by Phase 20 evidence; otherwise document it as provider-local until Phase 22 proves reuse.
- **D-20-08:** The target dashboard warehouse hook should return page-ready DTOs and grouped `actions`, while `DashboardWarehouseProvider` remains compatibility scaffolding until usage searches prove consumers migrated.

### Hook Action Shape
- **D-20-09:** Hooks exposing more than two callbacks should plan an `actions` object.
- **D-20-10:** Phase 20 documents this target shape only; actual hook return changes are deferred to Phase 22.

### the agent's Discretion
- The agent may choose which high-risk files get deeper movement tables first, provided `use-dashboard-warehouse.tsx` receives an implementation-ready split plan.
- The agent may mark low-risk render-only components as retained/render-focused with concise mapping if no logic movement is needed.
- The agent may add a phase-level `_logic-mapping-summary.md` and update hook responsibility summaries for continuity.

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Prior Phase Outputs
- `.planning/phases/18-inventory-baseline/18-inventory-verification.md` - Inventory coverage verification.
- `.planning/phases/19-classification-and-ownership/19-CONTEXT.md` - Accepted classification and ownership decisions.
- `.docs/developer/refactors/components/_classification-summary.md` - Classification, action, risk, and split-plan matrix.
- `.docs/developer/refactors/components/_refactor-map.md` - Planned target paths.
- `.docs/developer/refactors/hooks/_responsibility-summary.md` - Hook/provider responsibility baseline.

### Planning Artifacts
- `.planning/PROJECT.md` - v1.2 milestone goals and non-goals.
- `.planning/REQUIREMENTS.md` - CFR-09 through CFR-13 define Phase 20.
- `.planning/ROADMAP.md` - Phase 20 goal and success criteria.

### Refactor Rules
- `.cursor/rules/refactor-documentation-workflow.mdc` - Logic mapping and documentation requirements.
- `.cursor/rules/component-refactor-core.mdc` - Behavior preservation and reviewability.
- `.cursor/rules/component-architecture.mdc` - Target layering model.
- `.cursor/rules/hooks-and-data-flow.mdc` - Hook, DTO, transformer, API type, and route rules.
- `.cursor/rules/styling-and-primitives.mdc` - Keep styling/visual changes out of scope.
- `.cursorrules` - Project data-flow and component constraints.

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `src/components/dashboard/warehouses/use-dashboard-warehouse.tsx` currently combines provider/context, fetching, loading/error state, search param filtering, mutation actions, mutation error parsing, inline API payload types, DTO derivation, and refresh.
- Phase 19 classification docs identify split/high-risk files and future target paths that Phase 20 should convert into logic movement tables.
- Hook responsibility docs under `.docs/developer/refactors/hooks` provide current fetching/mutation/loading/error ownership.

### Established Patterns
- Components should become render-focused and receive DTOs/callbacks as props in later phases.
- Hooks own fetching, mutation calls, loading/error/refetch, DTO preparation, and grouped actions where callbacks exceed two.
- Raw API shapes and UI-ready DTOs should not live inside component files when they cross page/hook boundaries.
- Reusable transformations belong under `src/lib/transformers/[domain]`; Phase 20 only documents target placement.

### Integration Points
- `_logic-mapping-summary.md` should become Phase 21/22 input for what to move, what to retain, and what remains deferred.
- `use-dashboard-warehouse` hook docs must become implementation-ready for Phase 22: API type plan, DTO plan, transformer plan, mutation error parsing plan, action shape, provider compatibility plan, and usage-search gate.

</code_context>

<specifics>
## Specific Ideas

- Treat Phase 20 as the last planning/documentation gate before primitive planning and source movement.
- Be conservative: if a transformation or utility is only used once, document it as local/deferred rather than forcing shared extraction.
- Keep all target files as planned paths only; do not create them.

</specifics>

<deferred>
## Deferred Ideas

- Primitive approval and styling extraction are Phase 21.
- Actual source movement, target folder creation, import rewiring, hook return changes, provider compatibility implementation, and route thinning are Phase 22.
- Final moved-file verification is Phase 23.

</deferred>

---

*Phase: 20-Logic mapping and hook decisions*
*Context gathered: 2026-05-07*
