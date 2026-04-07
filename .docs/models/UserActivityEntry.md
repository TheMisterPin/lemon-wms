# UserActivityEntry

## Purpose
Represents audit trail events performed by users.

## Fields
| Field | Type | Purpose |
|---|---|---|
| `id` | `String` | Primary identifier for the record. |
| `userId` | `String` | Foreign key/reference to related `user` entity. |
| `actionType` | `String` | Stores the `actionType` value for this UserActivityEntry record. |
| `entityType` | `String` | Enum-based state/classification for business logic. |
| `entityId` | `String` | Foreign key/reference to related `entity` entity. |
| `metadata` | `Json?` | Stores the `metadata` value for this UserActivityEntry record. |
| `warehouseId` | `String?` | Foreign key/reference to related `warehouse` entity. |
| `orderId` | `String?` | Foreign key/reference to related `order` entity. |
| `orderType` | `OrderType?` | Enum-based state/classification for business logic. |
| `ipAddress` | `String?` | Stores the `ipAddress` value for this UserActivityEntry record. |
| `notes` | `String?` | Stores the `notes` value for this UserActivityEntry record. |
| `createdAt` | `DateTime` | Timestamp used for lifecycle/audit tracking. |
| `orderAssignmentId` | `String?` | Foreign key/reference to related `orderAssignment` entity. |
| `adjustmentOrder` | `AdjustmentOrder[]` | Stores the `adjustmentOrder` value for this UserActivityEntry record. |
| `adjustmentOrderLines` | `AdjustmentOrderLine[]` | Stores the `adjustmentOrderLines` value for this UserActivityEntry record. |
| `boes` | `BinOperationEntry[]` | Stores the `boes` value for this UserActivityEntry record. |
| `purchaseOrder` | `PurchaseOrder[]` | Stores the `purchaseOrder` value for this UserActivityEntry record. |
| `purchaseOrderLines` | `PurchaseOrderLine[]` | Stores the `purchaseOrderLines` value for this UserActivityEntry record. |
| `salesOrder` | `SalesOrder[]` | Stores the `salesOrder` value for this UserActivityEntry record. |
| `salesOrderLines` | `SalesOrderLine[]` | Stores the `salesOrderLines` value for this UserActivityEntry record. |
| `orderAssignment` | `OrderAssignment?` | Stores the `orderAssignment` value for this UserActivityEntry record. |
| `user` | `User` | Stores the `user` value for this UserActivityEntry record. |
| `warehouse` | `Warehouse?` | Stores the `warehouse` value for this UserActivityEntry record. |

## Relations
- `adjustmentOrder` (`AdjustmentOrder[]`): Relation defined in Prisma via `@relation` (@relation("UserActivityAdjustmentOrders")).
- `adjustmentOrderLines` (`AdjustmentOrderLine[]`): Relation defined in Prisma via `@relation` (@relation("UserActivityAdjustmentOrderLines")).
- `purchaseOrder` (`PurchaseOrder[]`): Relation defined in Prisma via `@relation` (@relation("UserActivityPurchaseOrders")).
- `purchaseOrderLines` (`PurchaseOrderLine[]`): Relation defined in Prisma via `@relation` (@relation("UserActivityPurchaseOrderLines")).
- `salesOrder` (`SalesOrder[]`): Relation defined in Prisma via `@relation` (@relation("UserActivitySalesOrders")).
- `salesOrderLines` (`SalesOrderLine[]`): Relation defined in Prisma via `@relation` (@relation("UserActivitySalesOrderLines")).
- `orderAssignment` (`OrderAssignment?`): Relation defined in Prisma via `@relation` (@relation("OrderAssignmentActivities", fields: [orderAssignmentId], references: [id])).
- `user` (`User`): Relation defined in Prisma via `@relation` (@relation(fields: [userId], references: [id])).
- `warehouse` (`Warehouse?`): Relation defined in Prisma via `@relation` (@relation(fields: [warehouseId], references: [id])).
