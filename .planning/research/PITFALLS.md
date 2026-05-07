# Domain Pitfalls

**Domain:** Brownfield frontend component folder restructuring
**Project:** Lemon WMS milestone v1.2 Component Folder Restructuring
**Researched:** 2026-05-07
**Overall confidence:** HIGH

## Research Basis

This research is based on the current project and refactor rules rather than generic frontend advice:

- `.planning/PROJECT.md`
- `.cursor/rules/component-refactor-core.mdc`
- `.cursor/rules/refactor-documentation-workflow.mdc`
- `.cursor/rules/styling-and-primitives.mdc`
- `.cursorrules`

The dominant constraint is that this is a brownfield restructuring milestone, not a redesign or feature phase. The workflow must preserve behavior and visual output while making component ownership, hooks, DTOs, transformers, primitives, and route composition easier to reason about across agent sessions.

## Critical Pitfalls

### Pitfall 1: One-Shot Analysis Becomes the Plan

**Risk:** An agent reads the component tree once, produces a broad classification, and treats that snapshot as complete enough to drive file moves.

**What goes wrong:** The codebase already has many components and generated refactor docs. A single pass is likely to miss declared child components, inline types, local hooks, data transformations, skeleton placement, repeated styling, API calls hidden in components, and component-specific risk notes.

**Warning signs:**

- A phase proposes moving many unrelated folders at once.
- Refactor docs contain generic labels but no dependency, logic, or risk detail.
- Decisions reference chat memory instead of current markdown and current file state.
- Classification is complete, but logic movement plans are missing.

**Prevention strategy:** Make inventory, classification, and logic mapping separate phases. Each phase should update the relevant markdown and preserve existing frontmatter, metadata, and useful notes. Roadmap phases should treat docs as the continuation point, not the chat transcript.

**Phase placement:** Phase 1 should be inventory only. Phase 2 should classify and assign targets. Phase 3 should map logic movement. No code movement should happen before these phases are complete for the selected vertical slice.

**Verification approach:**

- Compare each selected component file against its markdown document.
- Verify every declared component, hook, provider, and page-level view has an inventory entry before moves.
- Check that each move candidate has classification, target path, risk, and keep/move/split/delete decision recorded.

**Requirements implications:**

- Add a hard requirement that implementation phases cannot begin until the relevant docs have current inventory, classification, and logic mapping.
- Require phase completion criteria to include documentation completeness, not just passing builds.

### Pitfall 2: Code Moves Drift Away From Documentation

**Risk:** Components are moved, split, renamed, or deleted while `.docs/developer/refactors/` remains stale.

**What goes wrong:** The next agent inherits misleading old paths and old risk notes. This creates duplicated work, broken imports, incorrect deletions, and repeated re-analysis. In this milestone, stale docs are especially dangerous because the documentation is the source of truth between phases.

**Warning signs:**

- Imports point to new files but markdown still lists old paths only.
- `Refactor Status` sections are missing or still say `planned`.
- New split components exist without matching markdown files.
- A component was dismounted from a multi-component file without a `Dismounted Components` table.

**Prevention strategy:** Every code move must include the matching doc update in the same reviewable change. Moved or split files need old path, new path, related files, imports updated, risk, notes, and typecheck/lint status recorded.

**Phase placement:** Applies to every implementation phase. It should be an explicit exit gate for the first vertical slice and all later slices.

**Verification approach:**

- Search old paths from changed markdown and confirm they are either still valid or intentionally obsolete.
- Search new code paths and confirm matching markdown exists.
- Verify `Refactor Status` includes import and typecheck/lint status.
- For split files, verify both the original and new component documents link to each other when useful.

**Requirements implications:**

- Add "code and docs agree" as a non-negotiable acceptance criterion for every restructuring phase.
- Require agents to update docs from current file state, not regenerate docs wholesale.

### Pitfall 3: Restyling Sneaks Into Structural Work

**Risk:** While extracting primitives or moving components, agents "clean up" Tailwind classes, swap components, alter spacing, or modernize layouts.

**What goes wrong:** Reviewers cannot distinguish structural changes from visual changes. Existing dashboard and floor experiences may shift subtly. The milestone explicitly excludes UI redesign, and accidental restyling makes regression review much harder.

**Warning signs:**

- Diffs contain large `className` rewrites unrelated to extraction.
- shadcn/ui components are introduced into floor-side files.
- Primitive extraction changes color, spacing, radius, typography, or layout behavior.
- New CSS classes are created for one-off layouts.

**Prevention strategy:** Treat visual output as an invariant. Extract repeated styling only when the same pattern appears in multiple places and has the same structural purpose. Keep one-off layout tweaks local. Dashboard components may compose shadcn/ui; floor components must keep the custom minimal floor design system.

**Phase placement:** Primitive planning should happen before primitive creation. Primitive creation should be a separate phase from feature component moves unless the primitive is tiny and already mapped.

**Verification approach:**

- Review diffs for visual class changes separate from import/path changes.
- Manually inspect moved dashboard warehouse/location/stock pages before and after the vertical slice.
- Confirm primitives do not import feature hooks, API types, domain business rules, or mutation behavior.
- Confirm floor files do not adopt shadcn/ui components.

**Requirements implications:**

- Include "no visual design changes" in acceptance criteria for each structural phase.
- Require screenshots or manual route checks for user-facing pages touched by primitive extraction.

### Pitfall 4: Moving Too Much at Once Breaks Imports and Reviewability

**Risk:** A large folder rewrite changes many imports across dashboard, warehouse, hooks, primitives, and docs in one patch.

**What goes wrong:** Import breakage becomes noisy and hard to isolate. Reviewers cannot tell whether behavior changed. The first vertical slice loses its value as a proving ground for the target structure.

**Warning signs:**

- A phase touches many unrelated domains or surfaces.
- Deletions happen before all usages are verified.
- Barrel files are added broadly to hide import churn.
- Build failures list many unrelated missing modules.

**Prevention strategy:** Use small vertical slices with one dominant refactor type at a time: one component split, one hook extraction, one primitive extraction, one route thinning, or one transformer extraction. Fix imports immediately after each move and verify usages before deleting old files.

**Phase placement:** The first implementation phase should focus on dashboard warehouse/location/stock surfaces only, because the project identifies them as the proving slice. Later phases should repeat the same slice pattern by domain or surface.

**Verification approach:**

- Search for every old import path before deleting files.
- Run TypeScript/build checks after each reviewable slice when available.
- Use route-level manual checks for pages touched by the slice.
- Confirm no unrelated business logic or API files changed.

**Requirements implications:**

- Add slice boundaries to the roadmap instead of broad "restructure components" phases.
- Require each phase to list the exact component cluster and old/new paths it owns.

### Pitfall 5: Components, Hooks, DTOs, and Transformers Stay Entangled

**Risk:** Files are moved into better folders without actually separating responsibilities.

**What goes wrong:** Components remain responsible for API calls, mutation semantics, DTO shaping, reusable transformation logic, inline types, and rendering. Folder names improve, but the system remains hard for future agents to modify safely.

**Warning signs:**

- Components still import Axios clients directly.
- Hooks do not expose `isLoading`, `error`, and `refetch`.
- Mutation helpers throw to components instead of returning `{ success: boolean; error?: string }`.
- API response types remain inside component files.
- Reusable mapping logic is duplicated in render code instead of moved to transformers.

**Prevention strategy:** Logic mapping must happen before code movement. Each component document should identify render logic, UI state, fetching, mutation logic, transformation logic, validation, error handling, reusable utilities, and inline types. Components should become render-focused; hooks should own API interaction and state; transformers should own repeated DTO mapping.

**Phase placement:** Logic mapping should be its own phase after classification and before implementation. Hook extraction and transformer extraction should be separate implementation tasks inside each vertical slice.

**Verification approach:**

- Inspect moved components for direct Axios usage.
- Verify hooks expose `isLoading`, `error`, and `refetch`.
- Verify components render loading, error, and data states explicitly.
- Confirm API response types live at the appropriate boundary, not inside component files.

**Requirements implications:**

- Add a requirement for logic movement tables before implementation.
- Require each implementation phase to state whether it moves render, hook, DTO, transformer, utility, or primitive responsibility.

### Pitfall 6: Primitives Become Domain-Aware Mega Components

**Risk:** Agents centralize repeated UI into primitives that know too much about warehouses, stock, orders, API response shapes, or mutations.

**What goes wrong:** A primitive becomes a giant configurable component that hides business logic and couples unrelated surfaces. Future changes become harder because domain behavior is abstracted behind generic props instead of visible at the feature/page level.

**Warning signs:**

- Primitive props mirror API response DTOs.
- Primitives import feature hooks or domain utilities.
- A primitive contains status transition logic, permission logic, or mutation calls.
- A primitive grows a large config object to support unrelated layouts.

**Prevention strategy:** Extract primitives only for repeated structural UI patterns: KPI card layout, dashboard section wrapper, modal shell, details table, chart panel, reusable empty/loading/error state, or filter toolbar. Keep domain decisions in feature components and coupling visible at the page level.

**Phase placement:** Primitive candidates should be identified during classification and validated during logic mapping. Primitive implementation should come before or alongside the first vertical slice only when the pattern is already proven repeated.

**Verification approach:**

- Check primitive imports for feature hooks, API clients, API response types, and domain services.
- Review primitive props for generic UI inputs rather than domain DTOs.
- Confirm feature components still own business-specific rendering and actions.

**Requirements implications:**

- Add primitive acceptance rules: no data fetching, no mutations, no feature hooks, no API response shapes, no business rules.
- Require a repeated-pattern citation before creating a primitive.

### Pitfall 7: Route Composition Becomes Too Thin or Too Thick in the Wrong Place

**Risk:** Page and route files are changed without a clear composition boundary.

**What goes wrong:** A route may keep too much component logic, or the page component may hide cross-feature coupling that should remain visible. Conversely, agents may over-extract route-specific composition into generic primitives.

**Warning signs:**

- Route files contain data fetching or transformation logic that belongs in hooks.
- Page components become giant wrappers with hidden business decisions.
- Generic primitives include route-specific conditionals.
- The final structure does not show route -> hook -> page -> feature -> primitive layering.

**Prevention strategy:** Define route composition responsibilities explicitly in the target folder map. Route files should stay thin; page-level components should make coupling visible; feature components should own domain rendering; hooks should own client API state; primitives should own reusable layout only.

**Phase placement:** Architecture/folder mapping should precede implementation. The first dashboard warehouse/location/stock slice should prove this route-to-primitive layering before broader migration.

**Verification approach:**

- Inspect touched routes for thin composition only.
- Confirm hooks sit next to the component that uses them unless used by multiple separate locations.
- Confirm no `lib/` server-only code is imported into client components.

**Requirements implications:**

- Require each phase to identify the target layer for every new or moved file.
- Add explicit client/server boundary checks to verification.

### Pitfall 8: Domain Boundaries Blur During Shared Folder Creation

**Risk:** Components or utilities are moved into shared folders because they "look reusable" even though they belong to one domain.

**What goes wrong:** Domain-specific warehouse, stock, orders, or locations behavior becomes globally visible and harder to reason about. Later phases may reuse the wrong abstraction and accidentally couple surfaces.

**Warning signs:**

- Shared folders contain names tied to a specific domain concept.
- Types used by only one component cluster are promoted to `src/types/`.
- Hooks are promoted even though only one component location uses them.
- A file cannot be assigned to one of the project domains without hesitation.

**Prevention strategy:** Use domain-based folders by default. Promote hooks, types, utilities, or primitives only when usage is proven across two or more separate component locations and the extracted unit is not domain-aware. If ownership is unclear, ask before creating or moving the file.

**Phase placement:** Classification must assign current and target ownership before code movement. Shared-folder creation should be delayed until repeated usage is documented.

**Verification approach:**

- Check each moved file has one clear domain or is a true primitive/system-level file.
- Search usage count before promoting hooks or types.
- Confirm `src/types/` only contains boundary-crossing types.

**Requirements implications:**

- Add target ownership as a required classification field.
- Require evidence of reuse before promoting files to shared locations.

## Moderate Pitfalls

### Pitfall 9: Generated Refactor Docs Are Replaced Instead of Evolved

**Risk:** Agents regenerate component markdown from scratch and erase useful metadata, risk notes, or prior decisions.

**Warning signs:**

- Frontmatter disappears.
- Existing notes are removed instead of updated.
- New docs are syntactically consistent but less specific than before.

**Prevention strategy:** Update existing markdown in place. Preserve frontmatter, metadata, and useful content. Append classification, logic mapping, and status sections when missing instead of replacing the document wholesale.

**Phase placement:** All documentation phases and every code movement phase.

**Verification approach:** Diff docs for accidental deletion of metadata and prior notes.

**Requirements implications:** Require "preserve existing refactor documentation metadata" in documentation acceptance criteria.

### Pitfall 10: Skeleton Placement Gets Flattened

**Risk:** All loading skeletons are moved into primitives or all are kept feature-local without checking reuse.

**Warning signs:**

- Component-specific skeletons appear in global primitive folders.
- Generic loading states are repeatedly reimplemented in feature folders.

**Prevention strategy:** Keep feature-specific skeletons near the component they represent. Move only generic, project-wide reusable loading patterns into primitives.

**Phase placement:** Primitive planning and feature component split phases.

**Verification approach:** For each skeleton move, record whether it is feature-specific or generic and why.

**Requirements implications:** Add skeleton ownership to classification for components with loading states.

### Pitfall 11: Verification Relies Only on Lint or Only on Manual Checks

**Risk:** The phase passes one kind of verification but misses another class of regression.

**Warning signs:**

- Typecheck passes but docs still point to old paths.
- Manual page checks pass but unused old components remain.
- Lint passes but hook error/loading contracts regressed.

**Prevention strategy:** Use layered verification: import search, typecheck/build, lint when available, doc/code agreement checks, and manual checks for touched dashboard/warehouse routes.

**Phase placement:** Every implementation phase.

**Verification approach:** Record typecheck/lint status in `Refactor Status`; record manual route checks in phase verification notes.

**Requirements implications:** Add a verification matrix to each phase plan rather than a single "run build" item.

### Pitfall 12: Deferred Scopes Are Accidentally Pulled In

**Risk:** Agents restructure adjacent systems while moving components, especially GenericTable V2, factbox display-field utilities, or orders features.

**Warning signs:**

- Factbox utilities are repointed despite being explicitly deferred.
- GenericTable V2 work resumes inside a component restructuring phase.
- Orders business behavior changes while moving dashboard components.

**Prevention strategy:** Keep milestone v1.2 focused on component ownership. Do not change API contracts, DTO meanings, validation rules, mutation semantics, business rules, or deferred systems unless explicitly scoped later.

**Phase placement:** Scope review at the start of every phase.

**Verification approach:** Review changed files for out-of-scope domains and behavior changes.

**Requirements implications:** Add explicit non-goal checks to phase plans and verification.

## Minor Pitfalls

### Pitfall 13: Naming Conventions Drift During Moves

**Risk:** File and symbol names become inconsistent while components are split.

**Prevention:** Keep files kebab-case, components PascalCase, hooks camelCase with `use`, and type/interface names PascalCase.

**Phase placement:** All implementation phases.

**Verification:** Review new file names and exported symbols during import-fix passes.

### Pitfall 14: Barrel Files Hide Coupling Too Early

**Risk:** Index barrels are added to reduce import churn before ownership stabilizes.

**Prevention:** Avoid barrel files unless import ergonomics clearly improve after the structure settles.

**Phase placement:** Later cleanup phase only, not the first vertical slice.

**Verification:** Reject new barrels that exist only to mask many unstable imports.

## Phase-Specific Warnings

| Phase Topic | Likely Pitfall | Prevention Strategy | Verification |
|---|---|---|---|
| Inventory | One-shot analysis misses nested declarations and logic | Inventory components, hooks, providers, page views, dependencies, props, state, API calls, mutations, repeated styling, repeated logic | Sample docs against current files; ensure each selected file has a complete document |
| Classification | Everything becomes primitive or shared | Assign one classification, target folder, target file name, keep/move/split/delete decision, risk level, and reuse evidence | Check target ownership and reuse evidence before approving shared locations |
| Logic mapping | Folder moves without responsibility separation | Map render logic, UI state, fetching, mutations, transformations, validation, error handling, utilities, and inline types | Confirm each logic item has a current location, target location, reason, and risk |
| Primitive planning | Restyling and domain-aware primitives | Only extract repeated structural UI patterns; keep domain behavior in features | Check primitive imports and props for API/domain knowledge |
| First vertical slice | Too many surfaces move at once | Limit to dashboard warehouse/location/stock surfaces and one reviewable refactor type at a time | Search old imports, run typecheck/build/lint when available, manually check touched routes |
| Documentation sync | Docs become stale after code moves | Update matching docs in same change with old path, new path, status, related files, import status, and typecheck/lint status | Diff code paths against docs; verify moved/split files have matching docs |
| Later slices | Early pattern is copied blindly | Re-read current docs and file state before each phase; do not rely on chat memory | Require each phase to restate current source files and target files from disk |

## Recommended Phase Placement

1. **Inventory Baseline**
   - Create or complete documents for the selected component/hook set.
   - Do not move code.
   - Requirements implication: phase is complete only when docs cover every declared component, hook, provider, and page-level view in scope.

2. **Classification and Target Ownership**
   - Assign classifications, target folders, target file names, split decisions, and risk.
   - Do not move code.
   - Requirements implication: each target must have one clear domain/layer or be justified as a primitive/system-level file.

3. **Logic Mapping**
   - Map component-held logic to hooks, DTO types, API types, transformers, utilities, and primitives.
   - Do not move code unless the phase explicitly scopes a tiny preparatory extraction.
   - Requirements implication: implementation cannot start for a file until its logic movement table exists.

4. **Primitive Candidate Validation**
   - Confirm repeated UI patterns and decide which primitives, if any, are worth creating.
   - Requirements implication: primitives require reuse evidence and must not be domain-aware.

5. **First Safe Vertical Slice**
   - Move dashboard warehouse/location/stock route -> hook -> page -> feature -> primitive layering in small steps.
   - Requirements implication: code and docs must move together; behavior and visual output must remain unchanged.

6. **Verification and Pattern Lock-In**
   - Validate imports, docs, typecheck/build/lint status, and manual route behavior.
   - Requirements implication: later slices should reuse only patterns proven by this phase, not assumptions from planning.

## Verification Checklist for Every Implementation Phase

- Relevant refactor markdown was read before code edits.
- Existing frontmatter, metadata, and useful notes were preserved.
- Old path, new path, status, related files, imports updated, risks, and typecheck/lint status are recorded.
- Every moved/split component has matching documentation.
- Old import paths have been searched before deleting old files.
- Components do not call Axios directly.
- Hooks expose `isLoading`, `error`, and `refetch` where they own data fetching.
- Components render loading, error, and data states explicitly.
- Primitives do not fetch, mutate, import feature hooks, know API response shapes, or encode domain business rules.
- Visual output is intentionally preserved; any visual change is flagged as out of scope unless explicitly requested.
- Dashboard files use shadcn/ui appropriately; floor files do not adopt shadcn/ui.
- No API routes, API contracts, DTO meanings, validation rules, mutation semantics, or business rules changed.
- Deferred scopes such as GenericTable V2 and factbox display-field migration remain untouched unless explicitly scoped.

## Requirements Implications

- The roadmap should make documentation phases first-class, not supporting chores.
- Each implementation phase should include a code/docs agreement gate.
- Each phase should have a small named vertical slice and explicit non-goals.
- Classification must include target ownership, split/delete decision, and risk.
- Logic mapping must precede file moves for complex components.
- Primitive extraction must require repeated-pattern evidence.
- Verification must combine static checks, import searches, documentation checks, and manual route checks.
- Agents must use current docs and current files as the continuation point, not chat memory.

## Source Confidence

| Source | Confidence | Notes |
|---|---|---|
| `.planning/PROJECT.md` | HIGH | Defines milestone goal, target features, non-goals, constraints, and current decisions. |
| `.cursor/rules/component-refactor-core.mdc` | HIGH | Defines refactor discipline, behavior preservation, and reviewability constraints. |
| `.cursor/rules/refactor-documentation-workflow.mdc` | HIGH | Defines documentation source-of-truth behavior and phase completion rules. |
| `.cursor/rules/styling-and-primitives.mdc` | HIGH | Defines styling preservation, primitive extraction, and skeleton placement rules. |
| `.cursorrules` | HIGH | Defines project-wide component, data-fetching, domain, layer, TypeScript, auth, and Axios constraints. |

