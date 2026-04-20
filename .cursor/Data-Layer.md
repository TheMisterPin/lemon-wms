# Lemon WMS — Data Layer

This document defines how data moves between the server and the client in Lemon WMS.
Every hook, every API route, and every component that fetches data must follow these rules.
There are no exceptions. When these rules conflict with a pattern you have seen elsewhere,
these rules win.

---

## The stack

- **HTTP client:** Axios — three typed instances (`sharedApi`, `dashboardApiClient`, `warehouseApiClient`)
- **Server state:** Custom hooks — `useState` + `useEffect` + Axios
- **Auth state:** Zustand (`useAuthStore`)
- **No React Query.** Do not install it. Do not suggest it.

---

## The response envelope

Every API route returns the same shape. No exceptions.

```typescript
// src/types/api.ts

export type ApiResponse<T = null> =
  | { success: true; data: T }
  | { success: false; error: string; code?: string }
```

A successful response always has `success: true` and `data`.
A failed response always has `success: false` and `error` (human-readable message).
`code` on failures is a machine-readable error code for the client to act on — e.g.
`"INSUFFICIENT_STOCK"`, `"ORDER_ALREADY_CLAIMED"`, `"BIN_BLOCKED"`.

**Never return a bare object from an API route.** Never return `{ data: [...] }` without
the `success` field. Never return a naked array. Always use `ApiResponse<T>`.

```typescript
// Correct — success case
return NextResponse.json({ success: true, data: warehouse } satisfies ApiResponse<Warehouse>)

// Correct — error case
return NextResponse.json(
  { success: false, error: 'Warehouse not found', code: 'NOT_FOUND' } satisfies ApiResponse,
  { status: 404 }
)

// Wrong — naked object
return NextResponse.json({ warehouse })

// Wrong — naked array
return NextResponse.json(warehouses)
```

---

## API route rules

### Structure

Every route handler does exactly three things:

```typescript
export async function GET(req: NextRequest): Promise<NextResponse> {
  // 1. Auth
  const session = await withAuth(req, ['OWNER', 'OFFICE_MANAGER'])
  if (!session) {
    return NextResponse.json(
      { success: false, error: 'Unauthorized' } satisfies ApiResponse,
      { status: 401 }
    )
  }

  // 2. Validate (POST/PATCH only — parse body with Zod)
  // GET requests validate query params here if needed

  // 3. Call lib and return
  const result = await getWarehouses(session.warehouseId)
  return NextResponse.json({ success: true, data: result } satisfies ApiResponse<typeof result>)
}
```

No business logic in route handlers. No Prisma calls. No conditionals beyond auth and
validation. If you are writing more than ~30 lines in a route handler, something is wrong —
the logic belongs in `lib/`.

### HTTP status codes

Use these consistently. Do not invent new ones.

| Situation | Status |
|---|---|
| Success (read) | 200 |
| Success (created) | 201 |
| Validation failed (Zod) | 422 |
| Unauthorized (no/bad token) | 401 |
| Forbidden (wrong role) | 403 |
| Not found | 404 |
| Conflict (duplicate, claimed, etc.) | 409 |
| Server error | 500 |

### What goes in headers vs body

**Request headers** (injected automatically by Axios clients — never set manually):
- `Authorization: Bearer {token}` — all authenticated routes
- `x-user-id`, `x-user-role` — dashboard and warehouse routes
- `x-warehouse-id`, `x-zone-id`, `x-device-id` — warehouse routes only

**Request body** (POST/PATCH/PUT only):
- The resource being created or the fields being updated.
- Never put auth context (userId, warehouseId, zoneId) in the body. Read it from
  the session injected by `withAuth`, not from what the client sends.

**Why:** A client that sends `{ warehouseId: "some-other-warehouse" }` in the body
could access data it should not. The session is the source of truth for scope.

### Pagination

List endpoints that can return more than ~50 rows support pagination.

```typescript
// Query params
GET /api/orders/purchase?page=0&pageSize=20&status=RELEASED

// Response shape
type PaginatedResponse<T> = {
  items: T[]
  total: number
  page: number
  pageSize: number
}

// Wrapped in the envelope
ApiResponse<PaginatedResponse<PurchaseOrder>>
```

`page` is zero-indexed. `pageSize` defaults to 20, max 100. The client is responsible
for passing these. The hook is responsible for tracking the current page.

---

## Hook rules

### The minimum contract

Every data-fetching hook must return at minimum:

```typescript
type HookReturn<T> = {
  data: T | null       // null until first successful fetch
  isLoading: boolean   // true from mount until first response (success or error)
  error: string | null // human-readable error message, null when no error
  refetch: () => void  // triggers a fresh fetch, resets error, sets isLoading
}
```

A hook that does not return all four is incomplete. `isLoading` and `error` are not
optional. The component needs them to render correctly in all three states.

### The standard fetch hook pattern

```typescript
'use client'

import { useCallback, useEffect, useState } from 'react'

import { warehouseApiClient } from '@/lib/axios'
import type { ApiResponse } from '@/types/api'
import type { WarehouseHomeData } from './types'

// Polling interval for time-sensitive screens (order pool, execution).
// Set to 0 for screens where stale data is acceptable (detail pages, reports).
const POLL_INTERVAL_MS = 30_000

export function useWarehouseHome() {
  const [data, setData] = useState<WarehouseHomeData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchData = useCallback(async () => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await warehouseApiClient.get<ApiResponse<WarehouseHomeData>>('/warehouse/home')

      if (response.success) {
        setData(response.data)
      } else {
        setError(response.error)
      }
    } catch {
      setError('Could not reach the server. Check your connection.')
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    void fetchData()

    if (POLL_INTERVAL_MS > 0) {
      const interval = setInterval(() => void fetchData(), POLL_INTERVAL_MS)
      return () => clearInterval(interval)
    }
  }, [fetchData])

  return { data, isLoading, error, refetch: fetchData }
}
```

Key points:
- `isLoading` starts `true` — the component should render a skeleton immediately,
  not empty defaults.
- `setError(null)` is called at the start of every fetch — stale errors clear on retry.
- `setIsLoading(false)` is always in `finally` — it runs even on error.
- The cancelled-fetch pattern (`let cancelled = false`) is not needed when `useCallback`
  deps are stable. If deps can change mid-flight, add it back.
- `POLL_INTERVAL_MS = 0` means no polling — use this for detail pages and forms.

### Derived state in hooks

Hooks own derived/transformed state. Components do not transform raw data.

```typescript
// In the hook — correct
const infoCards = useMemo(() => toInfoCards(data?.warehouseInfo), [data])
const pagedOrders = useMemo(() => paginate(data?.orders ?? [], orderPage), [data, orderPage])

// In the component — wrong
const infoCards = data ? toInfoCards(data.warehouseInfo) : []
```

Pagination state (current page, total pages, prev/next handlers) lives in the hook.
The component receives page, totalPages, onPrev, onNext — it does not manage page state.

### Mutation hooks

Mutations (create, update, delete, action endpoints like claim/pause/cancel) follow
a different pattern. They do not fetch on mount. They expose an async function that
the component calls.

```typescript
export function useClaimOrder() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const claimOrder = useCallback(async (orderId: string): Promise<boolean> => {
    setIsSubmitting(true)
    setError(null)

    try {
      const response = await warehouseApiClient.post<ApiResponse<null>>(
        `/orders/purchase/${orderId}/claim`
      )

      if (response.success) {
        return true
      }

      setError(response.error)
      return false
    } catch {
      setError('Could not reach the server.')
      return false
    } finally {
      setIsSubmitting(false)
    }
  }, [])

  return { claimOrder, isSubmitting, error }
}
```

Mutation hooks:
- Return `boolean` (success/failure) from their action function, not void.
- Never throw to the caller. Errors are surfaced via `error` state.
- Expose `isSubmitting` (not `isLoading`) to distinguish from fetch loading states.
- The component uses the returned boolean to decide whether to refetch, navigate, etc.

### When to poll

| Screen | Poll? | Interval |
|---|---|---|
| Order pool (warehouse home) | Yes | 30s |
| Order execution screen | Yes | 15s |
| Bin detail during execution | Yes | 15s |
| Dashboard order list | Yes | 60s |
| Dashboard stock report | No | — |
| Detail pages (order, item, user) | No | — |
| Forms | No | — |

Polling is implemented with `setInterval` inside `useEffect`. The interval is cleared
in the cleanup function. Never use recursive `setTimeout` — it drifts.

### Hook location rules

A hook lives in the same folder as the component that uses it.

```
components/warehouse/home/
  WarehouseHomePageView.tsx
  use-warehouse-home.ts       ← lives here, not in hooks/
  types.ts
```

A hook is promoted to `hooks/` only when it is genuinely imported from two or more
separate component folders. Promote after the second usage, not speculatively.

The `hooks/auth/use-auth.ts` file is a permanent exception — it derives from Zustand
and is used everywhere.

---

## Component rules

### The three states

Every component that consumes a data hook must explicitly handle three states.
There is no such thing as a component that "just shows the data." Loading and error
are not edge cases — they are guaranteed to occur on every first render and on any
network failure.

```tsx
export function WarehouseHomePageView() {
  const { data, isLoading, error, refetch } = useWarehouseHome()

  // 1. Loading state
  if (isLoading) {
    return <LoadingSkeleton variant="floor-home" />
  }

  // 2. Error state
  if (error) {
    return <ErrorBanner message={error} onRetry={refetch} />
  }

  // 3. Data state — data is guaranteed non-null here
  return (
    <main>
      {/* render data */}
    </main>
  )
}
```

For floor components specifically, the error state is the most important. A WW
staring at a blank screen on a ruggedized terminal with no error message is a
serious operational problem. The error message must be large, clear, and include
a retry button.

### What components own

Components own:
- Local UI state (open/closed modals, hover state, form field focus)
- Calling mutation functions from hooks
- Navigating on mutation success

Components do not own:
- Fetch logic
- Data transformation
- Pagination state
- Polling intervals
- Error retry logic

### What components receive from hooks

Components receive finished, ready-to-render data from hooks. They do not receive
raw API response shapes and transform them inline.

```tsx
// Hook returns this
return {
  infoCards,           // DashboardInfoCardItem[] — ready to pass to DashboardInfoCards
  orders: {
    records,           // DashboardRecordListItem[] — ready to pass to the list
    page,
    totalPages,
    onPrev,
    onNext,
  },
  bins: { records, pageSize },
  isLoading,
  error,
  refetch,
}

// Component does this
const { infoCards, orders, bins, isLoading, error, refetch } = useWarehouseHome()
// Not this:
const { data, isLoading } = useWarehouseHome()
const infoCards = data?.warehouseInfo ? toInfoCards(data.warehouseInfo) : []
```

### Passing data down

If a parent component fetches data and a child component displays part of it,
pass the data as props. Do not fetch the same data twice.

```tsx
// Parent fetches, child displays
function OrderDetailPage() {
  const { data, isLoading, error } = useOrderDetail(orderId)
  if (isLoading) return <LoadingSkeleton />
  if (error) return <ErrorBanner message={error} />
  return <OrderLineList lines={data.lines} />
}

// Child is a pure display component — no fetching
function OrderLineList({ lines }: { lines: OrderLine[] }) {
  return <ul>{lines.map(line => <OrderLineRow key={line.id} line={line} />)}</ul>
}
```

Do not create a `useOrderLines` hook if the lines come back in the parent's order
detail response. Fetch the minimum number of times.

---

## Type rules

### Where types live

| Type | Lives in |
|---|---|
| API response shape | `src/types/api.ts` or next to the route handler |
| Hook return type | Same file as the hook, exported |
| Component prop type | Same file as the component, above the component |
| Types shared across a component cluster | `types.ts` in that component folder |
| Types used across domains or layers | `src/types/` |
| Raw Prisma types | Never exported outside `lib/` |

### Naming

- API response DTOs: `{Resource}Response` — e.g. `WarehouseResponse`, `OrderDetailResponse`
- Hook inputs (if parameterised): `Use{Hook}Params` — e.g. `UseOrderDetailParams`
- Hook return types: `Use{Hook}Return` — e.g. `UseWarehouseHomeReturn`
- Form schemas (Zod): `{action}{Resource}Schema` — e.g. `createWarehouseSchema`, `claimOrderSchema`

### Never export Prisma types

`lib/` functions return typed shapes, not raw Prisma objects. The Prisma generated
types (`PrismaClient`, model types) do not appear in any `types/` file or component.

```typescript
// lib/locations/warehouses.ts

// Wrong — leaks Prisma type
export async function getWarehouse(id: string): Promise<Prisma.Warehouse> { ... }

// Correct — returns a typed DTO
export async function getWarehouse(id: string): Promise<WarehouseResponse | null> { ... }
```

---

## Axios client selection

| Where it runs | Client to use |
|---|---|
| Auth components (login forms) | `sharedApi` directly via `authenticatedCall` or `apiClient` |
| Any dashboard component or hook | `dashboardApiClient` |
| Any floor component or hook | `warehouseApiClient` |
| Server-side code (`lib/`) | Never — `lib/` uses Prisma directly |

The correct client injects the correct headers automatically. You never manually
set `x-warehouse-id` or `x-user-role` headers — the client does it from the Zustand
store. If you are setting these headers manually anywhere, you are doing it wrong.

---

## Error handling contract

### In hooks

- Network errors (Axios throws): catch, set `error` to a user-friendly string.
- API errors (`success: false`): set `error` to `response.error` from the envelope.
- Never rethrow. Never `console.error` as the only handling.

### In components

- Render `<ErrorBanner message={error} onRetry={refetch} />` when `error` is non-null.
- On mutation failure, show the error inline near the action that triggered it —
  not as a page-level banner.
- Floor components must show errors in large, high-contrast text. The WW needs to
  read it from arm's length on a dark screen.

### In API routes

- Wrap the entire handler body in try/catch.
- Return a 500 with `{ success: false, error: 'Internal server error' }` on unexpected throws.
- Log the real error server-side. Never send stack traces or internal messages to the client.

```typescript
try {
  const result = await getWarehouse(id)
  return NextResponse.json({ success: true, data: result } satisfies ApiResponse<WarehouseResponse>)
} catch (err) {
  console.error('[GET /api/warehouses/:id]', err)
  return NextResponse.json(
    { success: false, error: 'Internal server error' } satisfies ApiResponse,
    { status: 500 }
  )
}
```