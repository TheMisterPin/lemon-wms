# Lemon WMS — Orders domain (purchase orders first)

## What This Is

Extend the existing Lemon WMS Next.js app with an **orders** capability, starting with **purchase orders**: office users create orders to suppliers from the dashboard; warehouse staff execute and pause/resume them on the floor. The app already has dashboard vs warehouse surfaces, Prisma/PostgreSQL, JWT auth, and `PurchaseOrder` / `PurchaseOrderLine` / `BusinessParty` / `Item` models - this work wires APIs, domain logic, and UI around those models.

Shared list UIs rely on a **GenericTable** pattern for configurable columns, search, sort, and pagination across dashboard and warehouse.

Current frontend work focuses on restructuring component ownership so routes, hooks, page components, feature components, primitives, DTOs, and transformers have predictable locations. The refactor is documentation-driven: inventory and planning documents under `.docs/developer/refactors/` must stay in sync with every later code move.

## Core Value

Office users can **create, release, and track** supplier purchase orders; warehouse users can **see operational orders by status, start execution, and pause**—with a single shared data model and clear status transitions.

## Current Milestone: v1.2 Component Folder Restructuring

**Goal:** Restructure the frontend component architecture so render components, hooks, DTOs, transformers, primitives, feature components, and route composition have clear responsibilities and predictable locations without changing user-facing behavior or visual design.

**Target features:**

- Complete component and hook inventory in `.docs/developer/refactors/`, preserving existing metadata and documenting every declared component, hook, provider, and page-level view before code moves.
- Classify current files into `shadcn/base`, primitive, feature component, feature page, route file, hook, utility, type-only, or delete/replace; record target paths, risk, and split decisions.
- Map component-held logic to hooks, DTO types, API types, transformers, utilities, and primitives before implementation.
- Plan and create project primitives only for repeated UI patterns, keeping `components/ui` reserved for shadcn/ui base components.
- Move the first vertical slice around dashboard warehouse/location/stock views through the target route -> hook -> page -> feature -> primitive layering, with code and docs updated together.

**Explicit non-goals for this milestone:**

- Redesigning or "improving" the UI while moving files.
- Changing API routes, API response contracts, DTO meanings, validation rules, or business rules.
- Refactoring the whole app in one giant pass.
- Introducing a new state management or data-fetching library.
- Moving files before the relevant inventory, classification, and logic mapping docs are updated.

## Requirements

### Validated (v1.0 — purchase orders slice)

- ✓ Split **office** (`/dashboard`) and **floor** (`/warehouse`) apps with role-aware access.
- ✓ API namespaces: `src/app/api/dashboard/`*, `src/app/api/warehouse/`*, `src/app/api/auth/*`.
- ✓ Thin route handlers delegating to `src/lib/entities/<domain>/` and `src/lib/orders/purchase/` where applicable.
- ✓ Prisma data layer with generated client under `src/generated/prisma`.
- ✓ Schema primitives for orders: `PurchaseOrder`, `PurchaseOrderLine`, `OrderStatus`, `BusinessParty`, `Item` with `supplierId`.
- ✓ Business party list + supplier item catalog APIs and purchase order create/list/transition APIs.
- ✓ Dashboard orders hub (list, release, create flow) and warehouse orders experience (status cards, indicators, start/pause).
- ✓ Targeted tests and hardening for orders/table hooks as delivered in prior phases.
- ✓ Documentation and seed data for purchase orders (as completed in prior work).

### Paused (v1.1 — GenericTable V2)

- Implement new table type system and utilities per `.planning/REQUIREMENTS.md` (GTB-).
- Rewrite `GenericTable` composition and migrate every consumer; remove dead coupling to old table-only display-field patterns in table code.
- Verification: `pnpm build` and manual checks on warehouses, zones, bins, devices, orders (dashboard + warehouse), warehouse home, stock, items, and any other route that renders the new table.

### Active (v1.2 — Component Folder Restructuring)

- Build a documentation-first component inventory and classification system for the existing frontend.
- Define the final folder and responsibility map for `components/ui`, `components/primitives`, `components/features`, `hooks`, `types`, `lib/transformers`, and shared styling.
- Execute the first safe vertical slice around dashboard warehouse/location/stock surfaces after docs are complete.
- Preserve behavior and visual output throughout the restructuring.

### Out of Scope

- **Full sales / transfer / return order** implementations beyond routing placeholder and shared table shell — **purchase orders** remain the first vertical slice unless explicitly expanded later.
- **External ERP / EDI** integrations.
- **Email/notifications** on status change.
- **Printing / PDF** for POs.
- **Refactoring factbox** onto the new column types (deferred; factbox keeps `display-field.types.ts`).
- **UI redesign / modernization during restructuring** - structural work must preserve the existing visual design.

## Context

- Brownfield repo: codebase map in `.planning/codebase/` (2026-04-08).
- Controllers stay thin; domain logic lives in `src/lib/entities/`* and `src/lib/orders/purchase/`.
- `PurchaseOrderLine` uses `itemId`, `itemName`, `uom`, `baseQuantity` — create payloads and transactions must stay aligned.
- Prior GSD phase folders under `.planning/phases/` were cleared when starting v1.1; milestone history is summarized in `.planning/MILESTONES.md`.
- Existing refactor documentation under `.docs/developer/refactors/components` and `.docs/developer/refactors/hooks` is the source of truth for component moves and must be read before every refactor phase.
- `src/components/dashboard/warehouses/use-dashboard-warehouse.tsx` is the current example of the provider/hook/type/DTO/transformer responsibilities this milestone will split.

## Constraints

- **Tech stack:** Next.js 16 App Router, Prisma 7, PostgreSQL, existing Axios + Zustand auth — no new data-fetching framework.
- **API layout:** New routes stay under `src/app/api/dashboard/` and `src/app/api/warehouse/` per conventions.
- **Compatibility:** Component restructuring must not change user-facing behavior, visual design, API contracts, mutation semantics, route contracts, or validation rules.
- **Scope boundaries:** Do not repoint factbox or shared display-field utilities unless a later phase explicitly scopes that work.
- **Refactor discipline:** Documentation and code move together; no phase is complete unless related markdown reflects current code state.

## Key Decisions


| Decision                                                 | Rationale                             | Outcome   |
| -------------------------------------------------------- | ------------------------------------- | --------- |
| Supplier catalog = `Item` where `supplierId` = vendor    | Matches Prisma schema                 | ✓ Good    |
| Domain folder `src/lib/orders/purchase/`                 | Keeps PO logic isolated               | ✓ Good    |
| Dashboard PO list excludes `CANCELLED` and `CONFIRMED`   | Product rule                          | ✓ Good    |
| Warehouse PO list only `RELEASED`, `EXECUTING`, `PAUSED` | Product rule                          | ✓ Good    |
| GenericTable V2 paused in favor of component restructuring | Component ownership is the broader prerequisite | — Pending |
| Component refactor is documentation-driven                | Prevents context loss between agents and phases | — Pending |
| No UI redesign during structural moves                    | Keeps review focused and preserves behavior | — Pending |


## Evolution

This document evolves at phase transitions and milestone boundaries.

**After each phase transition** (via `/gsd-transition`):

1. Requirements invalidated? → Move to Out of Scope with reason
2. Requirements validated? → Move to Validated with phase reference
3. New requirements emerged? → Add to Active
4. Decisions to log? → Add to Key Decisions
5. "What This Is" still accurate? → Update if drifted

**After each milestone** (via `/gsd-complete-milestone`):

1. Full review of all sections
2. Core Value check — still the right priority?
3. Audit Out of Scope — reasons still valid?
4. Update Context with current state

---

*Last updated: 2026-05-07 after milestone v1.2 (Component Folder Restructuring) initialization*