# Feature Landscape

**Domain:** Brownfield frontend component restructuring for Lemon WMS
**Milestone:** v1.2 Component Folder Restructuring
**Researched:** 2026-05-07
**Overall confidence:** HIGH for milestone intent and rules; MEDIUM for exact existing documentation completeness because sampled refactor docs are broad but uneven.

## Executive Feature Summary

This milestone should deliver a documentation-first refactor system, not a broad UI rewrite. The core capability is to make frontend ownership predictable: routes compose hooks, hooks own data interaction, page components assemble screens, feature components own domain rendering, primitives own reusable project styling, and `components/ui` stays reserved for shadcn/ui base components.

The milestone should treat refactor documentation as a first-class product surface. A code move is not done unless the matching `.docs/developer/refactors/` document records the current path, target path, classification, logic movement, risk, status, and verification state.

The first implementation slice should be deliberately narrow: dashboard warehouse/location/stock surfaces. That slice is valuable because it exercises route, hook, page, feature component, primitive, DTO/type, transformer, and skeleton placement without requiring API or business-rule changes.

## Feature Categories

| Category | Capability | Outcome | Complexity |
|---|---|---|---|
| Inventory and metadata | Complete component, hook, provider, and page inventory | Agents and developers can see what exists before moving it | Medium |
| Classification | Assign each file to shadcn/base, primitive, feature component, feature page, route file, hook, utility, type-only, or delete/replace | Target architecture becomes explicit before code moves | Medium |
| Logic mapping | Identify render logic, UI state, fetching, mutations, transformations, validation, reusable utilities, and inline types | Refactor plans separate logic safely instead of moving code blindly | High |
| Hook decisions | Decide which logic stays in local hooks, moves to shared hooks, or becomes transformers/utilities | Hooks become the data/state boundary without over-promoting shared abstractions | High |
| Primitive extraction | Plan only repeated, domain-neutral UI building blocks | Reuse improves without hiding business logic in generic components | Medium |
| Feature/page restructuring | Plan target pages and domain feature components | Routes become thin and page composition becomes visible | High |
| First vertical slice | Move warehouse/location/stock dashboard slice through the target layering | Validates the architecture with a reviewable code change | High |
| Documentation verification | Keep docs and code state synchronized after each move | Future phases inherit reliable state instead of stale plans | Medium |

## Table Stakes

Features users and maintainers should expect. Missing means the milestone does not achieve its purpose.

| Feature | Why Expected | Complexity | Dependencies on Existing Docs | Requirements Implications |
|---|---|---|---|---|
| Complete refactor inventory | The milestone explicitly requires every declared component, hook, provider, and page-level view to be documented before code moves | Medium | Existing `.docs/developer/refactors/components` and `.docs/developer/refactors/hooks` folders; many current docs appear to be stubs or metadata-only | Add an acceptance criterion that inventory coverage is checked before implementation phases start |
| File classification matrix | Refactor rules require deciding whether each file is shadcn/base, primitive, feature component, feature page, route file, hook, utility, type-only, or delete/replace | Medium | `component-architecture.mdc` and `refactor-documentation-workflow.mdc` classification template | Each classified file must record target folder, target file name, keep/move/split/delete decision, and risk |
| Logic mapping per relevant component | Safe refactoring depends on knowing where fetching, mutations, transformations, validation, inline types, and reusable utilities currently live | High | Logic Mapping template in `refactor-documentation-workflow.mdc`; current warehouse hook example in `src/components/dashboard/warehouses/use-dashboard-warehouse.tsx` is called out by project context | Require logic movement plans before splitting complex files, especially warehouse/location/stock screens |
| Hook responsibility decisions | Hooks must own API interaction, loading, error, refetch, mutations, and DTO transformation decisions where appropriate | High | Hook documentation template and data-fetching rules from project conventions | For each moved hook, require inputs, returned DTO, actions, dependencies, and refactor notes |
| Target folder responsibility map | The milestone goal is predictable placement for `components/ui`, `components/primitives`, `components/features`, `hooks`, `types`, `lib/transformers`, and shared styling | Medium | `component-architecture.mdc` defines the target dependency direction and folder rules | Roadmap should include a phase that publishes or updates the final placement rules before code movement |
| Primitive candidate list | Reusable styling and UI patterns should be extracted only when repeated and domain-neutral | Medium | Existing component docs should record repeated styling and repeated logic | Require primitive candidates to show reuse evidence; do not create primitives speculatively |
| Feature page plan | Page-level render components should live under `components/features/[domain]/pages` and receive hook output as props | High | Component architecture rule for feature pages | Require each page plan to state route owner, hook owner, page component, child feature components, and skeleton/error/loading handling |
| First warehouse/location/stock vertical slice | Project context explicitly names this as the first safe implementation slice | High | Existing warehouse/location/stock refactor docs and current source files | Define acceptance around unchanged UI, unchanged API contracts, fixed imports, docs updated, and lint/typecheck status recorded |
| Behavior preservation checks | Structural refactors must not alter visual design, API contracts, DTO meanings, validation, business rules, or mutation semantics | Medium | `component-refactor-core.mdc` behavior preservation rule | Every implementation phase should include before/after manual route checks for affected pages |
| Refactor status tracking | The documentation workflow requires old path, new path, related files, import updates, typecheck status, and notes after moves | Low | Refactor Status template | No phase should be marked complete if docs and code disagree |

## Differentiators

Features that are not generic refactor chores, but would make this milestone unusually effective for a brownfield agent-driven codebase.

| Feature | Value Proposition | Complexity | Dependencies on Existing Docs | Requirements Implications |
|---|---|---|---|---|
| Documentation-as-contract gates | Makes markdown artifacts operational requirements, not optional notes | Medium | `.docs/developer/refactors/` and workflow rule | Add explicit quality gates: no code move before doc plan; no completion before doc status update |
| Risk-ranked refactor queue | Lets the team sequence low-risk splits before complex hook/provider extraction | Medium | Classification risk fields | Roadmap phases should order files by dependency and risk, not only by folder location |
| Slice-level architecture proof | The warehouse/location/stock slice validates the target architecture on real screens before broader migration | High | Warehouse, location, stock docs and source files | Treat the first slice as an architecture validation phase with findings feeding later slices |
| Coupling visibility at page level | Making hook output and page composition explicit reduces hidden dependencies for future agents | High | Component architecture rule: route -> hook -> feature page -> feature components -> primitives -> shadcn/ui | Require page plans to list child components and callbacks rather than burying workflows in nested components |
| Primitive admission criteria | Prevents `components/primitives` from becoming a junk drawer or business-logic hiding place | Medium | Repeated styling/repeated logic fields in docs | Require every primitive to cite at least two cross-domain or cross-page uses, unless explicitly approved |
| Dismounted child-component ledger | Tracks components extracted from files that currently declare multiple child components inline | Medium | Dismounting rule in documentation workflow | Require source docs to link to new docs for every extracted child component |
| Transformer/type extraction decisions | Separates API response shapes, DTOs, and view transformations from render components | High | Logic mapping template and project goal for DTOs/transformers | Roadmap should include a focused transformer/type plan before moving complex data-heavy screens |

## Anti-Features

Features to explicitly not build in this milestone.

| Anti-Feature | Why Avoid | What to Do Instead |
|---|---|---|
| UI redesign or visual modernization | It makes review noisy and violates the milestone's preservation goal | Preserve visual output; record any design issues as future work |
| API route or API contract changes | This is a frontend ownership refactor, not a data/API milestone | Keep current API surfaces intact and move only client-side responsibilities |
| New state management or data-fetching framework | Project rules explicitly keep custom hooks with Axios and Zustand auth | Continue with existing hooks and typed Axios clients |
| Whole-app migration in one pass | Too risky for a brownfield app with many component docs and surfaces | Use small vertical slices, starting with warehouse/location/stock |
| Moving files before docs are updated | Creates stale context and breaks the documentation-driven workflow | Update inventory, classification, and logic mapping first |
| Generic mega-primitives | Hides domain rules and makes future changes harder | Extract small primitives only for repeated, domain-neutral UI patterns |
| Domain-aware primitives | Violates primitive boundaries and recreates feature components under a generic name | Keep domain language in `components/features/[domain]` |
| Repointing factbox/display-field utilities | Project context says factbox refactor is deferred | Leave factbox on existing display-field types unless a later phase scopes it |
| Barrel-file cleanup campaign | Import ergonomics alone does not justify broad churn | Add barrels only where a local import cluster clearly benefits |
| Deleting components without verified usage checks | Brownfield components may be reachable through route composition or dynamic imports | Verify imports/usages, then record delete/replace status in docs |
| Refactoring unrelated business logic | Increases blast radius and risks behavioral regressions | Log unrelated issues separately and keep this milestone structural |
| Floor/dashboard design-system mixing | Floor components use a distinct touch-optimized aesthetic; dashboard uses shadcn/ui primitives | Preserve existing surface-specific component rules |

## Feature Dependencies

```txt
Component/hook inventory
  -> Classification matrix
  -> Logic mapping
  -> Hook/type/transformer decisions
  -> Primitive candidate plan
  -> Feature page/component plans
  -> First warehouse/location/stock vertical slice
  -> Docs/status verification
```

```txt
Repeated styling evidence
  -> Primitive extraction decision
  -> Primitive implementation
  -> Feature component rewiring
```

```txt
Complex component logic mapping
  -> Hook extraction decision
  -> DTO/transformer extraction decision
  -> Page component simplification
```

## MVP Recommendation

Prioritize:

1. **Inventory completion for current docs** - Finish metadata for component, hook, provider, and page docs before moving code.
2. **Classification and logic mapping for all warehouse/location/stock candidates** - This is the minimum planning surface needed for the first vertical slice.
3. **Target architecture map and primitive admission criteria** - Prevents arbitrary folder moves and speculative abstraction.
4. **First warehouse/location/stock vertical slice** - Move one coherent dashboard slice through route, hook, page, feature, primitive, type, and transformer boundaries.
5. **Verification and documentation status updates** - Record old/new paths, import updates, lint/typecheck status, and remaining risks.

Defer:

- **Full app-wide migration:** Defer until the first slice proves the target architecture and reveals adjustments.
- **GenericTable V2 continuation:** Keep paused unless component restructuring explicitly unblocks a narrow table task.
- **Factbox/display-field migration:** Explicitly out of scope for v1.2.
- **Design refresh:** Preserve existing UI and log design concerns separately.

## Requirements Implications

| Requirement Area | Implication |
|---|---|
| Phase acceptance | A phase is complete only when docs and code agree, imports are updated, verification status is recorded, and unresolved risks are written down |
| Planning artifacts | Roadmap should include explicit documentation deliverables, not only source-code moves |
| Test/verification | Structural changes should run lint/typecheck where available and include manual checks for affected dashboard warehouse/location/stock routes |
| Review scope | Review should compare behavior and visual output preservation, not judge redesign quality |
| Folder ownership | `components/ui` remains shadcn/base only; `components/primitives` stays domain-neutral; `components/features/[domain]` owns domain UI |
| Hook ownership | Hooks remain the only client-side API/state boundary; components consume hook values and callbacks |
| DTO/type ownership | API response types must not be defined inside component files; cross-boundary types and local component-cluster types need explicit placement decisions |
| Transformer ownership | Non-trivial reusable data transformation should move out of render components into transformers/utilities when logic mapping shows real reuse or complexity |
| Documentation quality | Existing metadata-only docs need expansion before they can safely drive code moves |

## Suggested Phase Grouping

| Phase Group | Features Included | Why This Grouping Works |
|---|---|---|
| 1. Inventory Recovery | Complete inventory, preserve frontmatter, identify docs that are stubs or duplicated | Establishes trustworthy source of truth |
| 2. Classification and Logic Mapping | File classification, risk, target paths, logic movement plans | Produces implementation-ready decisions without code churn |
| 3. Architecture and Primitive Plan | Folder responsibility map, primitive admission criteria, candidate list | Prevents misuse of `components/ui` and over-generic primitives |
| 4. Warehouse/Location/Stock Slice Plan | Route/hook/page/feature/primitive plan for the first slice | Narrows implementation to one coherent reviewable area |
| 5. First Vertical Slice Execution | Move selected files, extract hooks/types/transformers/primitives only as planned | Validates the milestone architecture in production code |
| 6. Verification and Retrospective | Lint/typecheck status, manual route checks, doc status updates, risks carried forward | Keeps future slices from inheriting stale assumptions |

## Open Research Gaps

- Several sampled refactor docs appear metadata-only, so the roadmap should include inventory recovery rather than assuming current docs are complete.
- The exact first slice boundary should be decided after reading the live source for warehouse/location/stock pages and their imports.
- Primitive extraction should wait for repeated styling evidence from completed docs; current rules provide examples but not final candidates.
- Hook promotion decisions require usage checks across component locations; do not promote hooks solely because they look reusable.

## Sources

- `.planning/PROJECT.md` - Milestone goal, target features, non-goals, constraints, and current v1.2 context. Confidence: HIGH.
- `.cursor/rules/component-architecture.mdc` - Target component layering and folder responsibility rules. Confidence: HIGH.
- `.cursor/rules/refactor-documentation-workflow.mdc` - Required documentation templates and phase completion rules. Confidence: HIGH.
- `.cursor/rules/component-refactor-core.mdc` - Behavior preservation and reviewability rules. Confidence: HIGH.
- `.docs/developer/refactors/` high-level file inventory - Existing documentation scope and uneven completeness. Confidence: MEDIUM.
