# Login Flow

## Overview

Lemon WMS supports two completely separate login flows that share the same underlying JWT infrastructure:

| Flow | Who | Entry point | Identifier |
|---|---|---|---|
| **Credential** | OWNER, OFFICE_MANAGER, OFFICE_WORKER | `/login` (tab 1) | Email + password |
| **Badge + PIN** | WAREHOUSE_MANAGER, WAREHOUSE_WORKER | `/login` (tab 2) or `/floor` | Badge number + 4-digit PIN, device code |

Both flows produce the same token pair — an **access token** (15 min JWT) and a **refresh token** (7-day JWT). Neither flow uses NextAuth or any third-party auth library. All JWT signing, cookie management, and session persistence is handled by custom code.

After login the client redirects based on role:

```
OWNER / OFFICE_MANAGER / OFFICE_WORKER  →  /dashboard
WAREHOUSE_MANAGER / WAREHOUSE_WORKER    →  /warehouse
```

---

## Parts Involved

### Routes

#### `POST /api/auth/login` — Credential flow
File: [src/app/api/auth/login/route.ts](../../src/app/api/auth/login/route.ts)

1. Validates body with Zod: `{ email, password }`.
2. Looks up user by email via Prisma. Returns `401` for unknown email (deliberately indistinguishable from wrong password to prevent user enumeration).
3. Rejects if `isActive` is false and writes a `LOGIN_FAILED` `UserActivityEntry`.
4. Rejects if `loginType` is `BADGE_PIN` only (account not permitted to use credentials).
5. bcrypt-compares `password` against `passwordHash`. On failure writes another `LOGIN_FAILED` UAE.
6. Signs an access token: `{ userId, role }` — no device or zone data for office users.
7. Signs a refresh token: `{ userId }`.
8. Hashes the refresh token with SHA-256 and persists it to the `RefreshToken` table, keyed by a `deviceLabel` derived from the `User-Agent` header.
9. In parallel: sets both cookies, writes a `LOGIN` `UserActivityEntry`.
10. Returns:
    ```json
    {
      "accessToken": "...",
      "user": { "id", "email", "role", "fullName", "badgeNumber" }
    }
    ```

#### `POST /api/auth/floor/login` — Badge + PIN flow
File: [src/app/api/auth/floor/login/route.ts](../../src/app/api/auth/floor/login/route.ts)

1. Validates body with Zod: `{ deviceCode, badgeNumber, pin }`. `pin` must match `/^\d{4}$/`.
2. **Device check** — calls `upsertDevice(prisma, deviceCode)`. If device is unknown it is created with `authorized: false`. Returns `401` if not authorized, `401` if inactive.
3. Looks up user by `badgeNumber`. Returns `401` on miss (same generic message as PIN failure).
4. Rejects if `isActive` is false and writes a `LOGIN_FAILED` UAE.
5. Rejects if `loginType` is `CREDENTIAL` only.
6. bcrypt-compares `pin` against `pinHash`. On failure writes a `LOGIN_FAILED` UAE.
7. Signs an access token: `{ userId, role, deviceId, warehouseId, zoneId }` — the device's assigned warehouse and zone are embedded directly in the token.
8. Signs a refresh token: `{ userId }`. Persists with `deviceLabel = "device.name:device.code"` and `deviceId`.
9. In parallel: sets both cookies, writes a `LOGIN` UAE.
10. Returns:
    ```json
    {
      "accessToken": "...",
      "user": { "id", "role", "badgeNumber" },
      "location": { "warehouseId", "zoneId" },
      "device": { "id", "name", "code" }
    }
    ```
    Note that `location` and `device` are returned as separate top-level fields (not embedded in `user`), which is why the Zustand store holds them separately.

#### `POST /api/auth/refresh`
File: [src/app/api/auth/refresh/route.ts](../../src/app/api/auth/refresh/route.ts)

Called automatically by the Axios interceptor when any API request returns `401`.

1. Reads the `refresh_token` httpOnly cookie.
2. SHA-256 hashes it and looks up a matching, non-revoked, non-expired row in `RefreshToken`.
3. Revokes the old refresh token (rotate-on-use — each token is single-use).
4. Signs a new access token (`{ userId, role }` — no device/zone; those come from the store context preserved through `setAuth`).
5. Signs and persists a new refresh token, re-using the original `deviceLabel` and `deviceId`.
6. Sets both new cookies.
7. Returns the same shape as the login response: `{ accessToken, user }`.

> **Important:** The refresh route only knows `userId` and `role`. It does not re-embedded `deviceId`/`warehouseId`/`zoneId` in the new access token. The warehouse session context (location + device) is preserved client-side in the Zustand store by the Axios interceptor, which passes the existing `location` and `device` through to `setAuth`.

#### `POST /api/auth/logout`
File: [src/app/api/auth/logout/route.ts](../../src/app/api/auth/logout/route.ts)

1. Reads the refresh token cookie, looks it up, and revokes it.
2. Falls back to the access token (Bearer or cookie) to identify `userId` if the refresh lookup failed.
3. Writes a `LOGOUT` UAE.
4. Clears both cookies.

---

### Zustand Store

File: [src/lib/auth/store.ts](../../src/lib/auth/store.ts)

The single client-side source of truth for everything auth. All other client code reads from here — no other component decodes JWTs or reads cookies directly.

**State shape:**

```ts
{
  token: string | null          // current access token (raw JWT)
  user: AuthUser | null         // { id, email?, role, badgeNumber }
  location: AuthLocation | null // { warehouseId?, zoneId? }  — floor only
  device: AuthDevice | null     // { id, name, code }          — floor only
}
```

**Actions:**

| Action | Use |
|---|---|
| `setAuth(token, user, context?)` | Called on login and on successful refresh. Sets all four fields atomically. `context` is optional — office logins omit it; floor logins pass `{ location, device }`. |
| `setToken(token)` | Sets only the token, preserving `user`/`location`/`device`. Used when a new token is available but user context is unchanged. |
| `clearAuth()` | Nulls all four fields and removes the localStorage token. Called on failed refresh or explicit logout. |

**Token persistence:**

The access token is also written to `localStorage` under the key `wms_access_token`. This ensures the Axios interceptor can read it even before the store re-hydrates on page load (Zustand initialises `token` from `readStoredAccessToken()` synchronously, so in practice they stay in sync).

---

### Hook

File: [src/hooks/auth/use-auth.tsx](../../src/hooks/auth/use-auth.tsx)

A thin selector layer over the Zustand store. No JWT parsing, no cookie reading — it only reads from the store.

**Returns:**

```ts
{
  // Raw store values
  user: AuthUser | null
  location: AuthLocation | null
  device: AuthDevice | null

  // Role-specific context slices (null when role doesn't match)
  dashboard: { user: AuthUser } | null
  warehouse: { user: AuthUser; location: AuthLocation | null; device: AuthDevice | null } | null

  // Derived flags
  isAuthenticated: boolean
  isOfficeRole: boolean      // OWNER | OFFICE_MANAGER | OFFICE_WORKER
  isFloorRole: boolean       // WAREHOUSE_MANAGER | WAREHOUSE_WORKER
  isLoading: false           // Always false — no async hydration
}
```

`dashboard` and `warehouse` are computed with `useMemo` and return `null` when the user does not have the matching role. This makes it safe to do `warehouse?.user` inside a warehouse page without a role check.

Role groups used internally:

```ts
const OFFICE_ROLES = ['OWNER', 'OFFICE_MANAGER', 'OFFICE_WORKER']
const FLOOR_ROLES  = ['WAREHOUSE_MANAGER', 'WAREHOUSE_WORKER']
```

**Usage patterns:**

```ts
// Dashboard page
const { dashboard } = useAuth()
dashboard?.user.email

// Warehouse page
const { warehouse } = useAuth()
warehouse?.user.badgeNumber
warehouse?.device?.name
warehouse?.location?.zoneId

// Generic guard
const { isAuthenticated, isFloorRole } = useAuth()
```

---

## Memoization

### Server — Cookies

Two cookies are set on every successful login and refresh:

| Cookie | `httpOnly` | Lifetime | Purpose |
|---|---|---|---|
| `access_token` | ❌ No | 7 days (cookie); JWT expires in 15 min | Readable by Next.js Edge middleware for SSR routing |
| `refresh_token` | ✅ Yes | 7 days | Not accessible to JavaScript; used only by `/api/auth/refresh` and `/api/auth/logout` |

The access token cookie max-age is intentionally longer than the JWT expiry. The cookie persisting after the JWT expires lets the middleware detect an expired-but-present token and allow the page to load so the client can call `/api/auth/refresh` — instead of hard-redirecting to `/login`.

Refresh tokens are **rotated on every use** — each call to `/api/auth/refresh` revokes the current refresh token and issues a new one.

### Local Storage

Three keys are used:

| Key | Written by | Read by | Contains |
|---|---|---|---|
| `wms_access_token` | `writeStoredAccessToken` in `store.ts` | `readStoredAccessToken` in `store.ts`; Axios interceptor | Raw access token JWT |
| `wms_device_code` | `FloorLoginForm` on successful login | `FloorLoginForm` on mount | The device's code string (e.g. `ZONE-3-TERMINAL`) |
| `wms_floor_last_login` | `FloorLoginForm` on successful login | `FloorLoginForm` on mount | `{ deviceCode, badgeNumber }` — enables PIN-only quick re-login |

**Quick re-login flow (floor only):**

On `FloorLoginForm` mount:

```
1. Read wms_device_code
   └─ found → populate deviceCode state
      ├─ read wms_floor_last_login
      │  └─ found AND lastLogin.deviceCode === savedDeviceCode
      │     └─ populate badgeNumber, jump to 'pin' step  ← quick re-login
      └─ not found (or different device) → go to 'badge' step
   └─ not found → stay at 'device' step
```

The "Change user" button on the PIN keypad (and the back link) calls `handleChangeUser()`, which clears `wms_floor_last_login` and resets to the `badge` step — forcing a fresh badge scan.

---

## Retrieving Information

### In API routes (server-side)

API routes run in Node.js and have access to the full `jsonwebtoken` library.

**Primary method** — via `verifyAccessTokenFromRequest` from `src/lib/auth/middleware.ts`:

```ts
import { verifyAccessTokenFromRequest } from '@/lib/auth/middleware'

const payload = verifyAccessTokenFromRequest(request) // AccessTokenPayload | null
if (!payload) return unauthorizedJson()

const { userId, role, warehouseId, zoneId, deviceId } = payload
```

This helper checks the `Authorization: Bearer …` header first, then falls back to the `access_token` cookie. It uses `verifyToken` from `src/lib/auth/jwt.ts`, which calls `jwt.verify()` synchronously with `JWT_SECRET`. A thrown exception (expired, tampered) returns `null`.

Role guards exposed from the same file:

```ts
isOfficeRole(role) // boolean
isFloorRole(role)  // boolean
unauthorizedJson() // NextResponse 401
```

**Forwarded headers from middleware** — for routes that need the user identity without full JWT verification, the middleware injects:

```
x-user-id   →  payload.userId
x-user-role →  payload.role
```

These are available as `request.headers.get('x-user-id')` inside any API route handler.

### In client components

Always read from the hook — never from cookies or localStorage directly:

```ts
import { useAuth } from '@/hooks/auth/use-auth'

const { user, dashboard, warehouse, isAuthenticated } = useAuth()
```

The store is subscribed reactively. When the Axios interceptor calls `setAuth` after a successful token refresh, all components subscribed via `useAuth` automatically re-render with the new token and user.

### In the Edge middleware

File: [middleware.ts](../../middleware.ts)

The Edge runtime cannot use `jsonwebtoken`. The middleware uses two strategies:

1. **Valid token** → `verifyToken<AccessTokenPayload>(cookieToken)` — full signature + expiry check via the same `lib/auth/jwt` helper (which works in Edge).
2. **Expired token** → `decodeTokenUnsafe(cookieToken)` — manual base64 decode of the JWT payload without verification. Used only to extract `userId` and `role` for routing purposes. The expired token is **not** trusted for any permission decision — it only allows the page to load so the client can refresh.

Middleware decision tree:

```
Request arrives
│
├── Static / API path → pass through (no auth check)
│
├── No access token cookie
│   ├── Public path (/login, /floor) → pass through
│   └── Protected path → redirect /login
│
├── Token valid
│   ├── On /login, /floor, / → redirect to /dashboard or /warehouse
│   ├── /dashboard + not office role → redirect /warehouse
│   ├── /warehouse + not floor role → redirect /dashboard
│   └── Otherwise → pass through (with x-user-id, x-user-role headers injected)
│
└── Token expired (cookie present)
    ├── No refresh_token cookie → redirect /login
    └── Has refresh_token cookie → pass through (client will call /api/auth/refresh)
```

### Token refresh (client-side, automatic)

File: [src/lib/axios.ts](../../src/lib/axios.ts)

All API calls go through the `api` Axios instance (or `apiClient` wrappers). The response interceptor handles 401s transparently:

1. On any `401` that is not already a retry and not from `/auth/refresh` itself:
2. Calls `POST /api/auth/refresh` (using raw `axios`, not the intercepted `api` instance, to avoid recursion).
3. Multiple concurrent 401s share a single `refreshPromise` to avoid parallel refresh races.
4. On success: calls `setAuth(newToken, user, context?)` — preserves existing `location` and `device` if they are present in the store.
5. Retries the original request with the new token.
6. On failure: calls `clearAuth()` and redirects to `/login`.
 

