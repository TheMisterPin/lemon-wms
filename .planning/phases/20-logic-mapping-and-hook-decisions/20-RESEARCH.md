# Phase 20: Logic mapping and hook decisions — Research

**Researched:** 2026-05-07  
**Domain:** Frontend refactor documentation (logic ownership, hook/provider split, dashboard data flow)  
**Confidence:** HIGH — reconciled with `.planning/phases/20-logic-mapping-and-hook-decisions/20-CONTEXT.md`, `.planning/REQUIREMENTS.md` (CFR-09–CFR-13), and `.planning/ROADMAP.md` (Phase 20) in this repo.

## Summary

Phase 19 left **52 classified rows** with target placeholders but **no `## Logic Mapping` sections** anywhere under `.docs/developer/refactors` — verified by repository search [VERIFIED: grep `## Logic Mapping` → no matches]. Phase 20 must add the **Logic Mapping** block defined in `.cursor/rules/refactor-documentation-workflow.mdc` so Phase 21/22 executors know what leaves render files vs stays colocated. The highest leverage row is **`DashboardWarehouseProvider` / `useDashboardWarehouse`** (`src/components/dashboard/warehouses/use-dashboard-warehouse.tsx`): it combines URL state, inline API payload types, fetch effect, DTO denormalization (`ZoneTableRow` / `BinTableRow`), three POST mutations, duplicated **`extractMutationError`** logic, and a layout-level provider dependency [VERIFIED: file read].

**Primary recommendation:** Use **risk- and split-driven depth** — full Logic Mapping + movement tables for **all `split` / `high` / `split or keep grouped` / multi-component** rows from `_classification-summary.md`; **concise retention notes** for **low-risk, move-only, single-component** rows. Anchor the warehouse provider split documentation first, then propagate the same taxonomy (CFR-10) across remaining docs in reviewable batches. For **`extractMutationError`**, document a **shared client utility** (not a DTO transformer) — evidence: **byte-identical** helpers in warehouse and devices providers [VERIFIED: grep `extractMutationError`]. Align the canonical hook doc’s provisional `extractMutationError` path (`src/lib/transformers/locations/mutation-error.ts` in `.docs/developer/refactors/hooks/dashboard/warehouses/use-dashboard-warehouse.md`) with **`src/lib/api/`**-adjacent naming in movement tables to match project mental model (“transformers” map API→UI DTOs per `.cursor/rules/hooks-and-data-flow.mdc`).

## Architectural Responsibility Map

| Capability | Primary Tier | Secondary Tier | Rationale |
|------------|--------------|----------------|-----------|
| Logic Mapping documentation | Refactor docs (`.docs/developer/refactors`) | — | Phase 20 is documentation-only; no runtime tier change. |
| Dashboard home fetch + filter + derived tables | Frontend client hook / provider module | SSR route layout (integration only) | Data enters via browser `dashboardApiClient`; layout currently mounts provider [CITED: `.docs/developer/refactors/hooks/dashboard/warehouses/use-dashboard-warehouse.md`]. |
| API payload typings | Shared client types (`src/types/api`) | Hook imports | Matches hooks rule; keeps raw shapes out of feature components [CITED: `.cursor/rules/hooks-and-data-flow.mdc`]. |
| Page-ready rows / selects | Hook-owned `useMemo` + eventual transformers | Components consume DTOs only | Matches hooks rule transformer guidance. |
| Mutation + `MutationError` parsing | Hook / provider (`actions`) | Shared `extractMutationError` util | Parsing is transport-envelope concern, not DTO mapping. |
| Error dialog reporting | Client shared UI hook (`useErrorDialog`) | Called from mutation catch paths | Stays imported from mutation owner until a further refactor explicitly extracts it. |

<user_constraints>
## User Constraints (from `20-CONTEXT.md`)

Locked decisions live in `.planning/phases/20-logic-mapping-and-hook-decisions/20-CONTEXT.md` — `<decisions>`: **D-20-01** through **D-20-10** (logic mapping fields and movement-table destinations; warehouse split targets under `types/api`, `types/dto`, `lib/transformers/locations`; shared mutation-error utility **only if reuse proven** (research confirms reuse via duplicated `extractMutationError`); page-ready hook return + grouped **`actions`**; provider compatibility until migration proved).

**Hard constraints:**

- Phase 20 research/planning deliverables stay documentation-first; **do not modify `src/**`** during research-only steps.
- No API contract, validation, DTO meaning, or mutation semantic changes as outcomes of research alone.
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description (from `.planning/REQUIREMENTS.md`) | Research support |
|----|------------------------------------------------|------------------|
| CFR-09 | Each relevant component document identifies render logic, UI-only state, fetching, mutations, data transformation, validation, error handling, reusable utility logic, and inline types/interfaces. | Section **Q1 / Full vs concise scoping**; driven by `_classification-summary.md` risk, `split`, and multi-component flags. |
| CFR-10 | Logic movement tables map fetching to hooks, mutations to hooks, reusable transformations to `src/lib/transformers`, raw API shapes to `src/types/api`, UI-ready DTOs to `src/types/dto`, reusable utility logic to shared utilities, and render logic to components. | Section **Movement taxonomy (CFR-10)** + workflow template [CITED: `.cursor/rules/refactor-documentation-workflow.mdc`]. |
| CFR-11 | Hook documents define current source, target hook file, consumers, inputs, returned DTO, actions, dependencies, loading/error/refetch ownership, and whether a provider/context should remain. | Section **Q5 — Hooks beyond warehouse**. |
| CFR-12 | Hooks that expose more than two callbacks group them under an `actions` object and return page-ready DTOs instead of raw API payloads. | Section **Q5** + warehouse **`actions`** plan (**Q3**). |
| CFR-13 | Mutation error parsing is moved out of component/provider files into a shared utility when the same behavior is reused by the first slice. | **`extractMutationError`** duplication (warehouse + devices); propose **`src/lib/api/`**-style shared util; section **Q3.C**. |
</phase_requirements>

---

## Q1 — Full Logic Mapping vs concise notes

**Rule:** Full **`## Logic Mapping`** (all subsections from refactor-documentation-workflow: Logic Found, Movement Plan table, New Files Needed, Notes) for rows that meet **any** of:

- `Action` is **`split`** or **`split or keep grouped`**, **or**
- `Risk` is **`high`**, **or**
- **`Contains multiple components`** is **yes** in the Phase 19 matrix [VERIFIED: `.docs/developer/refactors/components/_classification-summary.md`].

**Concise path (short subsection, no full movement table required):** rows with **`move`**, **`low`** or **`medium`** risk, **no** split, **no** multi-component — document 2–4 bullets: “logic remains in render/hook as-is; Phase 22 is path + import move only; no extraction.”

**Special row:** `src/app/(dashboard)/layout.tsx` — **integration-only** note: provider mount, Suspense boundary, no business logic; cross-link to warehouse provider Logic Mapping; **no** heavy movement table unless layout thinning is explicitly in scope later [CITED: `_refactor-map.md`].

**Counting aid:** 15 split + 3 split-or-grouped + 10 high-risk rows are listed explicitly under “Split rows” / “Risk counts” in `_classification-summary.md` [VERIFIED].

## Movement taxonomy (CFR-10)

Use this **Target kind** vocabulary in the **Logic Movement Plan** table (extend Reason/Risk as in the workflow template):

| Target kind | Holds | Example for this program |
|-------------|-------|---------------------------|
| **hook** | Fetch effects, loading/error/refresh, mutations, `useMemo` DTO assembly, `actions` object | `src/hooks/dashboard/locations/use-dashboard-warehouse.ts` (future) — **compatibility provider** may re-export same shape during migration. |
| **transformer** | Pure API record → UI DTO / normalization / label formatting (no React) | e.g. map dashboard home bin/zone records to table rows if extracted from hook for reuse [CITED: hooks-and-data-flow.mdc]. |
| **`types/api`** | Raw transport shapes, response payload fragments | `DashboardHomePayload`, `ZoneApiRecord`, `BinApiRecord`, `ApiPayload<T>` (today inline in `use-dashboard-warehouse.tsx`) [VERIFIED: source]. |
| **`types/dto`** | UI-ready types consumed by feature components | Existing `dashboard-types` / `warehouse-overview-types` moves already planned in refactor map [CITED: `_refactor-map.md`]. |
| **utility** | Pure helpers not tied to a single feature DTO | Icon maps, small formatters, **shared** `extractMutationError` (Axios + `ApiResponse` envelope) — document as **utility**, not transformer. |
| **retained render** | JSX structure, local UI state, prop wiring | Feature page/components after extractions; skeleton “split or keep grouped” decisions. |

**Reason column:** cite **separation of concerns**, **reuse**, **testability**, or **Phase 21 primitive candidate** (without implementing primitives in Phase 20).  
**Risk column:** tie to **consumer count**, **provider coupling**, **implicit global state via context**, or **duplicate error parsing**.

## Q3 — Implementation-ready split plan: `DashboardWarehouseProvider` / `useDashboardWarehouse`

Structured for Phase 21/22; **documentation tables should mirror this plan** inside the warehouse hook/component docs.

### A. Types (`types/api`)

| Unit | Proposed location | Notes |
|------|-------------------|-------|
| `ApiPayload<T>` | `src/types/api/locations/dashboard-warehouse.ts` (or shard if shared) | Today local generic [VERIFIED: source]. |
| `DashboardHomePayload` | same module | Mirrors hooks rule example `DashboardHomePayload` [CITED: hooks-and-data-flow.mdc]. |
| `ZoneApiRecord`, `BinApiRecord` | same module | Intermediate shapes before transformer or hook memo. |

### B. DTO / table rows

| Unit | Proposed location | Notes |
|------|-------------------|-------|
| Denormalized `ZoneTableRow` / `BinTableRow` derivation | Start in hook `useMemo`; optional **transformer** if reused by multiple pages | Current implementation is hook-local [VERIFIED: source]. |
| `SelectOption[]` for warehouses/zones | Hook `useMemo` | Remains presentation-adjacent; not `types/dto` unless promoted. |
| `Warehouse` list enrichment (defaulted fields) | **Transformer** candidate `mapDashboardHomeWarehouse` | Surprising defaults (`status`, `timezone`, etc.) should be called out in Logic Mapping **Risk** — behavior preservation critical. |

### C. Mutations + error parsing

| Unit | Proposed location | Notes |
|------|-------------------|-------|
| `createWarehouse` / `createZone` / `createBin` | Hook `actions` (see below) | Same POST paths and `refresh()` [VERIFIED: source]. |
| `extractMutationError` | **Shared utility** e.g. `src/lib/api/extract-mutation-error.ts` | Duplicated in `use-dashboard-devices.tsx` [VERIFIED: grep]. **Do not** label as `src/lib/transformers/...` in new docs — contradicts “transformer = mapping” rule [CITED: hooks-and-data-flow.mdc]. Update dismount table in canonical hook doc when Phase 22 implements. |

### D. Target hook file (placeholder)

- **Documented target:** `src/hooks/dashboard/locations/use-dashboard-warehouse.ts` [CITED: `_classification-summary.md` row 43].  
- **Provider file (for split):** match dismount table in canonical hook doc — `src/components/features/locations/providers/dashboard-warehouse-provider.tsx` [CITED: `.docs/developer/refactors/hooks/dashboard/warehouses/use-dashboard-warehouse.md` **Dismounted Components**]. Phase 20 only **records**; Phase 22 creates files.

### E. `actions` grouping (compatibility)

- **Target shape (document for Phase 22):** Context / hook return should expose:

```ts
actions: {
  createWarehouse: …
  createZone: …
  createBin: …
  refresh: …
}
```

per `.cursor/rules/hooks-and-data-flow.mdc` (more than two callbacks). **Current source** flattens callbacks on context [VERIFIED: `DashboardWarehouseContextValue`]. Document a **compatibility gate**: either (1) big-bang consumer update in same PR as shape change, or (2) temporary dual export (flat + `actions`) — **behavior-preservation** favors explicit migration checklist listing all consumers from hook doc [CITED: canonical hook doc **Used by** list].

### F. Provider compatibility gate (checklist)

1. **Consumers unchanged behavior:** `layout.tsx`, `DashboardBinsPageView`, `DashboardZonesPageView`, three create forms [CITED: canonical hook doc].  
2. **URL filter:** `warehouseId` search param filtering logic stays equivalent [VERIFIED: source `useSearchParams`].  
3. **Error dialog:** same `reportError` titles/sources strings.  
4. **Typing:** `MutationError` import path normalized (`@/types` vs `@/types/errors` discrepancy between warehouse/devices [VERIFIED: imports]). Document **single import path** in movement table — implementation detail, no semantic change.

## Q4 — `extractMutationError`: shared vs provider-local

| Location | Evidence |
|----------|-----------|
| `src/components/dashboard/warehouses/use-dashboard-warehouse.tsx` | Local `extractMutationError` [VERIFIED]. |
| `src/components/dashboard/devices/use-dashboard-devices.tsx` | Identical logic [VERIFIED: read + grep]. |

**Other mutation error handling:** `use-purchase-orders.ts` and `DashboardOrdersPageView.tsx` use **ad hoc** `err.response?.data` casting [VERIFIED: grep] — not identical; optional **follow-up wave** (not Phase 20 code) to align on shared utility **after** documenting warehouse/devices as first consumers.

**Recommendation:** **Shared utility** under **`src/lib/api/`** next to response helpers (`src/lib/api/response.ts` exists [VERIFIED: glob]) — cite “API envelope parsing” as rationale. Phase 20 **documents** path + consumers; Phase 22 implements.

## Q5 — Hooks beyond warehouse (CFR-11 / CFR-12) — doc updates vs deferred

| Hook | CFR-11 / CFR-12 | Phase 20 doc action | Deferred |
|------|-------------------|---------------------|----------|
| `use-dashboard-bin-overview` | Locations / bins | Add **Logic Mapping** to **generated component-hook doc** and sync **canonical** `.docs/developer/refactors/hooks/dashboard/bins/use-dashboard-bin-overview.md` — note “minimal extraction; fetch-only; DTO from `@/types`”. | Actual `src/hooks` move Phase 22. |
| `use-dashboard-stock` | Stock | Capture **module-level** `fetchStockDashboardData` in Logic Mapping as *retained helper vs future `lib` extraction* decision; sync canonical stock hook docs. Same for `use-category-stock-dashboard`, `use-inventory-health-dashboard`, `use-item-detail-dashboard` (all “Phase 20 hook/logic split” per `_responsibility-summary.md`. | Extracting fetch helper to shared `lib` is optional — document default **retain colocated** unless duplicate emerges. |
| Devices | Out of CFR-11/12 but shares `extractMutationError` | Add **one line** in devices hook doc: “dedupe with warehouse via shared util in Phase 22.” | — |

**Deferred:** Floor/warehouse (non-dashboard) hooks, orders/purchase **ad hoc** error parsing alignment — note in **Open Questions** if global standardization is a product goal.

## Q6 — Recommended plan waves (executor-oriented, doc batches)

Each wave ends with a **grep verification** (see Q7). Keep batches **≤ ~8–10 markdown files** touched per PR/commit for reviewability.

| Wave | Focus | Files (indicative count) |
|------|--------|--------------------------|
| **W0** | Taxonomy + template — add a **one-page** Phase 20 addendum under `.docs/developer/refactors/` *or* the first high-risk doc as **reference gold standard** | 1–2 |
| **W1** | **Warehouse provider/hook** cluster (anchor) | 2 (component-hook + canonical hook) + cross-link `layout` row in `_refactor-map.md` note if needed |
| **W2** | **High-risk split pages** (warehouse overview/stock, zone overview, bin overview, stock dashboard page, category client, bin modal, warehouse overview primitives) | ~8–10 |
| **W3** | **Remaining split / split-or-grouped / medium multi-component** rows | ~8–12 per batch |
| **W4** | **Move-only + low-touch** rows — concise Logic Mapping | ~10–15 per batch |
| **W5** | **Stock + bin hook** canonical docs + generated hook docs sync | ~6 |
| **W6** | **Consistency pass** — movement tables reference shared `extractMutationError` path; fix dismount table transformer path for that helper in canonical warehouse hook doc | sweep |

## Q7 — Verification strategy (no `src/**`, no new target dirs)

| Check | Command / method | Pass criteria |
|-------|------------------|---------------|
| Logic Mapping present | `rg '^## Logic Mapping' .docs/developer/refactors` | Non-zero matches after Phase 20 execution; spot-check **high-risk** files first. |
| No source edits | `git diff --name-only` scoped to phase work | **Zero** files under `src/` for Phase 20. |
| No premature folders | `test ! -d src/components/features/locations` (or list agreed targets) | **No new** `src/components/features/**` or `src/hooks/dashboard/**` paths **created in Phase 20** — directory creation belongs to Phase 22 [CITED: `_refactor-map.md` **Deferred Decisions**]. |
| Movement table taxonomy | Manual spot-check 3 split docs | Columns include **Target kind** vocabulary from CFR-10. |

## Standard Stack

### Core

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| Next.js App Router | 16.2.1 [VERIFIED: `package.json`] | Pages/layout where provider mounts | Existing app shell. |
| React | 19.2.3 [VERIFIED: `package.json`] | Hooks / context | Current UI runtime. |
| Axios | ^1.13.5 [VERIFIED: `package.json`] | `AxiosError` + response body parsing | Used by `extractMutationError`. |

**No new packages** for Phase 20 (documentation-only).

## Architecture Patterns

### System Architecture Diagram (conceptual)

```txt
Browser
  → dashboardApiClient (GET /dashboard/home, POST mutations)
  → DashboardWarehouseProvider (state + mapping + mutations)  ← split target
  → useDashboardWarehouse consumers (pages/forms)

Shared util (future)
  extractMutationError ← Axios + ApiResponse<null>
```

### Pattern: Logic Mapping as gate before file moves

**What:** Every high-risk row gets explicit **Logic Found** + **Movement Plan** before Phase 22 touches imports.  
**When:** Phase 20 documentation execution.  
**Example structure:** [CITED: `.cursor/rules/refactor-documentation-workflow.mdc` **Logic Mapping Section**]

### Anti-patterns to avoid

- **Calling `extractMutationError` a “transformer”** in movement tables — misleads implementers (transformers = DTO mapping per hooks rule).
- **Silent scope creep:** editing `src/**` or creating `src/components/features` “just placeholders” — violates Phase 20 hard constraint.
- **Flat callbacks + `actions` doc mismatch** — document one target shape to avoid thrash.

## Don't Hand-Roll

| Problem | Don’t build | Use instead | Why |
|---------|-------------|-------------|-----|
| Duplicate Axios error parsing | Copy-paste in each provider | One `extractMutationError` module | Two identical copies already [VERIFIED: grep]. |
| Ad hoc Logic Mapping formats | Per-author tables | Workflow template | Plan/review consistency [CITED: refactor-documentation-workflow.mdc]. |

## Common Pitfalls

### Pitfall 1: Underspecifying “retain in render”

**What goes wrong:** Move-only PRs yank helpers into wrong tiers.  
**Why:** Docs said “TBD” without “retain” decision.  
**How to avoid:** Even concise rows state **retained render** vs **hook** explicitly.  
**Warning signs:** Movement table empty for a `split` row.

### Pitfall 2: `actions` refactor without consumer inventory

**What goes wrong:** Missed destructuring site → runtime undefined.  
**Why:** Provider used across layout + multiple feature entry points.  
**How to avoid:** Consumer list from canonical hook doc + grep `useDashboardWarehouse` before implementation phase.  
**Warning signs:** Typecheck passes only because `any` or incomplete strict props (not observed — guard anyway).

### Pitfall 3: Conflicting target paths in generated vs canonical docs

**What goes wrong:** Executor follows wrong dismount path.  
**Why:** `extractMutationError` listed under `lib/transformers` in dismount table [VERIFIED: canonical hook doc] vs project rule meaning of “transformer”.  
**How to avoid:** Phase 20 updates **documentation** to resolve naming before code move.

## Code Examples

### Current `extractMutationError` (for movement-table reference only)

```typescript
// Source: src/components/dashboard/warehouses/use-dashboard-warehouse.tsx (read-only research)
function extractMutationError(err: unknown): MutationError {
  if (err instanceof AxiosError && err.response?.data) {
    const body = err.response.data as ApiResponse<null>
    return {
      message: body.message ?? 'An unexpected error occurred.',
      code: body.error?.code,
      details: body.error?.details
    }
  }
  if (err instanceof Error) {
    return { message: err.message }
  }
  return { message: 'An unexpected error occurred.' }
}
```

### Target `actions` shape (documentation target, not current source)

```typescript
// Source: .cursor/rules/hooks-and-data-flow.mdc (pattern)
type UseDashboardWarehouseResult = {
  // …data fields
  actions: {
    createWarehouse: (values: CreateWarehouseInput) => Promise<void>
    createZone: (values: CreateZoneInput) => Promise<void>
    createBin: (values: CreateBinInput) => Promise<void>
    refresh: () => void
  }
}
```

## State of the Art

| Old approach | Current approach | When | Impact |
|--------------|------------------|------|--------|
| Inline logic in dashboard components | Phased doc → then move to `features/` + `hooks/` | v1.2 roadmap | Reduces mixed-responsibility files; Phase 20 is the **logic map** gate. |

## Assumptions Log

| # | Claim | Section | Risk if wrong |
|---|-------|---------|---------------|
| A1 | CFR-09–CFR-13 descriptions match `.planning/REQUIREMENTS.md` intent | Phase Requirements | Wrong acceptance tests / plan tasks. |
| A2 | `20-CONTEXT.md` will match orchestrator “locked defaults” on provider split and `actions` | User Constraints | Rework doc tables. |
| A3 | Phase 22 (not 21) creates target folders | Handoff | Schedule clash with Phase 21 primitive approval. |

## Open Questions

1. **Where is `.planning/REQUIREMENTS.md` / `20-CONTEXT.md` for this repo?**  
   - What we know: Not in workspace at research time.  
   - Gap: Verbatim CFR-09–13 and locked decisions.  
   - Recommendation: Paste into RESEARCH follow-up or planner CONTEXT before execution.

2. **Should `fetchStockDashboardData` move to `src/lib` in v1.2?**  
   - What we know: Single consumer today [VERIFIED: `use-dashboard-stock.tsx`].  
   - Gap: Reuse forecast.  
   - Recommendation: Default **retain**; revisit if a second hook copies the pattern.

3. **Global mutation-error standard for orders components?**  
   - What we know: Different parsing style [VERIFIED: grep].  
   - Gap: Product priority.  
   - Recommendation: Phase 20 note only; separate micro-phase if desired.

## Environment Availability

**Step 2.6:** SKIPPED for documentation-only phase (no new external tool dependencies). Editors need markdown + `rg` for verification.

## Validation Architecture

> `workflow.nyquist_validation` is **true** in `.planning/config.json` [VERIFIED]; Phase 20 has **no automated test delta** — validation is **documentation gates**.

### Test Framework (unchanged baseline)

| Property | Value |
|----------|-------|
| Framework | Vitest ^4.1.2 [VERIFIED: `package.json`] |
| Config file | `vitest.config.ts` [VERIFIED] |
| Quick run command | `pnpm test` |
| Full suite command | `pnpm test` |

### Phase Requirements → Test Map

| Req ID | Behavior | Test Type | Automated Command | Phase 20 |
|--------|----------|-----------|-------------------|----------|
| CFR-09–13 | Logic documented | manual / grep | `rg '^## Logic Mapping' .docs/developer/refactors` | Doc gate |

### Wave 0 Gaps

- None for Phase 20 — **no new test files** required until Phase 22 changes `src/**`.

## Security Domain

| ASVS Category | Applies | Notes |
|---------------|---------|-------|
| V5 Input Validation | Indirect | Phase 20 does not alter Zod/API validation; mutation **envelope** parsing stays client-only. |
| V7 Error Handling | Low | Document that user-facing messages still flow through `useErrorDialog`; no new logging of tokens. |

No new STRIDE threats introduced by markdown-only work **[ASSUMED]**.

## Phase 20 → Phase 21 / 22 handoff

| Handoff | Owner phase | Deliverable |
|---------|-------------|-------------|
| **→ Phase 21** | Primitive / styling approval | Logic Mapping flags **primitive candidates** (e.g. `warehouse-overview-primitives`) per existing classification; Phase 21 approves extraction — Phase 20 **does not** decide visual primitives. |
| **→ Phase 22** | Code movement | Implement paths from movement tables: `types/api`, hook file, provider file, shared `extractMutationError`; **`actions` shape** migration with consumer checklist; preserve behavior. |
| **Risk carryover** | Phase 23+ | Delete/replace `create-warehouse-form` usage remains deferred per `_classification-summary.md`. |

## Sources

### Primary (HIGH confidence)

- `.docs/developer/refactors/components/_classification-summary.md` — matrix, split list, risk counts.  
- `.docs/developer/refactors/components/_refactor-map.md` — targets, deferred decisions.  
- `.docs/developer/refactors/hooks/_responsibility-summary.md` — hook clusters.  
- `.docs/developer/refactors/hooks/dashboard/warehouses/use-dashboard-warehouse.md` — consumers, dismount table.  
- `.cursor/rules/refactor-documentation-workflow.mdc` — Logic Mapping template.  
- `.cursor/rules/hooks-and-data-flow.mdc` — `actions`, `types/api`, transformers.  
- `src/components/dashboard/warehouses/use-dashboard-warehouse.tsx` — live logic inventory.  
- `src/components/dashboard/devices/use-dashboard-devices.tsx` — duplicate `extractMutationError`.  
- `package.json`, `vitest.config.ts` — tool versions.  
- Grep/read for `extractMutationError`, `## Logic Mapping`, mutation error patterns.

### Secondary (MEDIUM)

- `.cursor/rules/component-architecture.mdc` — feature page vs hook flow (aligns with hooks rule).

### Tertiary (LOW)

- Training-knowledge of typical CFR numbering — superseded when REQUIREMENTS.md is added.

## Metadata

**Confidence breakdown:**

- Standard stack: **HIGH** — pinned in `package.json`.  
- Architecture / split plan: **MEDIUM** — grounded in source + docs; CONTEXT.md missing.  
- Pitfalls: **MEDIUM** — standard refactor hazards + this repo’s provider breadth.

**Valid until:** ~30 days or first Phase 22 code merge (whichever is sooner).
