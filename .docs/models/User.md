# User

## Purpose
Represents a platform user and authentication/authorization state.

## Fields
| Field | Type | Purpose |
|---|---|---|
| `id` | `String` | Primary identifier for the record. |
| `email` | `String?` | Stores the `email` value for this User record. |
| `passwordHash` | `String?` | Stores the `passwordHash` value for this User record. |
| `badgeNumber` | `String` | Stores the `badgeNumber` value for this User record. |
| `pinHash` | `String?` | Stores the `pinHash` value for this User record. |
| `firstName` | `String` | Stores the `firstName` value for this User record. |
| `lastName` | `String` | Stores the `lastName` value for this User record. |
| `fullName` | `String` | Stores the `fullName` value for this User record. |
| `role` | `Role` | Enum-based state/classification for business logic. |
| `loginType` | `LoginType` | Enum-based state/classification for business logic. |
| `isActive` | `Boolean` | Boolean flag controlling behavior or state. |
| `deletedAt` | `DateTime?` | Timestamp used for lifecycle/audit tracking. |
| `createdAt` | `DateTime` | Timestamp used for lifecycle/audit tracking. |
| `lastLoginDeviceId` | `String?` | Foreign key/reference to related `lastLoginDevice` entity. |
| `isLoggedIn` | `Boolean` | Boolean flag controlling behavior or state. |
| `binOperationEntries` | `BinOperationEntry[]` | Stores the `binOperationEntries` value for this User record. |
| `usedByDevices` | `Device[]` | Stores the `usedByDevices` value for this User record. |
| `notifications` | `Notification[]` | Stores the `notifications` value for this User record. |
| `orderAssignments` | `OrderAssignment[]` | Stores the `orderAssignments` value for this User record. |
| `purchaseOrders` | `PurchaseOrder[]` | Stores the `purchaseOrders` value for this User record. |
| `refreshTokens` | `RefreshToken[]` | Stores the `refreshTokens` value for this User record. |
| `lastLoginDevice` | `Device?` | Stores the `lastLoginDevice` value for this User record. |
| `userActivityEntries` | `UserActivityEntry[]` | Stores the `userActivityEntries` value for this User record. |
| `createdWarehouses` | `Warehouse[]` | Stores the `createdWarehouses` value for this User record. |
| `warehouseAssignments` | `WarehouseAssignment[]` | Stores the `warehouseAssignments` value for this User record. |

## Relations
- `usedByDevices` (`Device[]`): Relation defined in Prisma via `@relation` (@relation("DeviceLastUser")).
- `purchaseOrders` (`PurchaseOrder[]`): Relation defined in Prisma via `@relation` (@relation("PurchaseOrderAssignedTo")).
- `lastLoginDevice` (`Device?`): Relation defined in Prisma via `@relation` (@relation("UserLastDevice", fields: [lastLoginDeviceId], references: [id])).
- `createdWarehouses` (`Warehouse[]`): Relation defined in Prisma via `@relation` (@relation("WarehouseCreatedBy")).
