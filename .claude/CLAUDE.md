# Lemon WMS — Claude Code Guide

## Project name
Lemon WMS

## What this is
A full-featured Warehouse Management System with two distinct sides:
- **Office side** (`/dashboard`) — used by Owner, Office Manager, Office Worker on desktop
- **Floor side** (`/warehouse`) — used by Warehouse Manager and Warehouse Worker on tablets/ruggedised terminals

Both sides are in the same Next.js app (monorepo). They share the database and API layer but have completely separate layouts, UX patterns, and component libraries.

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
| HTTP client | Axios (`lib/axios.ts`) |
| API | Next.js API routes in `src/app/api/` |
| Real-time | React Query polling — no WebSockets for MVP |
| Package manager | pnpm 10.29.3 |
| Deployment | Vercel + managed Postgres (Neon or Supabase) |
| Testing | None for MVP |

---

## Repo structure

```
lemon-wms/
├── prisma/
│   ├── schema.prisma                   # 31 models, fully defined
│   └── migrations/                     # Empty — use `npx prisma db push` in dev
├── seed/
│   ├── seed-users.ts                   # Entry point: npm run seed:users
│   └── seed-warehouses.ts             # Entry point: npm run seed:warehouses
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
│   │   │       ├── page.tsx            # Home stub
│   │   │       ├── warehouses/page.tsx
│   │   │       ├── zones/page.tsx      # (stub)
│   │   │       ├── items/page.tsx      # (stub)
│   │   │       └── users/             # (planned)
│   │   ├── (warehouse)/                # Floor side — WM, WW
│   │   │   ├── layout.tsx              # WarehouseShell wrapper
│   │   │   └── warehouse/
│   │   │       ├── page.tsx            # Order pool home
│   │   │       ├── orders/             # (planned)
│   │   │       └── zones/              # (planned)
│   │   └── api/
│   │       ├── auth/
│   │       │   ├── login/route.ts      # ✅ Credential flow
│   │       │   ├── floor/login/route.ts # ✅ Badge/PIN flow
│   │       │   ├── logout/route.ts     # ✅
│   │       │   └── refresh/route.ts    # ✅
│   │       ├── warehouses/route.ts     # ✅ GET + POST
│   │       ├── zones/route.ts          # ✅ GET
│   │       ├── logs/route.ts           # stub
│   │       └── seed/users/route.ts     # ✅ GET (dev only)
│   ├── components/
│   │   ├── ui/                         # shadcn/ui components
│   │   ├── shared/                     # Both sides (ScanInput, NumericKeypad, etc.)
│   │   ├── dashboard/                  # DashboardShell, Sidebar, Header, MetricCard
│   │   ├── warehouse/                  # WarehouseShell
│   │   ├── auth/                       # CredentialLoginForm, FloorLoginForm
│   │   ├── tables/                     # GenericTable, CheckboxTable
│   │   ├── factbox/                    # GenericFactbox (detail/read-only view)
│   │   ├── inputs/                     # FormInputs, DateInput
│   │   └── typography/                 # LemonHeader
│   ├── lib/
│   │   ├── prisma.ts                   # Prisma singleton (PrismaPg adapter)
│   │   ├── axios.ts                    # Axios instance
│   │   ├── utils.ts                    # Utility helpers
│   │   ├── auth/
│   │   │   ├── jwt.ts                  # signAccessToken, verifyToken
│   │   │   ├── session.ts              # Cookie helpers, token hashing, refresh token
│   │   │   ├── middleware.ts           # isOfficeRole, isFloorRole guards
│   │   │   └── store.ts                # Zustand auth state store
│   │   ├── entities/                   # Business logic — one folder per domain
│   │   │   ├── warehouses/
│   │   │   │   ├── create-warehouse.ts
│   │   │   │   └── get-warehouses.ts
│   │   │   └── zones/
│   │   │       └── get-zones.ts
│   │   ├── components/
│   │   │   └── configs/entities/       # Form/table/factbox configs per entity
│   │   │       ├── warehouse/          # schema, types, config
│   │   │       ├── zone/
│   │   │       ├── user/
│   │   │       ├── bin/
│   │   │       ├── device/
│   │   │       └── forms/
│   │   ├── seeding/
│   │   │   ├── users.ts                # 5 seed users (owner, manager, workers)
│   │   │   └── warehouses.ts          # 1 seed warehouse
│   │   └── utils/
│   │       └── get-value-by-path.ts
│   ├── middleware.ts                    # Auth guard + role-based redirect
│   ├── types/
│   │   ├── index.ts                    # Re-exports + AuthUser, JWTPayload
│   │   ├── models/                     # Role, LoginType, etc.
│   │   ├── responses/                  # API response shapes
│   │   └── components/                 # Table, form, factbox prop types
│   └── generated/
│       └── prisma/                     # @prisma/client (auto-generated — do not edit)
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
Warehouse → Zone → Bin → BinItem
```

**Warehouse**: id (UUID), name, address, timezone (IANA), currency (ISO 4217), status (ACTIVE/INACTIVE/ARCHIVED), createdById, deletedAt
- Only Owner can create or archive
- Cannot archive if open orders exist
- Never hard-deleted

**Zone**: id, warehouseId, name, type enum, customPermissions JSON?, isActive, defaultReceivingBinId?, defaultQuarantineBinId?, defaultOutgoingBinId?, deletedAt

**Bin**: id, zoneId, warehouseId, name, code (unique), type enum, isBlocked, blockReason?, maxWeightKg?, maxVolumeM3?, deletedAt

**BinItem**: id, binId, warItemId, lotId?, serialNumberId?, quantityAvailable, quantityReserved, quantityBlocked, uom, status (AVAILABLE/RESERVED/BLOCKED/IN_TRANSIT), expiryDate?

BinItem quantity semantics:
- `quantityAvailable` — free to pick or reserve
- `quantityReserved` — committed to open order, still physically in bin
- `quantityBlocked` — quarantine or hold, cannot be picked or reserved
- Effective pickable = `quantityAvailable - quantityReserved`

Unique indexes on BinItem:
- LOT-tracked: `(binId, warItemId, lotId)`
- SERIAL-tracked: `(binId, warItemId, serialNumberId)`
- NONE/FIFO: `(binId, warItemId)` where lotId IS NULL and serialNumberId IS NULL

---

### Users

**User**: id, email?, passwordHash?, badgeNumber (USR-XXXX, immutable), pinHash?, role, loginType (CREDENTIAL/BADGE_PIN/BOTH), isActive, deletedAt
- Badge numbers generated from SerialNumberConfig for entity type USER
- Format: USR-{####}, starting at 0001, incremental, never reused

**RefreshToken**: id, userId, tokenHash (never raw), deviceLabel, deviceId?, expiresAt, revokedAt?
- When user deactivated → all their refresh tokens revoked immediately

**Device**: id, name, code (unique), warehouseId, zoneId (unique — one per zone), isActive, registeredAt, lastSeenAt

**WarehouseAssignment**: id, userId, warehouseId, zoneId?
- `zoneId = null` means WM-level assignment (access to all zones in warehouse)
- Unique constraint: `(userId, warehouseId, zoneId)`

---

### Items

**WARItem** (Warehouse Item): id, sku (unique), name, description, barcode?, categoryId, trackingMode (NONE/LOT/SERIAL/FIFO), uom, weightKg?, dimensions JSON?, minQuantity, isActive, supplierId?, deletedAt
- trackingMode change blocked if any stock exists

**ItemCategory**: id, name, handlingFlags JSON (e.g. PERISHABLE, FRAGILE, HAZMAT)

Tracking modes:
| Mode | Behaviour |
|---|---|
| `NONE` | Fungible. No lot or serial. Simple qty. |
| `LOT` | Batch tracked. BinItem has lotId. Lot created at PO receiving. |
| `SERIAL` | Each unit unique. BinItem has serialNumberId. qty always 1. |
| `FIFO` | Fungible, first-in-first-out. Ordered by BinItem.createdAt at query time. |

---

### Lots

**Lot**: id, lotNumber (unique), warItemId, purchaseOrderId?, receivedDate, expiryDate?, status (ACTIVE/QUARANTINE/EXPIRED/CONSUMED)

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

**SerialNumber**: id, serial (unique), configId, entityType, baseValue, partialCurrent?, partialTotal?, status (IN_STOCK/SHIPPED/RETURNED/SCRAPPED), warItemId?

**SerialNumberConfig**: id, entityType enum (ITEM/BOX/BOX_LINE/PALLET/ORDER/ORDER_LINE/USER), prefix?, format, lastValue, incrementBy, mode (INCREMENTAL/PARTIAL), warItemId?, warehouseId?

Generation requires row-level lock on config to prevent duplicate base values. Two modes:
- **Incremental**: one serial per call, lastValue += incrementBy
- **Partial**: N serials sharing one baseValue, e.g. `BL-0001 1/5` through `BL-0001 5/5`

---

### Boxes

**Box**: id, code (unique), status (OPEN/SEALED/IN_TRANSIT/RECEIVED/SHIPPED/SCRAPPED), binId?, warehouseId, weightKg?, notes?

**BoxLine**: id, boxId, warItemId, quantity, lotId?, serialNumberId?, uom

A box can contain items from multiple lots. A lot can span multiple boxes. No direct FK between Box and Lot — navigate via BoxLine.lotId.

---

### Orders — five types, separate tables

All order types share these base fields:
`id, reference (auto-generated e.g. PO-2025-0001), status, priority (NORMAL/URGENT/EXPRESS), warehouseId, notes, currentWorkerId, parentOrderId, splitIndex, cancelledById, cancelledAt, cancellationReason, createdById, confirmedById, confirmedAt, assignedWMId, deletedAt`

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

Each has corresponding line model (e.g. PurchaseOrderLine): warItemId, binId, baseQuantity, handledQuantity, isShort, lotId?, serialNumberId?, uom

---

### Logs — three models, all append-only

**Never update or delete these records. Ever. Corrections are new compensating entries.**

Enforced at three levels:
1. No `updatedAt` field on any log model
2. Service layer has only `create` functions — no `update` or `delete`
3. DB-level triggers in production to reject UPDATE/DELETE

**UserActivityEntry (UAE)**: id, userId, actionType, entityType, entityId, metadata JSON?, warehouseId?, orderId?, orderType?, ipAddress?, notes?, createdAt

**BinOperationEntry (BOE)**: id, userId, fromBinId?, toBinId, warItemId, quantity, lotId?, serialNumberId?, orderId?, orderType?, uaeId, createdAt

**ItemLedgerEntry (ILE)**: id, warehouseId, warItemId, entryType (INBOUND/OUTBOUND/ADJUSTMENT/TRANSFER), quantityChange, lotId?, serialNumberId?, orderId?, orderType?, boeId, createdAt

ILE only fires when total warehouse stock changes. Internal bin-to-bin moves within the same warehouse do NOT generate an ILE.

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

**ExecutionStepper** (most complex component overall)
3-step state machine per order line:
1. Scan bin → 2. Scan item (+ lot/serial if tracked) → 3. Enter quantity + confirm

Must recover gracefully from network errors mid-execution:
- Show error → allow retry → never silently drop the scan
- The WW may have already physically moved the item when the error occurs

### Dashboard layout
`DashboardLayout`, `DashboardSidebar` (collapsible, role-aware — hides inaccessible links), `DashboardTopBar` (logo, title, NotificationBell, avatar dropdown)

Sidebar links: Dashboard, Warehouses, Items, Orders (PO/SO/TO/RO/AO), Users, Reports

### Warehouse layout
`WarehouseLayout` (minimal full-screen, large typography), `WarehouseBottomNav` (4 large touch-target buttons: Pool, Zone, Items, Notifications)

### Auth
`CredentialLoginForm`, `FloorLoginForm` (3-step: device code → badge scan → PIN — no keyboard after step 1), `SetupWizard` (onboarding: warehouse → zone/bin → first OM)

### Width requirements
- All warehouse components: **375px minimum**
- Dashboard: **768px minimum**

---

## Build phases

Build one phase at a time. Always confirm before moving to the next. Run `npm run build` after each phase.

| Phase | Goal |
|---|---|
| **0 — Foundation** | Repo init, full Prisma schema, custom JWT auth (both flows), layouts, middleware, role redirect |
| **1 — Locations** | Warehouse/Zone/Bin CRUD, dashboard location UI, warehouse read views |
| **2 — Users** | User CRUD, role management, zone assignments, badge number generation |
| **3 — Items** | WARItem + categories, lot API, serial number API, item lookup on floor |
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
- **Services layer for all business logic** — API routes call services, never DB directly
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
npx prisma db push                         # Push schema to DB (no migration file — use in dev)
npx prisma migrate dev --name <name>       # Create and apply named migration
npx prisma generate                        # Regenerate client after schema changes
npx prisma studio                          # Visual DB browser (port 5555)

# Seeding
npm run seed:users                         # Seed 5 default users (owner → warehouse worker)
npm run seed:warehouses                    # Seed 1 default warehouse
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

🟢 **Phase 0 — Complete.**

### What is implemented
- Full Prisma schema (31 models) — pushed to DB via `npx prisma db push`
- Custom JWT auth — both credential and badge+PIN flows
- Auth middleware — role-based routing and 403 guards
- Dashboard shell (`/dashboard`) with sidebar, header, and metric card components
- Warehouse shell (`/warehouse`) with full-screen layout
- Login page — dual-tab (credential + floor)
- Warehouse list page (`/dashboard/warehouses`) — basic GET/POST
- Zones list API (`GET /api/zones`)
- Auth API routes — login, floor login, logout, refresh
- GenericTable, GenericFactbox, DynamicForm component system
- ScanInput and NumericKeypad shared components
- Zustand auth store
- Seed scripts for users and warehouses
- Entity configs for warehouse, zone, user, bin, device

### What is NOT yet implemented (Phase 1+)
- Bin CRUD (Phase 1)
- User CRUD, zone assignments (Phase 2)
- WARItem, ItemCategory, Lot, SerialNumber APIs (Phase 3)
- All five order types and execution flows (Phases 4–9)
- Log chain (UAE → BOE → ILE atomic transactions)
- Alert rules and in-app notifications (Phase 11)
- Reports and traceability views (Phase 10)

### Next: Phase 1 — Locations
Warehouse/Zone/Bin CRUD with dashboard UI and warehouse read views.
