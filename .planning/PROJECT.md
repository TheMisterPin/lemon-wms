# Lemon WMS — Orders domain (purchase orders first)

## What This Is

Extend the existing Lemon WMS Next.js app with an **orders** capability, starting with **purchase orders**: office users create orders to suppliers from the dashboard; warehouse staff execute and pause/resume them on the floor. The app already has dashboard vs warehouse surfaces, Prisma/PostgreSQL, JWT auth, and `PurchaseOrder` / `PurchaseOrderLine` / `BusinessParty` / `Item` models—this work wires APIs, domain logic, and UI around those models.

Shared list UIs rely on a **GenericTable** pattern for configurable columns, search, sort, and pagination across dashboard and warehouse.

## Core Value

Office users can **create, release, and track** supplier purchase orders; warehouse users can **see operational orders by status, start execution, and pause**—with a single shared data model and clear status transitions.

## Current Milestone: v1.1 GenericTable V2

**Goal:** Replace the monolithic `GenericTable` with a composable, type-safe table system (new column model, focused cells, shared table utils, slim orchestrator) and migrate every consumer—accepting a **breaking** public API for table props and column config.

**Target features:**

- New discriminated `ColumnConfig<T>` (`src/types/components/table/column.types.ts`) and rewritten `generic-table.types.ts` (flattened props, default-on search, `rowStyleIf`, unified `accessor` dot paths).
- `src/lib/utils/table/` for resolve, sort, search, column visibility, style conditions, numeric operations, and cell value helpers.
- Decomposed UI: `TableShell`, `TableHeader`, `TableBody`, `TableRow`, `CellRenderer`, and one component per column type (`text`, `date`, `number`, `boolean`, `progress`, `indicator`, `joinValues`, `operation`) plus custom cell escape hatch.
- Slim `generic-table.tsx` orchestrator (~100 lines target) composing the above.
- Migrate all `GenericTable` / `TableColumnConfig` consumers (entity configs, dashboard and warehouse pages, `page-with-grid`, `create-purchase-order-modal`, tests) and verify with `pnpm build` plus listed manual routes.

**Explicit non-goals for this milestone:**

- Changing factbox / `display-field.types.ts` or `display-fields.ts` (remain on legacy display-field model).
- Changing `checkbox-table.tsx` beyond import fixes if strictly required.

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

### Active (v1.1 — GenericTable V2)

- Implement new table type system and utilities per `.planning/REQUIREMENTS.md` (GTB-).
- Rewrite `GenericTable` composition and migrate every consumer; remove dead coupling to old table-only display-field patterns in table code.
- Verification: `pnpm build` and manual checks on warehouses, zones, bins, devices, orders (dashboard + warehouse), warehouse home, stock, items, and any other route that renders the new table.

### Out of Scope

- **Full sales / transfer / return order** implementations beyond routing placeholder and shared table shell — **purchase orders** remain the first vertical slice unless explicitly expanded later.
- **External ERP / EDI** integrations.
- **Email/notifications** on status change.
- **Printing / PDF** for POs.
- **Refactoring factbox** onto the new column types (deferred; factbox keeps `display-field.types.ts`).

## Context

- Brownfield repo: codebase map in `.planning/codebase/` (2026-04-08).
- Controllers stay thin; domain logic lives in `src/lib/entities/`* and `src/lib/orders/purchase/`.
- `PurchaseOrderLine` uses `itemId`, `itemName`, `uom`, `baseQuantity` — create payloads and transactions must stay aligned.
- Prior GSD phase folders under `.planning/phases/` were cleared when starting v1.1; milestone history is summarized in `.planning/MILESTONES.md`.

## Constraints

- **Tech stack:** Next.js 16 App Router, Prisma 7, PostgreSQL, existing Axios + Zustand auth — no new data-fetching framework.
- **API layout:** New routes stay under `src/app/api/dashboard/` and `src/app/api/warehouse/` per conventions.
- **Compatibility:** v1.1 intentionally **breaks** the GenericTable public API; non-table flows must keep working after migration.
- **Scope boundaries:** Do not repoint factbox or shared display-field utilities for this milestone.

## Key Decisions


| Decision                                                 | Rationale                             | Outcome   |
| -------------------------------------------------------- | ------------------------------------- | --------- |
| Supplier catalog = `Item` where `supplierId` = vendor    | Matches Prisma schema                 | ✓ Good    |
| Domain folder `src/lib/orders/purchase/`                 | Keeps PO logic isolated               | ✓ Good    |
| Dashboard PO list excludes `CANCELLED` and `CONFIRMED`   | Product rule                          | ✓ Good    |
| Warehouse PO list only `RELEASED`, `EXECUTING`, `PAUSED` | Product rule                          | ✓ Good    |
| GenericTable V2 = breaking change; factbox unchanged     | Lower coupling; incremental migration | — Pending |


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

*Last updated: 2026-04-09 after milestone v1.1 (GenericTable V2) initialization*