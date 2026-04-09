# Lemon WMS — Orders domain (purchase orders first)

## What This Is

Extend the existing Lemon WMS Next.js app with an **orders** capability, starting with **purchase orders**: office users create orders to suppliers from the dashboard; warehouse staff execute and pause/resume them on the floor. The app already has dashboard vs warehouse surfaces, Prisma/PostgreSQL, JWT auth, and `PurchaseOrder` / `PurchaseOrderLine` / `BusinessParty` / `Item` models—this work wires APIs, domain logic, and UI around those models.

## Core Value

Office users can **create, release, and track** supplier purchase orders; warehouse users can **see operational orders by status, start execution, and pause**—with a single shared data model and clear status transitions.

## Requirements

### Validated

- ✓ Split **office** (`/dashboard`) and **floor** (`/warehouse`) apps with role-aware access — existing (`middleware.ts`, route groups).
- ✓ **API namespaces**: `src/app/api/dashboard/*`, `src/app/api/warehouse/*`, `src/app/api/auth/*` — existing pattern.
- ✓ **Thin route handlers** delegating to `src/lib/entities/<domain>/` — existing pattern.
- ✓ **Prisma** data layer with generated client under `src/generated/prisma` — existing.
- ✓ **Schema primitives** for orders: `PurchaseOrder`, `PurchaseOrderLine`, `OrderStatus`, `BusinessParty` / `BusinessPartyType`, `Item` with `supplierId` — existing (`prisma/schema.prisma`).
- ✓ Shared UI building blocks: `generic-table`, `checkbox-table`, `universal-modal`, `DashboardInfoCards` — existing components.

### Active

- **Business party API (vendors + supplier catalog)**  
  - `GET /api/dashboard/businessparty` — list vendors (id + name only).  
  - `GET /api/dashboard/businessparty/[id]` — items for that supplier: **sku, name, unit of measure** only (supplier items are `Item` rows with `supplierId`; no separate `SupplierItem` model in schema).  
  - Domain helpers in `src/lib/entities/business-parties/`: `getAllVendors()`, `getItemsForVendor()` (thin orchestrators call these).
- **Purchase order API**  
  - `POST /api/dashboard/orders/[orderType]/create` — for `purchase`, calls `createPurchaseOrder()` in `src/lib/orders/purchase/` (path name `**purchase`**, not `pucharse`). Input: `orderNo` (string), lines: `{ itemId, baseQuantity, itemName }[]`. Creates `PurchaseOrder` + lines in a **transaction**.  
  - `GET /api/dashboard/orders/[orderType]` — `getDashboardPurchaseOrders()` when listing for dashboard: statuses **excluding `CANCELLED` and `CONFIRMED`** (interpreted as filter out both; adjust if product means otherwise).  
  - `GET` (warehouse variant under `api/warehouse/...` or shared handler with context) — `getWarehousePurchaseOrders()`: statuses `**RELEASED`, `EXECUTING`, `PAUSED**` only.
- **Status transitions (API + auth)**  
  - Dashboard table: action with **truck** icon — `DRAFT` → `RELEASED`.  
  - Warehouse table: action **start** — `RELEASED` → `EXECUTING`; if already `EXECUTING`, same control **pauses** → `PAUSED`.  
  - Enforce office vs floor roles consistently with existing middleware patterns.
- **Dashboard UI — orders hub**  
  - `src/app/(dashboard)/dashboard/orders/[orderType]/page.tsx` (or equivalent route segment): `purchase` → purchase orders, `sales` → sales orders (pattern for future types).  
  - `generic-table` lists current orders for that `orderType`.  
  - CTA opens `universal-modal`: pick supplier → `checkbox-table` of supplier items + quantity input enabled when row checked → confirm → **POST** create endpoint with payload.
- **Warehouse UI — purchase orders**  
  - `src/app/(warehouse)/warehouse/orders/[orderType]/...` — same dynamic `orderType` pattern as dashboard.  
  - Context/hook `**usePurchaseOrders`** loads orders; `**DashboardInfoCards`** (or floor-appropriate wrapper) groups **by status**; clicking a card filters the `generic-table`. No status filter → show all, with a **status indicator column**: grey = `RELEASED`, green = `EXECUTING`, amber = `PAUSED`.  
  - Row actions: start / pause as above.
- **Tests** — Vitest coverage for new domain functions and critical route handlers (mock Prisma), following `src/__tests__/` patterns.

### Out of Scope

- **Full sales / transfer / return order** implementations beyond routing placeholder and shared table shell — **purchase orders** are the first vertical slice unless explicitly expanded later.  
- **External ERP / EDI** integrations.  
- **Email/notifications** on status change.  
- **Printing / PDF** for POs.

## Context

- Brownfield repo: codebase map in `.planning/codebase/` (2026-04-08).  
- User intent: controllers stay thin; heavy logic in `src/lib/entities/business-parties` and `src/lib/orders/purchase`.  
- `PurchaseOrderLine` in schema uses `itemId`, `itemName`, `uom`, `baseQuantity` — align create payload and transactions with these fields.

## Constraints

- **Tech stack:** Next.js 16 App Router, Prisma 7, PostgreSQL, existing Axios + Zustand auth — no new data-fetching framework.  
- **API layout:** New routes live under `src/app/api/dashboard/` and `src/app/api/warehouse/` per existing conventions.  
- **Compatibility:** Must not break existing dashboard/warehouse flows outside orders.

## Key Decisions


| Decision                                                 | Rationale                                               | Outcome   |
| -------------------------------------------------------- | ------------------------------------------------------- | --------- |
| Supplier catalog = `Item` where `supplierId` = vendor    | Matches current Prisma schema (no `SupplierItem` table) | — Pending |
| Domain folder `src/lib/orders/purchase/`                 | User spec; keeps PO logic isolated                      | — Pending |
| Dashboard PO list excludes `CANCELLED` and `CONFIRMED`   | User spec                                               | — Pending |
| Warehouse PO list only `RELEASED`, `EXECUTING`, `PAUSED` | User spec                                               | — Pending |


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

*Last updated: 2026-04-08 after initialization*