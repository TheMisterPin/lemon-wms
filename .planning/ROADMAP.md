# Roadmap: Lemon WMS

**Milestone:** v1.2 - Component Folder Restructuring  
**Requirements source:** `.planning/REQUIREMENTS.md`

**Note:** Roadmap phases **1-10** belonged to milestone v1.0 (purchase orders). Phases **11-17** were planned for v1.1 GenericTable V2, which is now paused/superseded before completion. Numbering continues at **phase 18** for v1.2.

## Overview

| # | Phase | Goal | Requirements | Success criteria |
| --- | --- | --- | --- | --- |
| 18 | Inventory baseline | Make refactor docs trustworthy before movement | CFR-01, CFR-02, CFR-03, CFR-04 | Current scoped components/hooks/providers/pages inventoried and summarized |
| 19 | Classification and ownership | Decide target layer, path, action, and risk | CFR-05, CFR-06, CFR-07, CFR-08 | Classification summary and old/new map complete |
| 20 | Logic mapping and hook decisions | Separate render, hook, DTO, transformer, utility responsibilities | CFR-09, CFR-10, CFR-11, CFR-12, CFR-13 | Logic movement and hook responsibility docs complete |
| 21 | Primitive and styling plan | Admit only proven reusable primitives and preserve visuals | CFR-14, CFR-15, CFR-16, CFR-17 | Primitive plan cites source patterns and non-goals |
| 22 | First locations slice | Apply target architecture to dashboard warehouse/location/stock scope | CFR-18, CFR-19, CFR-20, CFR-21, CFR-22 | First slice uses route -> hook -> page -> feature -> primitive layering |
| 23 | Verification and pattern lock-in | Prove docs/code agreement and capture carry-forward rules | CFR-23, CFR-24, CFR-25, CFR-26 | Verification recorded and next slices can reuse the pattern |

---

## Phase 18: Inventory baseline

**Goal:** Document current components, hooks, providers, and page-level views in the selected scope before moving code.

**Requirements:** CFR-01, CFR-02, CFR-03, CFR-04

**Success criteria:**

1. `.docs/developer/refactors/components` has current inventory entries for every selected component, page-level view, provider, and meaningful declared child component.
2. `.docs/developer/refactors/hooks` has current responsibility entries for selected hooks, contexts, and providers.
3. Existing markdown frontmatter, metadata, generated-doc links, and useful notes are preserved.
4. Summary reports list inventory coverage and missing/partial docs for follow-up.

**UI hint:** no  
**Depends on:** -

**Plans:** 10 plans

Plans:
- [x] 18-01-PLAN.md — Build selected source-to-doc coverage audit.
- [x] 18-02-PLAN.md — Inventory central dashboard warehouse provider and hook docs.
- [x] 18-03-PLAN.md — Inventory bin and stock hook responsibility docs.
- [x] 18-04-PLAN.md — Inventory warehouse/location page-level docs.
- [x] 18-05-PLAN.md — Inventory warehouse child component docs group A.
- [x] 18-06-PLAN.md — Inventory remaining warehouse child and type-only docs.
- [x] 18-07-PLAN.md — Inventory bins and zones component docs.
- [x] 18-08-PLAN.md — Inventory stock component docs.
- [x] 18-09-PLAN.md — Inventory selected feature form and modal docs.
- [x] 18-10-PLAN.md — Write inventory summaries, refactor map, and verification record.

---

## Phase 19: Classification and ownership

**Goal:** Classify every documented file in the selected scope and decide the target layer, target path, action, and risk before code movement.

**Requirements:** CFR-05, CFR-06, CFR-07, CFR-08

**Success criteria:**

1. Every selected doc includes a `Classification` section with classification, reason, target folder, target file name, keep/move/split/delete decision, and risk.
2. A target ownership map documents responsibilities for `components/ui`, `components/primitives`, `components/features`, `hooks`, `types`, `lib/transformers`, and shared styling.
3. Multi-component files include dismounted-component plans before extraction.
4. `_classification-summary.md` and/or refactor-map summary provides a reviewable old-path to target-path matrix.

**UI hint:** no  
**Depends on:** Phase 18

**Plans:** 10 plans

Plans:
- [x] 19-01-PLAN.md — Create classification summary scaffold and target ownership map.
- [x] 19-02-PLAN.md — Classify locations hook and provider docs.
- [x] 19-03-PLAN.md — Classify warehouse/location page-level docs.
- [x] 19-04-PLAN.md — Classify warehouse child/type docs group A.
- [x] 19-05-PLAN.md — Classify warehouse stock child and skeleton docs.
- [x] 19-06-PLAN.md — Classify bin dashboard, modal, and form docs.
- [x] 19-07-PLAN.md — Classify zone component and overview docs.
- [x] 19-08-PLAN.md — Classify stock dashboard component docs.
- [x] 19-09-PLAN.md — Classify stock hook docs.
- [x] 19-10-PLAN.md — Finalize summaries, map, and validation gates.

---

## Phase 20: Logic mapping and hook decisions

**Goal:** Identify logic that does not belong in render components and decide its target home before implementation.

**Requirements:** CFR-09, CFR-10, CFR-11, CFR-12, CFR-13

**Success criteria:**

1. Each relevant component doc includes a `Logic Mapping` section for render logic, UI state, fetching, mutations, transformation, validation, error handling, reusable utilities, and inline types.
2. Movement tables map logic to hooks, transformers, API types, DTO types, utilities, or retained render code with reason and risk.
3. Hook docs define current source, target path, consumers, inputs, returned DTO, actions, dependencies, loading/error/refetch ownership, and context/provider decision.
4. The dashboard warehouse provider example has an implementation-ready split plan for API types, DTOs, transformers, mutation error parsing, hook actions, and page props.

**UI hint:** no  
**Depends on:** Phase 19

---

## Phase 21: Primitive and styling plan

**Goal:** Plan only repeated, domain-neutral primitives and styling extractions while making visual preservation a hard gate.

**Requirements:** CFR-14, CFR-15, CFR-16, CFR-17

**Success criteria:**

1. Primitive candidate docs include purpose, source components, target path, props DTO, styling rules, allowed responsibilities, forbidden responsibilities, migration usage, and open questions.
2. `_primitive-extraction-plan.md` lists candidate primitives, source components, repeated pattern evidence, and risk.
3. No primitive is approved if it fetches, mutates, imports feature hooks, knows API response shapes, or contains domain business rules.
4. Feature-specific skeletons and generic loading/error/empty states have documented placement decisions.

**UI hint:** yes  
**Depends on:** Phase 20

---

## Phase 22: First locations slice

**Goal:** Execute the first reviewable vertical slice for dashboard warehouse/location/stock surfaces using the documented target architecture.

**Requirements:** CFR-18, CFR-19, CFR-20, CFR-21, CFR-22

**Success criteria:**

1. Target folders needed by the first slice exist without breaking current imports.
2. Dashboard warehouse API payload types, UI DTOs, mutation error parsing, transformers, hook logic, feature page rendering, and route composition are split into documented target files.
3. `DashboardWarehouseProvider` remains only as documented compatibility scaffolding and is removed/replaced only after usage searches prove consumers have migrated.
4. First-slice feature components receive DTOs and callbacks as props and do not call Axios clients, API routes, or mutations directly.
5. Touched route files visibly import the hook, call the hook, and render the feature page component with hook output.

**UI hint:** yes  
**Depends on:** Phase 21

---

## Phase 23: Verification and pattern lock-in

**Goal:** Verify code and documentation agree after the first slice, record risks, and make the pattern reusable for later domains.

**Requirements:** CFR-23, CFR-24, CFR-25, CFR-26

**Success criteria:**

1. Every moved, split, renamed, replaced, or deleted file has matching refactor documentation with old path, new path, related files, import status, verification status, and notes.
2. Old/new import and usage searches are recorded before compatibility files are deleted.
3. Lint/typecheck/build status is recorded where applicable, and manual route checks are documented for affected dashboard warehouse/location/stock pages.
4. Remaining risks and the repeatable pattern for later stock/orders/iam/logs slices are written down.

**UI hint:** no  
**Depends on:** Phase 22

---

## Notes

- **Behavior preservation:** v1.2 must not change API contracts, mutation semantics, validation, business rules, or visual design.
- **Documentation gate:** No implementation phase is complete unless code paths and `.docs/developer/refactors/` docs agree.
- **Paused work:** GenericTable V2 remains paused unless explicitly re-scoped into a later milestone or narrow phase.
