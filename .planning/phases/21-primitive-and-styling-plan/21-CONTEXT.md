# Phase 21: Primitive and styling plan — Context

**Gathered:** 2026-05-07  
**Status:** Ready for planning  
**Note:** User invoked bundled `$gsd-discuss-phase 21` + `$gsd-plan-phase 21` without interactive gray-area selection. Decisions below are **locked from ROADMAP success criteria**, **CFR-14–CFR-17**, **`.planning/REQUIREMENTS.md` out-of-scope table**, and **Phase 18–20 refactor artifacts**. Refine via editing this file if product preferences emerge later.

<domain>
## Phase Boundary

Phase 21 produces **documentation only** for **primitive extraction candidates** and **styling/skeleton placement**: what may become `src/components/primitives`, what stays feature-local, and what evidence supports repetition — **without** changing runtime visuals, Tailwind themes, API contracts, or implementing Phase 22 moves.

UI hint **yes** applies to **dashboard office surfaces** (shadcn-based); floor aesthetic rules remain unchanged unless explicitly referenced in artifacts.

</domain>

<decisions>
## Implementation Decisions

### Primitive eligibility (CFR-15)
- **D-21-01:** A primitive is **planned** only when **repeated, domain-neutral UI structure or styling evidence** exists across multiple call sites (refactor docs + source reads during execution).
- **D-21-02:** **Forbidden inside approved primitives:** network I/O, mutations, feature-hook imports, awareness of API response shapes, domain business rules. Violations stay in hooks/feature layers.
- **D-21-03:** **Domain-aware or mega-primitives** are **out of scope** — align with REQUIREMENTS “Out of Scope” row.

### Primitive documentation shape (CFR-14)
- **D-21-04:** Every **accepted primitive candidate** gains (or extends) a refactor markdown section documenting: **purpose**, **source components/paths**, **target primitive path** (`src/components/primitives/...`), **props/DTO outline**, **styling/token rules**, **allowed responsibilities**, **forbidden responsibilities**, **migration usage sketch**, **open questions**.
- **D-21-05:** **Rejected** candidates are listed in `_primitive-extraction-plan.md` with **reason** (single-use, domain coupling, etc.).

### Visual preservation (CFR-16)
- **D-21-06:** Structural refactors **preserve current visual output**. Phase 21 **does not** authorize Tailwind cleanup for aesthetics, spacing tweaks for taste, color changes, layout redesign, or modernization passes — documentation may reference preservation as a hard gate for Phase 22.

### Skeletons & generic states (CFR-17)
- **D-21-07:** **Feature-specific skeletons** remain documented **near their feature** (`split or keep grouped` clusters from Phase 19 stay valid unless Phase 21 evidence proves generic reuse).
- **D-21-08:** **Generic loading/error/empty** patterns become primitive candidates **only when reuse is documented** (multiple consumers named in refactor docs).

### Aggregation artifact
- **D-21-09:** Create or extend `.docs/developer/refactors/_primitive-extraction-plan.md` listing candidates, **evidence** (file references), **target path**, **risk**, and **approve/defer/reject** recommendation — satisfies ROADMAP success criterion #2.

### Prioritization (agent discretion)
- **D-21-10:** Execute waves starting from components already tagged **primitive** or **high primitive likelihood** in Phase 19–20 docs (e.g. `warehouse-overview-primitives`, repeated KPI/skeleton/chart shells), then broaden to stock/bin surfaces — **order is planner-owned** provided CFR-14–17 coverage completes.

### Scope exclusions
- **D-21-11:** GenericTable V2, new npm deps, new design systems, and email-order-type features remain **deferred** per REQUIREMENTS.

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Milestone & requirements
- `.planning/ROADMAP.md` — Phase 21 goal, success criteria, depends on Phase 20
- `.planning/REQUIREMENTS.md` — CFR-14, CFR-15, CFR-16, CFR-17

### Rules & aesthetics
- `.cursor/rules/styling-and-primitives.mdc` — primitive extraction, tokens, dashboard patterns
- `.cursor/rules/component-refactor-core.mdc` — behavior preservation, reviewability
- `.cursor/rules/refactor-documentation-workflow.mdc` — refactor doc templates
- `.cursor/rules/component-architecture.mdc` — primitives vs features layering

### Phase 20 outputs (logic boundaries)
- `.docs/developer/refactors/_logic-mapping-summary.md`
- `.docs/developer/refactors/components/_classification-summary.md`
- `.docs/developer/refactors/components/_refactor-map.md`
- Representative high-signal docs: `warehouse-overview-primitives.md`, stock/stock skeleton docs, zone KPI strips — **full list is planner-owned**

### Dashboard UI stack
- `.cursor/rules/component-architecture.mdc` — shadcn primitives baseline for dashboard work

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- Refactor markdown already flags primitive candidates and Phase 21 deferrals (e.g. `warehouse-overview-primitives.md`, skeleton clusters, repeated `--wh-*` dashboard shells).
- `src/styles/tokens.css` / `src/styles/component-classes.css` centralize repeated dashboard styling per styling rule.

### Established Patterns
- shadcn/ui as base; primitives must wrap or compose shadcn — not duplicate giant feature logic.

### Integration Points
- Phase 22 executes moves/extractions **only** where Phase 21 approves or defers with rationale recorded.

</code_context>

<specifics>
## Specific Ideas

- User bundled discuss + plan commands — prioritize **executable docs** over conversational UX for this session.

</specifics>

<deferred>
## Deferred Ideas

- GenericTable V2 resume — CFR-F02 / paused GTB scope.
- Whole-app primitive extraction beyond documented dashboard warehouse/location/stock slice — future CFR-F01 waves.

</deferred>

---

*Phase: 21-Primitive and styling plan*  
*Context gathered: 2026-05-07*
