# `src/app/api` Developer Reference

Developer-facing reference for route structure, design patterns, expected requests, and response contracts.

## API architecture overview

- Namespace split:
  - `src/app/api/auth/**`: login, refresh, logout
  - `src/app/api/dashboard/**`: office APIs
  - `src/app/api/warehouse/**`: floor APIs
  - `src/app/api/errors`, `src/app/api/logs`, `src/app/api/seed/users`: support/ops
- Common route style:
  - Parse request (`params`, `query`, `body`)
  - Authenticate via `verifyAccessTokenFromRequest`
  - Authorize by role/context
  - Delegate to `src/lib/entities/**` (or direct Prisma in some routes)
  - Return JSON response

## Route structure map

```text
src/app/api
├─ auth/login, auth/floor/login, auth/logout, auth/refresh
├─ dashboard/home
├─ dashboard/warehouses + dashboard/warehouses/[id]
├─ dashboard/zones + dashboard/zones/[id]
├─ dashboard/bins + dashboard/bins/[id]
├─ dashboard/items + dashboard/items/[id]
├─ dashboard/users + dashboard/users/[id]
├─ dashboard/devices + dashboard/devices/[action]
├─ dashboard/stock
├─ warehouse (home), warehouse/home
├─ warehouse/items
├─ warehouse/bins + warehouse/bins/[id]
├─ warehouse/stock/trolley
├─ warehouse/stock/load/[id]
├─ warehouse/stock/unload/[id]
├─ warehouse/stock/addtobin/[id]
├─ errors
├─ logs
└─ seed/users
```

## Expected request and response patterns

## Auth routes

- `POST /api/auth/login`
  - Request: `{ email, password }`
  - Response success: auth payload (`accessToken`, user details)
  - Errors: validation/auth failure with 4xx
- `POST /api/auth/floor/login`
  - Request: `{ deviceCode, badgeNumber, pin }`
  - Response success: auth payload + device/location context
- `POST /api/auth/refresh`
  - Request: refresh token from cookie
  - Response success: new access token + user
- `POST /api/auth/logout`
  - Request: optional auth context
  - Response success: `{ success: true }` and cookie cleanup

## Dashboard routes

- Typical contract:
  - `GET` list/read
  - `POST` create (Zod schema)
  - `PUT` update (partial schema)
  - `DELETE` soft delete/deactivate depending on resource
- Common request elements:
  - Path params: `[id]`
  - Query filters: resource-specific (`warehouseId`, `zoneId`, `isActive`, etc.)
  - Body: form schemas from `src/lib/schemas/**`
- Common response envelope (used in most dashboard handlers):
  - Success: `{ success: true, message, data }`
  - Error: `{ success: false, message, data: null, error: { code, details? } }`

## Warehouse routes

- `GET /api/warehouse` and `GET /api/warehouse/home`
  - Home aggregate response (user/device/zone/orders/bins)
- `GET /api/warehouse/items`
  - Query: `page`, `pageSize`, `q`
  - Response: paginated items
- `GET /api/warehouse/bins/[id]`
  - Path `[id]`, optional warehouse scoping from token payload
  - Response: bin + contained stock items
- `POST /api/warehouse/stock/load/[id]`
  - Path `[id]`, body `{ sourceBinStockItemId, quantity }`
  - Requires token context with `warehouseId` and `deviceId`
- `POST /api/warehouse/stock/unload/[id]`
  - Path `[id]`, body `{ selections: [...] }`
- `POST /api/warehouse/stock/addtobin/[id]`
  - Path `[id]`, body `{ itemId, quantity }`

## Support/ops routes

- `POST /api/errors`
  - Error-ingestion endpoint using schema validation
- `GET /api/logs`
  - Placeholder response route
- `POST /api/seed/users`
  - Non-production user seeding

## Design patterns in `src/app/api`

- Good patterns:
  - Top-of-handler auth guard
  - Thin route + entity delegation
  - Zod schema usage for input validation
  - Shared response helpers in many routes (`src/lib/api/response.ts`)
- Patterns to standardize:
  - Auth routes still use ad-hoc payload shapes
  - Some routes embed heavy Prisma/business orchestration inline
  - Role authorization is not uniformly enforced across equivalent reads

## Contract guidance for new routes

- Always define:
  - Required auth context (role and, for floor routes, warehouse/device context)
  - Request schema (params/query/body)
  - Response envelope and error codes
- Preferred route implementation flow:
  1. Parse and validate input.
  2. Authenticate (`verifyAccessTokenFromRequest`).
  3. Authorize with explicit policy helper.
  4. Delegate to a domain use-case in `src/lib/entities/**`.
  5. Map domain/validation errors to consistent API envelope.

## Maintenance checklist

- [ ] Namespace is correct (`auth`/`dashboard`/`warehouse`).
- [ ] Request schema added and validated.
- [ ] Role/context authorization is explicit.
- [ ] Uses shared response helpers consistently.
- [ ] Handler is thin (no long transaction/orchestration inline).
- [ ] Error mapping is deterministic (`ZodError`, `DomainError`, unknown).
- [ ] Endpoint behavior documented here when changed.
