# Lemon WMS — Architecture

This document is the authoritative reference for how Lemon WMS is structured.
It is written for both human developers and AI coding agents. Every structural
decision made in this codebase has a reason. When in doubt, read this first.

---

## What this system is

A Warehouse Management System. It manages the physical movement of stock through
a warehouse: receiving goods in, storing them, picking them for orders, shipping
them out, and tracking everything that happens in between with an immutable audit log.

It has two completely separate interfaces sharing one Next.js codebase:

- **Dashboard** (`/dashboard`) — office side. Owners, Office Managers, Office Workers.
Built with shadcn/ui. Used on desktop or tablet from a desk.
- **Warehouse floor** (`/warehouse`) — floor side. Warehouse Managers, Warehouse Workers.
Built with custom minimal components. Used on ruggedized terminals and BYOD phones
at 375px minimum width. Large touch targets. Monospace fonts. Dark background.
Optimised for people wearing gloves who cannot misread an error.

These two interfaces are not themes — they are different products with different
interaction models that happen to share a database and a business logic layer.

---

## Stack


| Concern                | Decision                                         |
| ---------------------- | ------------------------------------------------ |
| Framework              | Next.js App Router                               |
| Language               | TypeScript — strict mode, no implicit any        |
| Styling                | Tailwind CSS — no inline styles, no CSS files    |
| Components (dashboard) | shadcn/ui                                        |
| Components (floor)     | Custom minimal — see FLOOR-TERMINAL-AESTHETIC.md |
| Database               | PostgreSQL via Prisma ORM                        |
| Auth                   | Custom JWT — two separate flows                  |
| Auth state             | Zustand (`useAuthStore`)                         |
| HTTP client            | Axios — three typed instances                    |
| Server state           | Custom hooks — `useState` + `useEffect` + Axios  |
| Validation             | Zod — every API route, every form                |
| Deployment             | Vercel + Neon (PostgreSQL)                       |


There is no React Query. Server state is managed with custom hooks. See DATA-LAYER.md
for the full contract on how hooks, components, and API routes fit together.

---

## Domains

The system is divided into eight domains. Every file in this codebase belongs to
exactly one domain. Domain names are consistent across every layer.


| Domain      | Prisma file        | Covers                                                |
| ----------- | ------------------ | ----------------------------------------------------- |
| `iam`       | `iam.prisma`       | User, Device, RefreshToken, WarehouseAssignment       |
| `locations` | `locations.prisma` | Warehouse, Zone, Bin                                  |
| `parties`   | `parties.prisma`   | BusinessParty, ContactPerson, Address                 |
| `catalog`   | `catalog.prisma`   | Item, ItemCategory, UnitOfMeasure, SerialNumberConfig |
| `stock`     | `stock.prisma`     | BinStockItem, Lot, SerialNumber, Box, BoxLine         |
| `orders`    | `orders.prisma`    | All 5 order types, their lines, OrderAssignment       |
| `logs`      | `logs.prisma`      | UserActivityEntry, BinOperationEntry, ItemLedgerEntry |
| `system`    | `system.prisma`    | Notification, Error, AlertRule                        |


`_base.prisma` contains the generator, datasource, and **all enums**. Enums are
never scattered into domain files because they are referenced across domain boundaries.

---

## Folder structure

```
lemon-wms/
├── prisma/
│   └── schema/
│       ├── _base.prisma
│       ├── iam.prisma
│       ├── locations.prisma
│       ├── parties.prisma
│       ├── catalog.prisma
│       ├── stock.prisma
│       ├── orders.prisma
│       ├── logs.prisma
│       └── system.prisma
│
└── src/
    ├── middleware.ts                  # Next.js middleware — auth guard + role redirect
    │
    ├── lib/                           # Server-only. Never imported by client components.
    │   ├── prisma.ts                  # Prisma client singleton
    │   ├── auth/                      # Auth infrastructure — not a domain
    │   │   ├── jwt.ts                 # signToken, verifyToken, refreshAccessToken
    │   │   ├── session.ts             # Cookie helpers, token persistence
    │   │   └── withAuth.ts            # Route wrapper — validates token, injects session
    │   ├── iam/
    │   │   ├── users.ts
    │   │   ├── devices.ts
    │   │   └── assignments.ts
    │   ├── locations/
    │   │   ├── warehouses.ts
    │   │   ├── zones.ts
    │   │   └── bins.ts
    │   ├── parties/
    │   │   └── parties.ts
    │   ├── catalog/
    │   │   ├── items.ts
    │   │   ├── categories.ts
    │   │   └── serials.ts
    │   ├── stock/
    │   │   ├── bin-stock.ts
    │   │   └── lots.ts
    │   ├── orders/
    │   │   ├── purchase.ts
    │   │   ├── sales.ts
    │   │   ├── transfer.ts
    │   │   ├── return.ts
    │   │   └── adjustment.ts
    │   ├── logs/
    │   │   └── log.service.ts         
    │   └── system/
    │       ├── notifications.ts
    │       └── alerts.ts
    │
    ├── lib/axios.ts                   # Three Axios instances — sharedApi, dashboard, warehouse
    │
    ├── app/
    │   ├── (auth)/
    │   │   ├── login/page.tsx         # Credential login — office side
    │   │   └── floor/page.tsx         # Badge + PIN login — floor side
    │   │
    │   ├── (dashboard)/               # Office side — OWNER, OFFICE_MANAGER, OFFICE_WORKER
    │   │   ├── layout.tsx
    │   │   ├── page.tsx
    │   │   ├── warehouses/
    │   │   ├── users/
    │   │   ├── items/
    │   │   ├── orders/
    │   │   │   ├── purchase/
    │   │   │   ├── sales/
    │   │   │   ├── transfer/
    │   │   │   ├── return/
    │   │   │   └── adjustment/
    │   │   └── reports/
    │   │
    │   ├── (warehouse)/               # Floor side — OWNER, WAREHOUSE_MANAGER, WAREHOUSE_WORKER
    │   │   ├── layout.tsx
    │   │   ├── page.tsx               # Order pool
    │   │   ├── zones/
    │   │   ├── orders/
    │   │   └── items/
    │   │
    │   └── api/                       # API routes — flat resource naming, not domain naming
    │       ├── auth/
    │       │   ├── login/route.ts
    │       │   ├── floor/login/route.ts
    │       │   ├── refresh/route.ts
    │       │   └── logout/route.ts
    │       ├── warehouses/[id]/
    │       ├── zones/[id]/
    │       ├── bins/[id]/
    │       ├── users/[id]/
    │       ├── devices/
    │       ├── items/[id]/
    │       ├── categories/
    │       ├── lots/[id]/
    │       ├── orders/
    │       │   ├── purchase/
    │       │   ├── sales/
    │       │   ├── transfer/
    │       │   ├── return/
    │       │   └── adjustment/
    │       ├── logs/
    │       └── notifications/
    │
    ├── components/
    │   ├── shared/                    # Used by both dashboard and floor
    │   │   ├── ConfirmDialog.tsx
    │   │   ├── ReasonDialog.tsx
    │   │   ├── EmptyState.tsx
    │   │   ├── LoadingSkeleton.tsx
    │   │   ├── ErrorBanner.tsx
    │   │   └── PageHeader.tsx
    │   │
    │   ├── dashboard/                 # Office-side components — shadcn/ui
    │   │   ├── layout/
    │   │   ├── warehouses/
    │   │   │   ├── WarehouseList.tsx
    │   │   │   ├── WarehouseCard.tsx
    │   │   │   ├── WarehouseForm.tsx
    │   │   │   ├── use-warehouses.ts  # Hook colocated with its component cluster
    │   │   │   └── types.ts
    │   │   ├── zones/
    │   │   ├── bins/
    │   │   ├── users/
    │   │   ├── items/
    │   │   └── orders/
    │   │
    │   └── warehouse/                 # Floor-side components — custom minimal
    │       ├── layout/
    │       ├── home/
    │       │   ├── WarehouseHomePageView.tsx
    │       │   └── use-warehouse-home.ts
    │       ├── zones/
    │       ├── orders/
    │       └── items/
    │
    ├── hooks/
    │   └── auth/
    │       └── use-auth.ts            # Derives auth state from Zustand store
    │
    └── types/                         # Cross-layer shared types ONLY
        ├── api.ts                     # ApiResponse<T> envelope, error shape
        ├── auth.ts                    # AuthUser, AuthLocation, AuthDevice, AuthContext
        └── shared.ts                  # Enums reused across client and server
```

---

## The client/server boundary

`lib/` is server-only. It contains Prisma calls, business logic, and auth utilities.
It must never be imported by a client component.

`components/` is client-side. Hooks live here, next to the components that use them.
They call API routes via Axios — they never call `lib/` functions directly.

`app/api/` is the boundary. API route handlers call `lib/` functions. Components call
API routes via Axios. This is the only bridge between client and server.

```
components/ → Axios → app/api/ → lib/ → prisma → database
```

If you find yourself importing from `lib/` inside a component, stop. You are
crossing the client/server boundary incorrectly.

---

## API route rules

API routes are named after resources, not domains. The internal domain grouping in
`lib/` does not leak into URLs.

**Correct:** `GET /api/warehouses`, `POST /api/zones`, `PATCH /api/bins/:id/block`
**Wrong:** `GET /api/locations/warehouses`, `POST /api/locations/zones`

Every API route handler does exactly three things and nothing else:

1. Call `withAuth(req, roles)` to validate the token and check the role
2. Parse and validate the request body with Zod
3. Call the appropriate `lib/domain/file.ts` function and return the result

Every response is wrapped in `ApiResponse<T>`. See DATA-LAYER.md for the shape.

Business logic does not live in route handlers. Validation does not live in
service functions. These responsibilities do not move.

---

## Authentication

Two completely separate login flows share the same JWT structure.

**Credential flow** (office side):

- `POST /api/auth/login` — email + password
- Returns `accessToken` stored in localStorage + Zustand store
- Returns `refreshToken` in an httpOnly cookie only — never exposed to JS

**Badge/PIN flow** (floor side):

- `POST /api/auth/floor/login` — badgeNumber + PIN + deviceCode
- Device code resolves to `Device → zoneId + warehouseId`
- JWT payload includes `zoneId` and `warehouseId` — floor workers never select their zone
- Floor context (warehouseId, zoneId, deviceId) stored in Zustand + sessionStorage

**JWT payload:**

```typescript
{
  sub: userId,
  role: Role,
  warehouseId?: string,
  zoneId?: string,
  deviceId?: string,
  iat: number,
  exp: number
}
```

**Token storage:**

- Access token: localStorage + Zustand store (readable by Axios interceptors)
- Refresh token: httpOnly cookie (readable by server only, never by JS)
- Floor context: sessionStorage + Zustand store (cleared on tab close)

Decision note: access tokens intentionally remain in localStorage for this project version.
This favors UX continuity across reloads and browser restarts over stricter XSS resistance.

`withAuth(req, allowedRoles)` is the route wrapper. It validates the token,
checks the role, and injects the session into the handler. Every API route uses it.
No route is ever unprotected except the auth routes themselves.

**Axios instances** inject context headers automatically based on which client is used:

- `sharedApi` — `Authorization: Bearer {token}`
- `dashboardApiClient` — above + `x-user-id`, `x-user-role`
- `warehouseApiClient` — above + `x-warehouse-id`, `x-zone-id`, `x-device-id`

Token refresh is handled automatically by the Axios response interceptor. If a
401 is received, one refresh attempt is made. Concurrent requests during refresh
share a single refresh promise — they do not each trigger a separate refresh call.
On refresh failure, `clearAuth()` is called and the user is redirected to login.

---

## The log layer

`lib/logs/log.service.ts` is the most critical file in the codebase.

The three log models — `UserActivityEntry` (UAE), `BinOperationEntry` (BOE),
`ItemLedgerEntry` (ILE) — always write together in a single Prisma transaction.
They never write alone.

**Write order:** UAE → BOE → ILE (when fiscal stock is affected)

**The rules:**

1. `log.service.ts` is the ONLY file that writes to UAE, BOE, or ILE tables.
2. Every stock movement calls `log.service.ts` — it is never called from a route handler.
3. No row in UAE, BOE, or ILE is ever updated or deleted. Mistakes are corrected
  with compensating entries (opposite quantityDelta). Both entries are preserved.
4. Timestamps are set by the database (`@default(now())`), never by the application.
5. Current stock = `SUM(quantityDelta)` from ILE filtered by warehouseId + warItemId.
  There is no snapshot field. The ledger is the source of truth.

The ILE↔BOE circular reference is resolved by pre-generating both UUIDs before
the transaction begins, then inserting both simultaneously.

---

## Order status machine

All five order types share the same status machine:

```
DRAFT → CONFIRMED → RELEASED → EXECUTING ⇄ PAUSED
                                    ↓
                          EXECUTED | EXECUTED_WITH_PROBLEMS
                                    ↓
                               SIGNED_OFF
```

`CANCELLED` is reachable from any status before `EXECUTED`. Cancellation after
`EXECUTING` requires a compensating BOE to reverse any stock already moved.

When an order closes as `EXECUTED_WITH_PROBLEMS`, the WM can trigger a split:

- `/1` child: `COMPLETED` status — the portion that was handled
- `/2` child: `DRAFT` status — the remainder, re-enters OM workflow

---

## Coding conventions

**TypeScript:**

- Strict mode. No `any`. No type assertions without a comment explaining why.
- Functional only — no classes anywhere.
- Explicit return types on all functions in `lib/`.
- Named exports only — no default exports except Next.js page/layout components.

**React components:**

- Props interface declared above the component, never inline.
- Component file = one component. No multi-component files.
- Hooks colocate with their nearest consumer component. Promoted to shared only
when actually used from two or more different locations.
- Every component consuming a data hook handles loading, error, and data states.

**Naming:**

- Files: `kebab-case.ts`
- Components: `PascalCase.tsx`
- Hooks: `use-kebab-case.ts` (file), `useCamelCase` (export)
- Types: `PascalCase`
- Functions: `camelCase`
- Database IDs: always `string` (UUID)

**Prisma:**

- Never expose raw Prisma objects to API responses. Map to typed shapes.
- `select` only accepts `true` — never a dynamic boolean.
- Soft deletes only — never `.delete()` on models with `deletedAt`.
- All stock writes go through `log.service.ts`.

**Commit messages:**

```
feat: add purchase order claiming endpoint
fix: correct FIFO stamping on partial receipts
change: rename warItemId to itemId on BinStockItem
```

---

## What is out of scope for MVP

- Box model: schema exists, no API, no UI, no service logic
- Real-time: polling via interval in hooks — no WebSockets
- Email notifications: in-app Notification model only
- CSV import/export
- External ERP API
- Dark mode
- Multi-tenancy
- Audit log export
- PDF label printing

