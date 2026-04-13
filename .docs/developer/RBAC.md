# RBAC in code (`src/lib/roles`)

This document describes the **application-layer** role checks that mirror the product RBAC matrix (Owner → Warehouse Worker). It complements coarse routing checks in `src/lib/auth/middleware.ts` (`isOfficeRole`, `isFloorRole`) and path rules in `middleware.ts`.

## Source of truth

- **Prisma enum** `Role` in `prisma/schema.prisma` — persisted on `User`; JWT payload carries the same values.
- **Capabilities** — `RbacPermission` in `src/lib/roles/permissions.ts` — aligned with the permission matrix in project requirements, not a second role system.

## What this layer does / does not do

| In scope | Out of scope (enforce elsewhere) |
|----------|----------------------------------|
| Boolean checks: “does this `Role` have this capability?” | Warehouse / zone scope (`WarehouseAssignment`, WW zone list) |
| Role-change targets for OM vs Owner | “Single Owner per org”, stock-present rules on delete |
| Role-pair messaging allowlist | Same-warehouse messaging, “their OM” for OW |

## API surface

Import from `@/lib/roles` (barrel: `src/lib/roles/index.ts`).

### `can` / `assertCan`

```ts
import { can, assertCan, RbacPermission } from '@/lib/roles'

if (can(payload.role, RbacPermission.ORDER_CONFIRM_RELEASE)) {
  // ...
}

// In entity or route after auth:
assertCan(payload.role, RbacPermission.ITEM_EDIT) // throws DomainError, 403, code FORBIDDEN
```

- **`OWNER`** — `can` always returns `true` (full capability set).
- **Other roles** — lookup in `ROLE_PERMISSIONS` (`ReadonlySet<RbacPermission>` per role).

### `RbacPermission` values

| Permission | Typical use |
|------------|-------------|
| `CREATE_WAREHOUSE` / `ARCHIVE_WAREHOUSE` | Owner-only in matrix |
| `CREATE_ZONE` / `CREATE_BIN` / `BLOCK_UNBLOCK_BIN` | Office + WM (not OW/WW alone) |
| `ITEM_CREATE` / `ITEM_EDIT` | Owner, OM |
| `ORDER_DRAFT_CREATE` | Owner, OM, OW, WM |
| `ORDER_CONFIRM_RELEASE` / `ORDER_CANCEL` | Owner, OM, WM (not OW/WW) |
| `ORDER_EXECUTE_FLOOR` | Owner, WM, WW |
| `ORDER_SIGN_OFF_EXECUTED` | Owner, WM |
| `ASSIGN_WW_TO_ZONE` | Owner, OM, WM |
| `ASSIGN_WM_TO_WAREHOUSE` | Owner, OM |
| `USER_MANAGE_OFFICE_STAFF` | Owner, OM |
| `USER_CHANGE_ROLE` | Owner, OM (target role further restricted — below) |
| `ZONE_PERMISSION_OVERRIDE` | Owner, OM |
| `REPORT_VIEW` | Owner, OM, OW, WM |
| `REPORT_VIEW_ACTIVITY_AUDIT` | Owner, OM |
| `ALERT_RULE_CONFIGURE` | Owner, OM |
| `DELETE_OFFICE_RECORD` | Owner, OM |
| `DELETE_WAREHOUSE_RECORD` | Owner, WM |

Exact role → permission sets live in `ROLE_PERMISSIONS` in `permissions.ts`; when the matrix changes, update that file and tests.

### Role assignment

Office Manager cannot assign **Owner** or **Warehouse Manager**:

```ts
import {
  canAssignRole,
  canOfficeManagerAssignRole,
  assertCanAssignRole
} from '@/lib/roles'

canOfficeManagerAssignRole('OFFICE_WORKER') // true
canOfficeManagerAssignRole('WAREHOUSE_MANAGER') // false

canAssignRole('OWNER', anyRole) // true
canAssignRole('OFFICE_MANAGER', 'WAREHOUSE_MANAGER') // false

assertCanAssignRole(actorRole, targetRole) // USER_CHANGE_ROLE + canAssignRole; 403 if denied
```

Domain layer should still enforce business rules (e.g. at most one Owner).

### Messaging (role pairs only)

`canMessageByRole(sender, recipient)` encodes the **role-level** messaging matrix. Callers must still filter by warehouse assignment and “OW → their OM” where required.

## Middleware vs fine-grained checks

- **`isOfficeRole` / `isFloorRole`** — fast gate for `/dashboard` vs `/warehouse` API routes and Next.js middleware. Owner is included in **both** office and floor sets where applicable so the Owner can use either surface.
- **`can` / `assertCan`** — use inside handlers or entities for specific mutations (release order, edit item, delete record type, etc.).

## Tests

Regression coverage: `src/__tests__/lib/roles/rbac.test.ts` (Owner bypass, OM/OW/WM/WW slices, role assignment, messaging pairs).

## Related files

| File | Role |
|------|------|
| `src/lib/roles/permissions.ts` | `RbacPermission`, `ROLE_PERMISSIONS` |
| `src/lib/roles/check.ts` | `can`, `assertCan` |
| `src/lib/roles/role-change.ts` | `canAssignRole`, `assertCanAssignRole`, … |
| `src/lib/roles/messaging.ts` | `canMessageByRole` |
| `src/lib/auth/middleware.ts` | `isOfficeRole`, `isFloorRole` |
| `src/lib/errors.ts` | `DomainError` for `assertCan*` |
