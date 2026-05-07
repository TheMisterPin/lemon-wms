# Project Research Summary

**Project:** Lemon WMS  
**Domain:** Brownfield frontend component folder restructuring  
**Milestone:** v1.2 Component Folder Restructuring  
**Researched:** 2026-05-07  
**Confidence:** HIGH

## Executive Summary

Lemon WMS v1.2 is not a product-feature milestone; it is a brownfield frontend architecture restructuring milestone. The research consistently recommends preserving the current user-facing dashboard and warehouse behavior while making ownership explicit across routes, hooks, feature pages, feature components, primitives, DTOs, transformers, and shadcn/ui base components.

The recommended approach is documentation-first and slice-based. Before moving code, the team should complete inventory, classification, and logic mapping in `.docs/developer/refactors/`, preserving existing metadata and making target ownership visible. The first implementation slice should focus on dashboard locations/warehouses/stock surfaces because they expose the central responsibility problem through `src/components/dashboard/warehouses/use-dashboard-warehouse.tsx` without requiring API, schema, validation, or design changes.

The main risk is cosmetic or behavioral drift disguised as cleanup. Mitigate it by treating visual output, API contracts, DTO meanings, validation rules, mutation semantics, and business rules as invariants; by requiring code and docs to move together; and by verifying each small slice with import searches, lint/typecheck/build where appropriate, and manual route checks for affected pages.

## Stack Additions

No stack additions are recommended for v1.2.

The existing stack is sufficient: Next.js 16 App Router, React 19, TypeScript 5, Tailwind 4, shadcn/ui, Axios, Zustand, Zod, react-hook-form, ESLint, Vitest, and Testing Library already support the target architecture. The milestone should spend effort on folder ownership, typed boundaries, import repair, and documentation status instead of package evaluation.

**Explicit stack posture:**

- Keep Next.js App Router as the route composition layer.
- Keep custom hooks with Axios for server-state access; do not introduce React Query, SWR, Apollo, Relay, or another data-fetching framework.
- Keep Zustand limited to existing auth/session use; do not add new global feature state for restructuring.
- Keep Tailwind 4 and current CSS variables as the visual-preservation layer.
- Keep `src/components/ui` reserved for shadcn/ui base components.
- Use TypeScript as the primary safety net through named props, hook result types, API payload types, DTO types, and transformer return types.
- Use existing verification tooling: ESLint, TypeScript/build, Vitest, Testing Library, targeted route smoke checks.

## Feature Table Stakes

The milestone succeeds only if it creates reliable refactor state before broad code movement.

**Must have:**

- Complete component, hook, provider, and page-level inventory for the selected scope before implementation starts.
- File classification into shadcn/base, primitive, feature component, feature page, route file, hook, utility, type-only, or delete/replace.
- Target path, target file name, keep/move/split/delete decision, risk, and ownership recorded for every move candidate.
- Logic mapping for render logic, UI state, fetching, mutations, transformations, validation, error handling, reusable utilities, and inline types.
- Hook responsibility decisions that keep API interaction, loading, error, refetch, mutations, and DTO preparation out of render components.
- Primitive candidate validation based on repeated, domain-neutral UI patterns.
- A first dashboard locations/warehouses/stock vertical slice proving route -> hook -> feature page -> feature component -> primitive -> shadcn/ui layering.
- Refactor status updates after every move so markdown and code paths agree.

**Should have:**

- Documentation-as-contract gates: no code move before the relevant doc plan; no completion before doc status is updated.
- Risk-ranked refactor queue so low-risk splits and type/transformer extraction happen before provider removal.
- Page-level coupling visibility through explicit hook output and callback props.
- Primitive admission criteria that require reuse evidence and prohibit domain business logic.
- Dismounted child-component tracking when multi-component files are split.

**Defer:**

- Whole-app component migration.
- GenericTable V2 continuation.
- Factbox/display-field migration.
- Design refresh or visual modernization.
- Storybook, visual regression tooling, or new component workbench setup.

## Architecture Recommendations

Adopt the target dependency direction as the organizing rule:

```txt
app route
-> hook
-> feature page component
-> feature component
-> primitive
-> shadcn/ui
```

**Route layer:** keep route files as framework composition only. They should read params/search params when needed, call the page hook, render the feature page component, and pass hook output explicitly.

**Hook layer:** create `src/hooks/[surface]/[domain]/` and move page/data hooks there when they are used across route/page boundaries. Hooks own Axios calls, loading/error/refetch state, mutation lifecycle, and page-ready DTO preparation. Hooks should not declare raw API types, contain JSX, or hide provider contracts.

**Feature page layer:** place page-level render components under `src/components/features/[domain]/pages/`. These components assemble feature components and render loading, error, empty, and data states from hook output.

**Feature component layer:** place domain-specific components under `src/components/features/[domain]/components/`. These components may know domain language and receive DTOs/callbacks, but must not fetch, mutate, import API clients, define API payload types, or import feature hooks.

**Primitive layer:** create `src/components/primitives/` only for reusable Lemon WMS UI structures such as dashboard page shells, sections, KPI cards, action toolbars, empty/loading/error states, and form/modal shells. Primitives must remain domain-agnostic and should wrap shadcn/ui or project styling without business rules.

**Type and transformer boundaries:** move raw transport shapes to `src/types/api/[domain]/`, UI-ready DTOs to `src/types/dto/[domain]/`, and non-trivial reusable mapping into `src/lib/transformers/[domain]/`.

**Provider migration:** treat `DashboardWarehouseProvider` as temporary compatibility scaffolding. Extract types and transformers first, move the hook next, migrate consumers to route/page props, and remove the provider only after usage searches prove no remaining consumers need it.

## Watch-Outs

The strongest watch-out is stale documentation. If code moves without matching `.docs/developer/refactors/` updates, later phases will inherit false paths, wrong risk notes, and duplicated analysis.

Other critical watch-outs:

- One-shot analysis is not enough; inventory, classification, and logic mapping need separate passes.
- Moving folders without separating responsibilities leaves the architecture tangled under nicer paths.
- Restyling during structural work makes review noisy and violates the milestone.
- Moving too many unrelated surfaces at once breaks import reviewability.
- Creating primitives too early can produce domain-aware mega components.
- Promoting hooks, types, or utilities without reuse evidence blurs domain boundaries.
- Removing providers or compatibility files before usage searches risks runtime breakage.
- Verification cannot rely on lint alone; use import searches, static checks, doc/code agreement checks, and manual route checks.

## Explicit Anti-Features

Do not build or scope these into v1.2 unless the developer explicitly changes the milestone:

- UI redesign, visual modernization, or Tailwind class cleanup unrelated to structural extraction.
- API route changes, API response contract changes, validation changes, DTO meaning changes, mutation semantic changes, or business-rule changes.
- New data-fetching, state-management, styling, component-library, codegen, or import-rewrite tooling.
- Full app-wide migration in one pass.
- Domain-aware primitives or generic mega-primitives.
- Broad barrel-file cleanup campaign.
- Deleting old components without verified import/usage checks.
- Repointing factbox/display-field utilities.
- Resuming GenericTable V2 work inside component restructuring.
- Mixing dashboard shadcn/ui patterns into floor-side touch-optimized components.
- Prisma schema, migration, or database changes.

## Implications for Requirements and Roadmap

The roadmap should treat documentation and architecture proof as first-class deliverables, not preparation chores. The recommended phase structure is:

### Phase 1: Inventory Baseline

**Rationale:** Current docs are broad but uneven; implementation needs reliable continuation state.  
**Delivers:** Complete inventory for selected components, hooks, providers, and page-level views.  
**Addresses:** Complete refactor inventory; documentation verification.  
**Avoids:** One-shot analysis becoming the plan.

### Phase 2: Classification and Target Ownership

**Rationale:** Files need clear domain, layer, target path, split/delete decision, and risk before movement.  
**Delivers:** Classification matrix and target folder responsibility map.  
**Addresses:** File classification matrix; target folder responsibility map.  
**Avoids:** Domain boundary blur and premature shared-folder promotion.

### Phase 3: Logic Mapping

**Rationale:** The central problem is mixed responsibility, especially in `use-dashboard-warehouse.tsx`.  
**Delivers:** Logic movement tables for render, hook, DTO, API type, transformer, utility, and primitive responsibilities.  
**Addresses:** Logic mapping; hook decisions; transformer/type extraction decisions.  
**Avoids:** Folder moves that leave components, hooks, DTOs, and transformers entangled.

### Phase 4: Architecture and Primitive Plan

**Rationale:** Folder creation and primitive extraction should follow explicit rules and reuse evidence.  
**Delivers:** Target folders, primitive admission criteria, candidate list, and skeleton ownership decisions.  
**Addresses:** Primitive candidate list; architecture recommendation; shared styling posture.  
**Avoids:** Domain-aware primitives, restyling, and skeleton placement mistakes.

### Phase 5: First Dashboard Locations Slice

**Rationale:** Dashboard locations/warehouses/bins/zones validate the target layering on real code while keeping the blast radius reviewable.  
**Delivers:** Hook/type/DTO/transformer extraction, moved feature pages/components, route-level hook composition, and provider compatibility cleanup as usage allows.  
**Addresses:** First vertical slice; route composition; hook ownership; page/feature boundaries.  
**Avoids:** Whole-app migration, provider coupling, and broad import churn.

### Phase 6: Verification and Pattern Lock-In

**Rationale:** Later slices should reuse proven patterns, not assumptions from planning.  
**Delivers:** Import search results, lint/typecheck/build status where applicable, manual route checks, doc/code agreement, and carry-forward risks.  
**Addresses:** Refactor status tracking and behavior preservation checks.  
**Avoids:** Stale docs, hidden behavior drift, and blind repetition in later phases.

### Candidate Requirement IDs

| Requirement | Description |
|---|---|
| CFR-01 | Complete inventory/classification docs before each code move. |
| CFR-02 | Create target folders and document ownership rules. |
| CFR-03 | Move raw API payload types out of components/hooks into `src/types/api`. |
| CFR-04 | Move UI DTO types into `src/types/dto`. |
| CFR-05 | Move reusable/non-trivial transformations into `src/lib/transformers`. |
| CFR-06 | Move hooks into `src/hooks/[surface]/[domain]` and expose page-ready results. |
| CFR-07 | Move the first locations slice pages/components into `components/features/locations`. |
| CFR-08 | Remove dashboard warehouse provider only after all consumers are migrated. |
| CFR-09 | Preserve behavior, visual output, API contracts, validation, and mutation semantics. |
| CFR-10 | Verify code and docs agree before phase completion. |

### Research Flags

**Needs deeper phase research or live source review:**

- Phase 1: exact documentation completeness and missing docs must be verified from disk.
- Phase 3: `use-dashboard-warehouse.tsx` and its consumers need current-source analysis before splitting.
- Phase 5: first-slice boundaries need confirmed imports/usages for bins, zones, warehouse forms, layout/provider, and overview pages.

**Standard patterns are sufficiently documented:**

- Phase 2: classification and target ownership can follow existing project rules.
- Phase 4: primitive rules are well defined; only candidate evidence needs validation.
- Phase 6: verification gates can use established lint/typecheck/build, import search, manual route checks, and doc status updates.

## Confidence Assessment

| Area | Confidence | Notes |
|---|---|---|
| Stack | HIGH | Existing project stack and rules clearly support the milestone without new dependencies. |
| Features | HIGH | Milestone goals, table stakes, anti-features, and documentation-first workflow are consistent across research files and `.planning/PROJECT.md`. |
| Architecture | HIGH | Target layering and folder responsibilities are explicit; final import ergonomics should be validated by the first slice. |
| Pitfalls | HIGH | Pitfalls are grounded in the local refactor rules and current v1.2 constraints, not generic advice. |
| Existing doc completeness | MEDIUM | Research indicates some docs may be metadata-only or missing; Phase 1 must verify this before implementation. |

**Overall confidence:** HIGH

### Gaps to Address

- Existing refactor docs may be incomplete or uneven; verify and update them before using them as implementation plans.
- Exact first-slice file boundaries need current import and usage checks.
- Primitive candidates should not be finalized until repeated styling evidence is documented.
- Hook promotion and shared type placement require usage searches across separate component locations.
- v1.1 GenericTable V2 remains paused; roadmap and requirements should avoid accidentally pulling it into v1.2.

## Sources

### Primary

- `.planning/PROJECT.md` — active milestone goal, target features, non-goals, constraints, and key decisions.
- `.planning/research/STACK.md` — no-additions stack posture and verification tooling.
- `.planning/research/FEATURES.md` — table stakes, differentiators, anti-features, dependencies, and suggested phase grouping.
- `.planning/research/ARCHITECTURE.md` — target layering, folder additions, provider migration, first-slice recommendation, and candidate requirements.
- `.planning/research/PITFALLS.md` — critical/moderate/minor pitfalls and phase-specific warnings.

### Supporting

- `.cursor/rules/component-architecture.mdc` — component layering and folder ownership.
- `.cursor/rules/component-refactor-core.mdc` — behavior preservation and reviewability.
- `.cursor/rules/refactor-documentation-workflow.mdc` — documentation as source of truth and phase completion gate.
- `.cursor/rules/hooks-and-data-flow.mdc` — hook and data-flow requirements.
- `.cursor/rules/styling-and-primitives.mdc` — styling preservation, primitive extraction, and skeleton placement rules.
- `.cursorrules` — project-wide domain, layer, TypeScript, auth, Axios, and component constraints.

---

*Research completed: 2026-05-07*  
*Ready for roadmap: yes*
