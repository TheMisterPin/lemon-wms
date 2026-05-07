# Requirements: Lemon WMS

**Defined:** 2026-05-07  
**Core value:** Office users can create, release, and track supplier purchase orders; warehouse users can see operational orders by status, start execution, and pause. **Current milestone** makes the frontend component system predictable, documented, and safe for developers and agents to refactor without changing behavior or visual design.

## Milestone v1.2 — Component Folder Restructuring (active)

### Documentation baseline

- [ ] **CFR-01**: Developer can open `.docs/developer/refactors/components` and find a current inventory entry for every component, provider, page-level view, and meaningful declared child component in the selected scope before code movement begins.
- [ ] **CFR-02**: Developer can open `.docs/developer/refactors/hooks` and find a current responsibility entry for every hook, provider, and context that is part of the selected component refactor scope.
- [ ] **CFR-03**: Existing refactor markdown frontmatter, metadata, and useful notes are preserved while missing inventory fields are appended or updated from current source files.
- [ ] **CFR-04**: Summary documents exist for component inventory and old-path to target-path mapping so later phases can continue without relying on chat context.

### Classification and ownership

- [ ] **CFR-05**: Each documented component is classified as one of `shadcn/base`, `primitive`, `feature-component`, `feature-page`, `route-file`, `hook`, `utility`, `type-only`, or `delete/replace`.
- [ ] **CFR-06**: Each classification records reason, target folder, target file name, keep/move/split/delete decision, risk level, and whether the file contains multiple declared components.
- [ ] **CFR-07**: Target ownership is documented for `src/components/ui`, `src/components/primitives`, `src/components/features/[domain]`, `src/hooks`, `src/types/api`, `src/types/dto`, `src/types/components`, `src/lib/transformers`, and shared styling files.
- [ ] **CFR-08**: Components marked for splitting include a dismounted component plan that records the new code path, new documentation path, and reason for each extracted component.

### Logic mapping and data boundaries

- [ ] **CFR-09**: Each relevant component document identifies render logic, UI-only state, fetching, mutations, data transformation, validation, error handling, reusable utility logic, and inline types/interfaces.
- [ ] **CFR-10**: Logic movement tables map fetching to hooks, mutations to hooks, reusable transformations to `src/lib/transformers`, raw API shapes to `src/types/api`, UI-ready DTOs to `src/types/dto`, reusable utility logic to shared utilities, and render logic to components.
- [ ] **CFR-11**: Hook documents define current source, target hook file, consumers, inputs, returned DTO, actions, dependencies, loading/error/refetch ownership, and whether a provider/context should remain.
- [ ] **CFR-12**: Hooks that expose more than two callbacks group them under an `actions` object and return page-ready DTOs instead of raw API payloads.
- [ ] **CFR-13**: Mutation error parsing is moved out of component/provider files into a shared utility when the same behavior is reused by the first slice.

### Primitives and styling

- [ ] **CFR-14**: Primitive candidates are documented with purpose, source components, target path, typed props, allowed responsibilities, forbidden responsibilities, and migration usage.
- [ ] **CFR-15**: A primitive is planned only when repeated domain-neutral UI structure or styling evidence exists; primitives do not fetch data, mutate data, import feature hooks, know API response shapes, or contain domain business rules.
- [ ] **CFR-16**: Structural refactors preserve current visual output; Tailwind class cleanup, spacing changes, color changes, layout redesign, and broad style modernization are not included.
- [ ] **CFR-17**: Feature-specific skeletons remain near their feature components, while generic loading/error/empty states are documented as primitive candidates only when reused.

### First vertical slice execution

- [ ] **CFR-18**: The target folder structure is created for the first slice without breaking existing imports.
- [ ] **CFR-19**: The dashboard warehouse/location example is split so raw dashboard API payload types, UI DTOs, mutation error parsing, DTO transformers, hook logic, feature page rendering, and route composition live in their documented target locations.
- [ ] **CFR-20**: `DashboardWarehouseProvider` remains only as temporary compatibility scaffolding and is removed or replaced only after usage searches prove consumers have migrated.
- [ ] **CFR-21**: First-slice feature components under locations receive DTOs and callbacks as props and do not call Axios clients, API routes, or mutations directly.
- [ ] **CFR-22**: First-slice route files are thinned so coupling is visible: route imports hook, calls hook, and renders the feature page component with hook output.

### Verification and continuity

- [ ] **CFR-23**: Every moved, split, renamed, replaced, or deleted file has matching refactor documentation with status, old path, new path, related files, import update status, typecheck/lint status, and notes.
- [ ] **CFR-24**: Each implementation phase verifies imports/usages for old and new paths before deleting compatibility files.
- [ ] **CFR-25**: Each implementation phase records lint/typecheck/build status where applicable and manual route checks for affected dashboard warehouse/location/stock pages.
- [ ] **CFR-26**: No phase is marked complete unless code state and documentation state agree.

## Milestone v1.1 — GenericTable V2 (paused reference)

Paused before completion when v1.2 component folder restructuring became the active priority. The GTB requirements remain useful context for table work but are not active v1.2 scope.

### Paused GTB requirements

- **GTB-01**: New `src/types/components/table/column.types.ts` defines the discriminated `ColumnConfig<T>` model.
- **GTB-02**: `src/types/components/table/generic-table.types.ts` is rewritten with flattened table chrome and default-on search.
- **GTB-03**: `src/lib/utils/table/` implements resolve, sort, search, visibility, style conditions, operations, and cell value helpers.
- **GTB-04**: `src/components/tables/cells/` contains focused cell components and `CellRenderer`.
- **GTB-05**: Table shell/header/body/row composition is introduced.
- **GTB-06**: `generic-table.tsx` becomes a slim orchestrator.
- **GTB-07**: All `GenericTable` / `TableColumnConfig` consumers migrate to the new API.
- **GTB-08**: Build and manual table route verification pass.

## Milestone v1.0 — Purchase orders (reference)

Delivered in phases 1-10 (see `.planning/MILESTONES.md`). Requirement IDs BP-, PO-, UID-, UIW-, TST-01 were satisfied in that cycle; traceability rows below retain history.

## Future Requirements

### Later component slices

- **CFR-F01**: Repeat the proven component restructuring pattern for stock beyond the first slice, orders, iam, logs, and remaining dashboard/warehouse surfaces.
- **CFR-F02**: Resume or re-scope GenericTable V2 only after the component ownership refactor establishes stable table placement and primitive boundaries.

### Other order types

- **ORD-01**: Sales orders end-to-end using the same `[orderType]` shell.

### Notifications

- **NOTF-01**: Notify assignee or WM when order is released or paused.

## Out of Scope

| Feature | Reason |
| --- | --- |
| UI redesign, visual modernization, or broad Tailwind cleanup | v1.2 is structural and must preserve visual output |
| API route, API response contract, validation, DTO meaning, mutation semantic, or business rule changes | Component restructuring must not alter product behavior |
| New data-fetching, state-management, styling, component-library, codegen, or import-rewrite tooling | Existing stack is sufficient and new dependencies require separate approval |
| Whole-app component migration in one pass | First slice must prove the pattern before broader rollout |
| Domain-aware primitives or generic mega-primitives | Primitives must stay domain-neutral and render-focused |
| Broad barrel-file cleanup campaign | Import ergonomics alone does not justify broad churn |
| Repointing factbox/display-field utilities | Deferred from v1.1 and outside v1.2 scope |
| GenericTable V2 continuation | Paused while component folder restructuring is active |
| Prisma schema, migration, or database changes | No data-model change is needed |
| Full sales/transfer/return implementation | Purchase orders remain the validated order slice |
| EDI / external ERP sync | Integration scope |
| PDF / print purchase order | Nice-to-have |

## Traceability

| Requirement | Phase | Status |
| --- | --- | --- |
| CFR-01 | Phase 18 | Pending |
| CFR-02 | Phase 18 | Pending |
| CFR-03 | Phase 18 | Pending |
| CFR-04 | Phase 18 | Pending |
| CFR-05 | Phase 19 | Pending |
| CFR-06 | Phase 19 | Pending |
| CFR-07 | Phase 19 | Pending |
| CFR-08 | Phase 19 | Pending |
| CFR-09 | Phase 20 | Pending |
| CFR-10 | Phase 20 | Pending |
| CFR-11 | Phase 20 | Pending |
| CFR-12 | Phase 20 | Pending |
| CFR-13 | Phase 20 | Pending |
| CFR-14 | Phase 21 | Pending |
| CFR-15 | Phase 21 | Pending |
| CFR-16 | Phase 21 | Pending |
| CFR-17 | Phase 21 | Pending |
| CFR-18 | Phase 22 | Pending |
| CFR-19 | Phase 22 | Pending |
| CFR-20 | Phase 22 | Pending |
| CFR-21 | Phase 22 | Pending |
| CFR-22 | Phase 22 | Pending |
| CFR-23 | Phase 23 | Pending |
| CFR-24 | Phase 23 | Pending |
| CFR-25 | Phase 23 | Pending |
| CFR-26 | Phase 23 | Pending |

**Coverage (v1.2):**

- v1.2 requirements: 26 total  
- Mapped to phases: 26  
- Unmapped: 0 ✓

---

*Requirements defined: 2026-05-07*  
*Last updated: 2026-05-07 after milestone v1.2 (Component Folder Restructuring) initialization*