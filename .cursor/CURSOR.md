# Lemon WMS

## Project name
Lemon WMS

## Where this file lives (and how Cursor uses it)

This file is at **`.cursor/CURSOR.md`**. It is **project documentation**, not a built-in Cursor rule file.

- **Agents will use it when you `@`-mention it** (e.g. `@.cursor/CURSOR.md`) or when it is already open in context — same as any other doc in the repo.
- **It is not auto-loaded on every chat.** For instructions you want applied automatically, add a rule under [`.cursor/rules/`](https://docs.cursor.com/context/rules) (e.g. a `.mdc` file with `alwaysApply` or a glob), or keep using **User Rules** in Cursor settings.

Keeping this file in `.cursor/` is fine for discoverability and for pairing with other Cursor config. **Actionable agent rules** for this repo live in **`.cursor/rules/*.mdc`** (core context, API, data layer, React, shadcn dashboard, warehouse floor). Use this file for the long-form spec; rules apply automatically by glob or `alwaysApply`.

---

## What this is
A full-featured Warehouse Management System with two distinct sides:
- **Office side** (`/dashboard`) — used by Owner, Office Manager, Office Worker on desktop
- **Floor side** (`/warehouse`) — used by Warehouse Manager and Warehouse Worker on tablets/ruggedised terminals

Both sides live in the **same Next.js application** (single package, not a monorepo). They share the database and API layer but use separate layouts, UX patterns, and component emphasis (shadcn on dashboard vs custom floor UI).

---

## Tech stack

| Concern | Decision |
|---|---|
| Framework | Next.js 16.2.1 (App Router), TypeScript strict mode |
| Styling | Tailwind CSS 4 + PostCSS |
| Components | shadcn/ui (dashboard side), custom minimal (warehouse floor side) |
| Database | PostgreSQL via Prisma 7.3 (PrismaPg adapter) |
| Auth | Custom JWT — two flows: credential (email+password) and badge+PIN |
| State | Zustand (auth store) + React Hook Form + minimal client state |
| Forms | React Hook Form + Zod |
| HTTP client | Axios (`lib/axios.ts`) — dashboard vs warehouse base URLs where needed |
| API | Next.js Route Handlers under `src/app/api/` — split into `api/dashboard/*` (office) and `api/warehouse/*` (floor) |
| Real-time | No WebSockets for MVP — client data via fetch/Axios and hooks |
| Package manager | pnpm 10.29.3 |
| Deployment | Vercel + managed Postgres (Neon or Supabase) |
| Testing | Vitest + Testing Library (`pnpm test`) — light coverage, not full E2E |

---

## Repo structure

```
lemon-wms/
├── prisma/
│   ├── schema.prisma                   # ~35 models (see Domain models)
│   └── migrations/                     # Often empty in dev — `pnpm exec prisma db push` is common
├── seed/
│   ├── seed-all.ts                     # `pnpm run seed:all`
│   ├── seed-users.ts                   # `pnpm run seed:users`
│   └── seed-warehouses.ts              # `pnpm run seed:warehouses`
├── docs/
│   ├── create-local-postgres-db.md
│   ├── seeding-users.md
│   └── LOGGING.md
├── src/
│   ├── app/
│   │   ├── layout.tsx                  # Root layout with AuthProvider
│   │   ├── page.tsx                    # Redirects to /login
│   │   ├── globals.css                 # Tailwind + brand design tokens
│   │   ├── (auth)/
│   │   │   ├── login/page.tsx          # Dual-tab login (credential + floor)
│   │   │   └── floor/page.tsx          # Badge + PIN login (alt route)
│   │   ├── (dashboard)/                # Office side — Owner, OM, OW
│   │   │   ├── layout.tsx              # DashboardShell wrapper
│   │   │   └── dashboard/
│   │   │       ├── page.tsx            # Home (warehouse/zone/bin overview)
│   │   │       ├── stock/page.tsx      # Stock dashboard (aggregated stock)
│   │   │       ├── warehouses/page.tsx
│   │   │       ├── zones/page.tsx
│   │   │       ├── bins/page.tsx
│   │   │       ├── items/page.tsx      # Placeholder (not item CRUD UI yet)
│   │   │       ├── users/page.tsx      # Stub
│   │   │       └── devices/page.tsx
│   │   ├── (warehouse)/                # Floor side — WM, WW
│   │   │   ├── layout.tsx              # Warehouse shell
│   │   │   └── warehouse/
│   │   │       ├── page.tsx            # Home: zones/bins, order pool
│   │   │       └── bins/[id]/page.tsx  # Bin detail (floor)
│   │   └── api/
│   │       ├── auth/                   # login, floor/login, logout, refresh
│   │       ├── dashboard/              # Office: warehouses, zones, bins, users, devices, items, home, stock
│   │       ├── warehouse/              # Floor: home, bins, items, stock/addtobin
│   │       ├── errors/route.ts
│   │       ├── logs/route.ts           # stub
│   │       └── seed/users/route.ts     # dev only
│   ├── components/
│   │   ├── ui/                         # shadcn/ui
│   │   ├── configs/entities/           # Form/table configs (warehouse, zone, bin, device, …)
│   │   ├── shared/                     # ScanInput, NumericKeypad, etc.
│   │   ├── dashboard/                  # DashboardShell, pages, features
│   │   ├── warehouse/                  # Floor shell and views
│   │   ├── auth/
│   │   ├── tables/
│   │   ├── factbox/
│   │   ├── inputs/
│   │   └── typography/
│   ├── hooks/                          # useAuth, dashboard data hooks
│   ├── lib/
│   │   ├── prisma.ts
│   │   ├── axios.ts
│   │   ├── api/                        # e.g. shared response helpers
│   │   ├── auth/                       # jwt, session, guards, Zustand store
│   │   ├── entities/                   # Domain logic: warehouses, zones, bins, items, users, devices, stock, auth, …
│   │   ├── seeding/
│   │   └── utils/
│   ├── middleware.ts                   # Auth + role redirect
│   ├── types/
│   └── generated/
│       └── prisma/                     # Client output from `generator output` in schema
└── public/
```

> **Note on services pattern**: Business logic lives in `lib/entities/<domain>/` (not `lib/services/`). Each file is a focused function (e.g. `create-warehouse.ts`, `get-warehouses.ts`). API routes call these functions directly. Log chain functions will also live here when implemented.

---

## Environment variables (.env.local)

```
DATABASE_URL="postgresql://localhost:5432/wms_db"
JWT_SECRET="generate-with: openssl rand -base64 32"
JWT_ACCESS_EXPIRY="15m"
JWT_REFRESH_EXPIRY="7d"
IMGBB_API_KEY=
NEXT_PUBLIC_IMGBB_API_KEY=
```

No NextAuth — auth is fully custom JWT. See `.env.example` for the template.

---

## Roles (five total)

| Role | Side | Description |
|---|---|---|
| `OWNER` | Dashboard | Super-admin. Full access everywhere. One per org. |
| `OFFICE_MANAGER` (OM) | Dashboard | Manages orders, items, users. Broad write access. |
| `OFFICE_WORKER` (OW) | Dashboard | Creates draft orders. Limited write access. |
| `WAREHOUSE_MANAGER` (WM) | Floor | Manages floor operations, releases orders, signs off. |
| `WAREHOUSE_WORKER` (WW) | Floor | Executes orders (picking, receiving, etc). |

Permissions are role-based and additive downward. No role can be elevated beyond its ceiling.

---

## Authentication — two flows

### Credential flow (office side)
- Email + password → `POST /api/auth/login`
- Returns access token (15m) + refresh token (7d)
- Access token stored in a **non-httpOnly cookie** (readable by middleware for SSR routing)
- Refresh token stored in a **httpOnly cookie** (not accessible to JS)

### Badge + PIN flow (floor side)
- Device code → badge number scan → 4-digit PIN → `POST /api/auth/floor/login`
- Device code auto-loaded from localStorage if device was previously registered
- JWT payload includes `{ userId, role, deviceId, zoneId, warehouseId }` — WW never selects zone manually
- PIN stored as bcrypt hash — never plain text even though only 4 digits

### Routing on login

| Role | Redirect |
|---|---|
| OWNER, OM, OW | `/dashboard` |
| WM, WW | `/warehouse` |

`src/middleware.ts` enforces this on every request. Dashboard rejects warehouse-side roles (403). Warehouse rejects office-side roles (403). No client-side-only guards.

---

## Domain models (Prisma schema)

### Location hierarchy
```
Warehouse → Zone → Bin → BinStockItem (stock row) → Item (catalog SKU)
```

**Warehouse**: id, name (unique), address, timezone, currency, status, createdById, deletedAt, timestamps

**Zone**: id, warehouseId, name, type enum, customPermissions JSON?, isActive, default bin FKs (receiving/quarantine/outgoing), deletedAt

**Bin**: id, zoneId, warehouseId, name, code (unique), type enum, isBlocked, blockReason?, maxWeightKg?, maxVolumeM3?, maxCapacity?, currentCapacity?, deletedAt

**BinStockItem** (replaces older “BinItem” naming in docs): id, warehouseId, binId, itemId, lotId?, serialNumberId?, quantities (available / reserved / blocked as `Decimal`), uom (FK to `UnitOfMeasure.id`), status, expiryDate?, description, optional transit/reservation/box/audit fields (`transitDeviceId`, `reservedByOrderId`, `boxId`, `createdByBoeId`, `lastOperationBoeId`, …)

Quantity semantics (unchanged conceptually):
- `quantityAvailable` — free to pick or reserve
- `quantityReserved` — committed to an order, still in bin
- `quantityBlocked` — hold/quarantine; not pickable
- Effective pickable ≈ `quantityAvailable - quantityReserved` (business rules may further restrict)

Unique constraint in schema: `@@unique([binId, itemId, lotId, serialNumberId])` (adjust app logic for tracking mode accordingly).

---

### Users

**User**: id, email?, passwordHash?, badgeNumber (unique), pinHash?, firstName, lastName, fullName, role, loginType (CREDENTIAL/BADGE_PIN/BOTH), isActive, deletedAt, lastLoginDeviceId?, isLoggedIn, timestamps
- Badge numbers still follow the USR-XXXX style from seed/config (see seeding docs)

**RefreshToken**: id, userId, tokenHash (never raw), deviceLabel, deviceId?, expiresAt, revokedAt?, createdAt

**Device**: id (uuid default), name (unique), code (unique), warehouseId?, zoneId? (unique when set), authorized, isActive, type (`DeviceType`, default FLOOR), registeredAt, lastSeenAt, loginMode (`LoginMode`: PIN / AUTOMATIC), lastUserId?

**WarehouseAssignment**: id, userId, warehouseId, zoneId?
- `zoneId = null` means WM-level assignment (access to all zones in warehouse)
- Unique constraint: `(userId, warehouseId, zoneId)`

**OrderAssignment**: links a user to an order (`orderType` + `orderId`) for activity tracking; relates to `UserActivityEntry` via `orderAssignmentId`.

---

### Parties & units (supporting master data)

**BusinessParty** + **ContactPerson** + **Address**: suppliers/customers (and related PO/SO `businessPartyId` links). Used as structured party data alongside legacy string fields on some orders.

**UnitOfMeasure**: canonical UOM rows; `Item.uom` and line/stock UOM fields reference `UnitOfMeasure.id`.

---

### Items

**Item** (catalog / SKU — formerly “WARItem” in older docs): id, sku (unique), name, description?, barcode?, categoryId? (relation to `ItemCategory.code`), trackingMode (NONE/LOT/SERIAL/FIFO), uom → `UnitOfMeasure`, weightKg?, dimensions JSON?, minQuantity, isActive, supplierId?, deletedAt
- trackingMode change should stay blocked if stock exists (enforce in entity layer)

**ItemCategory**: id, code (unique), name (unique), parent/child via `parentCode`, handlingFlags JSON, hasChildren

Tracking modes:
| Mode | Behaviour |
|---|---|
| `NONE` | Fungible. No lot or serial. Simple qty. |
| `LOT` | Batch tracked. BinItem has lotId. Lot created at PO receiving. |
| `SERIAL` | Each unit unique. BinItem has serialNumberId. qty always 1. |
| `FIFO` | Fungible, first-in-first-out. Ordered by BinItem.createdAt at query time. |

---

### Lots

**Lot**: id, lotNumber (unique), itemId?, purchaseOrderId?, receivedDate, expiryDate?, status (ACTIVE/QUARANTINE/EXPIRED/CONSUMED)

Status machine:
```
ACTIVE ↔ QUARANTINE
ACTIVE → EXPIRED (scheduled job when expiryDate passes)
ACTIVE/QUARANTINE → CONSUMED (when all BinItems for lot reach qty 0)
```

Lots are created during PO receiving — never pre-created. On quarantine: all quantityAvailable moves to quantityBlocked across all bins. On release: reversed.

Expiry alert fires when expiryDate is within threshold days (default 30). When expiryDate passes: job sets status → EXPIRED and creates a draft AdjustmentOrder for WM review.

---

### Serial numbers

**SerialNumber**: id, serial (unique), configId, entityType, baseValue, partialCurrent?, partialTotal?, status (IN_STOCK/SHIPPED/RETURNED/SCRAPPED), itemId?

**SerialNumberConfig**: id, entityType enum (ITEM/BOX/BOX_LINE/PALLET/ORDER/ORDER_LINE/USER), prefix?, format, lastValue, incrementBy, mode (INCREMENTAL/PARTIAL), itemId?, warehouseId?

Generation requires row-level lock on config to prevent duplicate base values. Two modes:
- **Incremental**: one serial per call, lastValue += incrementBy
- **Partial**: N serials sharing one baseValue, e.g. `BL-0001 1/5` through `BL-0001 5/5`

---

### Boxes

**Box**: id, code (unique), status (OPEN/SEALED/IN_TRANSIT/RECEIVED/SHIPPED/SCRAPPED), binId?, warehouseId, weightKg?, notes?

**BoxLine**: id, boxId, itemId (→ `BinStockItem` in current schema), quantity, lotId?, serialNumberId?, uom → `UnitOfMeasure`

A box can span multiple stock rows/lots. Navigate Box ↔ stock via `BoxLine` relations.

**Error**: persisted client/server errors for debugging (`ErrorType`: CLIENT / SERVER).

---

### Orders — five types, separate tables

Common fields (see `schema.prisma` per type — not all columns exist on every model): e.g. `id`, `reference` (unique), `status`, `priority`, `warehouseId`, `notes`, `createdById`, `confirmedById`, `confirmedAt`, `assignedWMId`, `deletedAt`, timestamps. Purchase/sales types also link to **BusinessParty** (`businessPartyId`) and may reference **UserActivityEntry** for audit hooks.

Status machine (shared by all types):
```
DRAFT → CONFIRMED → RELEASED → EXECUTING → EXECUTED → SIGNED_OFF
                                    ↕ PAUSED
              EXECUTED → EXECUTED_WITH_PROBLEMS → SIGNED_OFF
              any state → CANCELLED
```

| Order type | Direction | Extra fields |
|---|---|---|
| **PurchaseOrder (PO)** | Inbound from supplier | supplier, expectedDate, receivingSequence |
| **SalesOrder (SO)** | Outbound to customer | customerName, deliveryAddress, carrierId |
| **TransferOrder (TO)** | Internal movement | fromBinId, toBinId, isCrossWarehouse |
| **ReturnOrder (RO)** | Inbound from customer | originSalesOrderId, returnDisposition |
| **AdjustmentOrder (AO)** | Stock correction | reasonCode |

Each has line models (e.g. `PurchaseOrderLine`). Prisma still names the catalog FK **`warItemId`** on several line/ledger models — it refers to **`Item.id`** (historical naming). Lines use `uom` → `UnitOfMeasure`.

---

### Logs — three models, all append-only

**Never update or delete these records. Ever. Corrections are new compensating entries.**

Enforced at three levels:
1. No `updatedAt` field on any log model
2. Service layer has only `create` functions — no `update` or `delete`
3. DB-level triggers in production to reject UPDATE/DELETE

**UserActivityEntry (UAE)**: id, userId, actionType, entityType, entityId, metadata JSON?, warehouseId?, orderId?, orderType?, orderAssignmentId?, ipAddress?, notes?, createdAt

**BinOperationEntry (BOE)**: includes `warehouseId`, `userId`, `fromBinId?`, `toBinId?`, `warItemId` (Item id), `quantity`, `uom`, `type` (`BinOperationType`), `lotId?`, `serialNumberId?`, `orderId?`, `orderType?`, fiscal flags (`affectsFiscalStock`), reversal keys, optional `userActivityEntryId`, `boxId`, `notes`, `reasonCode`, `createdAt`

**ItemLedgerEntry (ILE)**: auto-increment `id`, `warehouseId`, `warItemId`, `quantityDelta`, `uom`, `eventType` (`FiscalInventoryEventType`), `lotId?`, `serialNumberId?`, `orderId?`, `orderType?`, `boeId?`, `performedByUserId?`, `reasonCode?`, `reference?`, `externalDocumentRef?`, `createdAt`

ILE semantics: append-only; tie-break and “when to write” rules belong in the service/entity layer (same intent as before: fiscal stock events vs pure bin reshuffles).

Log chain for every stock movement (single DB transaction):
1. UAE written first
2. BOE written (references UAE id)
3. ILE written if total stock changed (references BOE id)

---

### Alerts and notifications

**AlertRule**: id, type (LOW_STOCK/EXPIRY/BIN_CAPACITY), warehouseId, warItemId?, threshold, recipientRole

**Notification**: id, userId, type, title, body, entityType?, entityId?, isRead, createdAt

Low stock alert fires when WM signs off a completed order (not during execution). Expiry job runs daily at 02:00 via Vercel Cron.

---

## Key UAE action types

`LOGIN, LOGIN_FAILED, LOGOUT, TOKEN_REVOKED, USER_CREATED, USER_DEACTIVATED, ROLE_CHANGED, PIN_CHANGED, ZONE_ASSIGNMENT_CREATED, ZONE_ASSIGNMENT_REMOVED, ORDER_STARTED, ORDER_PAUSED, ORDER_RESUMED, LINE_HANDLED, LINE_FLAGGED_SHORT, ORDER_FLAGGED, ORDER_COMPLETED, ORDER_CANCELLED, BIN_BLOCKED, BIN_UNBLOCKED, LOT_QUARANTINED, LOT_RELEASED`

---

## Component architecture

~106 components total. Three top-level categories: Shared, Dashboard, Warehouse.

### Critical shared components

**ScanInput** (`components/shared/ScanInput.tsx`)
Most important floor component. Must handle:
- USB HID barcode scanners: fast keyboard input, auto-submits on Enter
- Camera QR mode on BYOD
Props: `placeholder, onScan, mode ('text'|'camera'), autoFocus, disabled`

**NumericKeypad** (`components/shared/NumericKeypad.tsx`)
Large-button on-screen number pad — not a native input. Touch-accurate on small/ruggedised screens.
Props: `value, onChange, onConfirm, maxLength, decimal (false for PIN — also masks value)`

**ExecutionStepper** (target design for order execution — implement when pick/receive flows land)
3-step state machine per order line:
1. Scan bin → 2. Scan item (+ lot/serial if tracked) → 3. Enter quantity + confirm

Must recover gracefully from network errors mid-execution:
- Show error → allow retry → never silently drop the scan
- The WW may have already physically moved the item when the error occurs

### Dashboard layout
`DashboardShell` composes **`DashboardSidebar`** and main content; **`DashboardHeader`** (via `LemonHeader`) sits in the shell. Nav items are defined on the sidebar — align new routes there when adding pages.

### Warehouse layout
**`WarehouseShell`** wraps floor pages with **`WarehouseHeader`**, collapsible **`WarehouseSidebar`**, and **`WarehouseFooter`** (via `PageWrapper`).

### Auth
`CredentialLoginForm`, `FloorLoginForm` (3-step: device code → badge scan → PIN — no keyboard after step 1), `SetupWizard` (onboarding: warehouse → zone/bin → first OM)

### Width requirements
- All warehouse components: **375px minimum**
- Dashboard: **768px minimum**

---

## Build phases

Build one phase at a time. Always confirm before moving to the next. Run `pnpm build` after each phase.

| Phase | Goal |
|---|---|
| **0 — Foundation** | Repo init, full Prisma schema, custom JWT auth (both flows), layouts, middleware, role redirect |
| **1 — Locations** | Warehouse/Zone/Bin CRUD, dashboard location UI, warehouse read views |
| **2 — Users** | User CRUD, role management, zone assignments, badge number generation |
| **3 — Items** | Item + categories, lot/serial APIs, item lookup on floor |
| **4 — Purchase Orders** | Full inbound: OM creates PO → WW receives → log chain fires → stock appears |
| **5 — Sales Orders** | Full outbound: OM creates SO → WW picks → stock decrements |
| **6 — Transfer Orders** | Internal moves, cross-warehouse, box tracking |
| **7 — Return Orders** | Customer returns, return dispositions |
| **8 — Adjustment Orders** | Stock corrections, reason codes, shrinkage |
| **9 — WM Signoff** | Order review, signoff flow, executed-with-problems |
| **10 — Reports & Logs** | UAE/BOE/ILE viewers, stock history, lot traceability, serial trace |
| **11 — Alerts** | Low stock, expiry warnings, in-app notification system |
| **12 — Polish** | Demo prep, onboarding flow, edge cases |

---

## Coding conventions

- **Server components by default** — `"use client"` only when required
- **All DB access through Prisma** via `lib/prisma.ts` singleton — never raw SQL in components
- **Entity modules for business logic** — `lib/entities/<domain>/`; API routes call these helpers, not ad-hoc Prisma in handlers (keep handlers thin)
- **Log chain in a single transaction** — UAE + BOE + ILE written atomically
- **Zod** for all input validation on both client and server
- **No `any` types** — TypeScript strict mode throughout
- **Soft deletes** (`deletedAt`) on most entities — hard deletes are rare and role-restricted
- Components under **200 lines** — split if larger
- Error boundaries on all major sections
- Loading skeletons on all async fetches
- shadcn/ui on dashboard only — warehouse components are custom

---

## Development commands

```bash
pnpm dev                                   # Dev server on port 3000
pnpm build                                 # Production build check
pnpm lint                                  # ESLint

# Prisma
pnpm exec prisma db push                   # Push schema to DB (common in dev)
pnpm exec prisma migrate dev --name <name> # Create and apply named migration
pnpm exec prisma generate                  # Regenerate client after schema changes
pnpm exec prisma studio                    # Visual DB browser (port 5555)

# Seeding
pnpm run seed:all                          # Runs bundled seed flow
pnpm run seed:users                        # Seed default users
pnpm run seed:warehouses                   # Seed default warehouse

# Tests
pnpm test                                  # Vitest (unit/component — limited suite)
```

### Seed credentials

| User | Email | Password | Badge | PIN | Role |
|---|---|---|---|---|---|
| Owner | owner@lemon-wms.local | owner1234 | USR-0001 | — | OWNER |
| Office Manager | office.manager@lemon-wms.local | manager1234 | USR-0002 | — | OFFICE_MANAGER |
| Office Worker | office.worker@lemon-wms.local | worker1234 | USR-0003 | — | OFFICE_WORKER |
| Warehouse Manager | — | — | USR-0004 | 1111 | WAREHOUSE_MANAGER |
| Warehouse Worker | — | — | USR-0005 | 2222 | WAREHOUSE_WORKER |

---

## Styling & design tokens

Tailwind CSS 4 with custom brand tokens defined as CSS variables in `src/app/globals.css`.

| Token | Value | Usage |
|---|---|---|
| `--color-brand-bg` | `#080e1f` | Page background (navy) |
| `--color-brand-surface` | `#0f172a` | Cards, panels (slate-900) |
| `--color-brand-border` | `#1e293b` | Borders |
| `--color-brand-text` | `#f1f5f9` | Primary text |
| `--color-brand-muted` | `#94a3b8` | Muted text |
| `--color-brand-subtle` | `#64748b` | Placeholder / subtle text |
| `--color-brand-primary` | `#4ade80` | Green — primary CTA |
| `--color-brand-primary-end` | `#059669` | Green gradient end |
| `--color-brand-accent` | `#fde047` | Yellow — accent/highlight |
| `--color-dash-bg` | dashboard variant | Dashboard background |
| `--color-dash-card` | dashboard variant | Dashboard card background |
| `--color-dash-muted` | dashboard variant | Dashboard muted text |

Use these CSS variables via Tailwind utilities. Do not hardcode hex colours inline.

---

## shadcn/ui setup (dashboard only)

```bash
npx shadcn@latest init
npx shadcn@latest add button input label card table badge
npx shadcn@latest add dialog sheet select checkbox alert-dialog
npx shadcn@latest add dropdown-menu navigation-menu separator
npx shadcn@latest add toast skeleton form tabs popover
npx shadcn@latest add avatar accordion tooltip switch textarea
```

---

## Current status

🟢 **Phase 0–3 — Mostly Complete. Ready for Phase 4 (Orders).**

### What is implemented

#### Phase 0 ✅ (Foundation)
- Full Prisma schema (~35 models): locations, `Item` / `BinStockItem`, parties (`BusinessParty`, `Address`, `ContactPerson`), `UnitOfMeasure`, users/devices, all five order types + lines, boxes, logs, alerts, `Error`, etc.
- Custom JWT auth — credential and badge+PIN flows
- Auth middleware — role-based routing and 403 guards
- **DashboardShell** (sidebar + header) and shared dashboard patterns (tables, record lists, info cards)
- **WarehouseShell** (header, sidebar, footer) for floor UX
- Login pages — dual-tab (credential + floor)
- Auth handlers — `/api/auth/login`, `/api/auth/floor/login`, `/api/auth/logout`, `/api/auth/refresh`
- GenericTable, factbox/form patterns, shared floor inputs (ScanInput, NumericKeypad)
- Zustand auth store; `pnpm run seed:all` / `seed:users` / `seed:warehouses`
- Entity configs under `src/components/configs/entities/` for implemented dashboard entities (warehouse, zone, bin, device, …)

#### Phase 1 ✅ (Locations)
- **Warehouses / Zones / Bins**: CRUD via dashboard APIs and list + create/detail flows on dashboard pages
- **Bins**: blocking/unblocking supported in domain layer where wired
- REST shape: collection `GET` + `POST`, item `GET` + **`PUT`** + `DELETE` under `/api/dashboard/warehouses`, `/zones`, `/bins` (and `[id]` segments)
- Floor **GET** `/api/warehouse` (and `/api/warehouse/home` re-export) for home payload; bin list/detail under `/api/warehouse/bins`

#### Phase 2 🟡 Partial (Users & Devices)
- **Users**: CRUD API under `/api/dashboard/users` and `/api/dashboard/users/[id]` (`GET`/`POST`/`PUT`/`DELETE`)
- **Devices**: `GET`/`POST` `/api/dashboard/devices` plus **`POST /api/dashboard/devices/[action]`** for authorize/deauthorize-style actions; **no `[id]` DELETE route** in `app/api` (adjust docs if soft-delete is added later)
- Dashboard **devices** page: list + authorize flow
- Dashboard **users** page: **stub** (placeholder copy)
- Warehouse assignments: schema + entities as applicable; **no dedicated assignments UI** yet

#### Phase 3 🟡 Partial (Items & stock)
- **Item**: CRUD API `/api/dashboard/items`, `/api/dashboard/items/[id]`
- **ItemCategory**, **Lot**, **SerialNumber**, **SerialNumberConfig**: in schema; not fully surfaced as standalone CRUD APIs in the same style as items unless added elsewhere
- **Stock dashboard**: **GET `/api/dashboard/stock`** + **`/dashboard/stock`** page (aggregated quantities across `BinStockItem`)
- Dashboard **`/dashboard/items`**: **placeholder** (reuses home-style warehouse overview — **not** item master-data UI)
- Floor **GET `/api/warehouse/items`** — item lookup; stock add **POST `/api/warehouse/stock/addtobin/[id]`**

#### Phases 4–9 🔴 Not Started (Orders)
- Schema fully defined for: PurchaseOrder, SalesOrder, TransferOrder, ReturnOrder, AdjustmentOrder (all with line items)
- No service functions, APIs, or UI pages yet
- Order home shows basic query of orders by status, but no creation/execution flows
- Order statuses and state machine defined, not enforced
- Order assignment/WM signoff not implemented

#### Phase 10–11 🔴 Not Started (Logs & Alerts)
- **UserActivityEntry, BinOperationEntry, ItemLedgerEntry**: Schema defined, models in Prisma
- Log chain transaction pattern defined, not implemented
- No APIs or viewers for logs
- **AlertRule, Notification**: Schema defined, models in Prisma
- No alert firing logic or notification system yet

#### Phase 12 🔴 Not Started (Polish)
- No demo prep, onboarding flow, or edge case handling yet

### API Summary

| Endpoint | Methods | Status | Notes |
|---|---|---|---|
| `/api/auth/*` | POST | ✅ | Login, floor login, logout, refresh |
| `/api/dashboard/warehouses`, `.../[id]` | GET, POST; GET, PUT, DELETE | ✅ | Office warehouse CRUD |
| `/api/dashboard/zones`, `.../[id]` | GET, POST; GET, PUT, DELETE | ✅ | Zone CRUD |
| `/api/dashboard/bins`, `.../[id]` | GET, POST; GET, PUT, DELETE | ✅ | Bin CRUD |
| `/api/dashboard/users`, `.../[id]` | GET, POST; GET, PUT, DELETE | ✅ | User CRUD |
| `/api/dashboard/devices`, `/api/dashboard/devices/[action]` | GET, POST; POST | ✅ | List/create devices; authorize/deauthorize via `[action]` |
| `/api/dashboard/items`, `.../[id]` | GET, POST; GET, PUT, DELETE | ✅ | Item CRUD |
| `/api/dashboard/home` | GET | ✅ | Aggregates for dashboard home UI |
| `/api/dashboard/stock` | GET | ✅ | Stock dashboard aggregates |
| `/api/warehouse`, `/api/warehouse/home` | GET | ✅ | Floor home (re-export) |
| `/api/warehouse/bins`, `.../[id]` | GET | ✅ | Floor bin list / detail |
| `/api/warehouse/items` | GET | ✅ | Floor item lookup |
| `/api/warehouse/stock/addtobin/[id]` | POST | ✅ | Add stock to bin |
| `/api/logs` | GET | 🔴 | Stub |
| `/api/errors` | POST | ✅ | Persisted client/server errors |
| `/api/seed/users` | GET | ✅ | Dev seeding only |
| Order APIs | — | 🔴 | No dedicated order route handlers yet (schema only) |

### Dashboard Pages

| Page | Status | Notes |
|---|---|---|
| `/dashboard` | ✅ | Home — warehouses/zones/bins overview (`/api/dashboard/home`) |
| `/dashboard/stock` | ✅ | Stock totals and per-SKU table |
| `/dashboard/warehouses` | ✅ | List, create, view |
| `/dashboard/zones` | ✅ | List, create, view, filter by warehouse |
| `/dashboard/bins` | ✅ | List, create, view |
| `/dashboard/items` | 🟡 | Placeholder (not item master UI) |
| `/dashboard/users` | 🔴 | Stub |
| `/dashboard/devices` | ✅ | List, authorize/deauthorize |

### Warehouse Pages

| Page | Status | Notes |
|---|---|---|
| `/warehouse` | ✅ | Home: zone/bin inventory, order pool |
| `/warehouse/bins/[id]` | ✅ | Bin detail (floor-side) |
| `/warehouse/orders/*` | 🔴 | Not yet implemented |
| `/warehouse/zones/*` | 🔴 | Not yet implemented |

### Next: Phase 4 — Purchase Orders
Implement PO creation (dashboard), receiving flow (floor), and log chain (UAE → BOE → ILE).
