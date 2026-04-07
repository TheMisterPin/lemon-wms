# AdjustmentOrder

## Purpose
Represents inventory correction demand (gain/loss/reclass).

## Fields
| Field | Type | Purpose |
|---|---|---|
| `id` | `String` | Primary identifier for the record. |
| `reference` | `String` | Stores the `reference` value for this AdjustmentOrder record. |
| `status` | `OrderStatus` | Enum-based state/classification for business logic. |
| `priority` | `OrderPriority` | Enum-based state/classification for business logic. |
| `warehouseId` | `String` | Foreign key/reference to related `warehouse` entity. |
| `notes` | `String?` | Stores the `notes` value for this AdjustmentOrder record. |
| `reasonCode` | `String` | Stores the `reasonCode` value for this AdjustmentOrder record. |
| `createdById` | `String` | Foreign key/reference to related `createdBy` entity. |
| `confirmedById` | `String?` | Foreign key/reference to related `confirmedBy` entity. |
| `confirmedAt` | `DateTime?` | Timestamp used for lifecycle/audit tracking. |
| `assignedWMId` | `String?` | Foreign key/reference to related `assignedWM` entity. |
| `deletedAt` | `DateTime?` | Timestamp used for lifecycle/audit tracking. |
| `createdAt` | `DateTime` | Timestamp used for lifecycle/audit tracking. |
| `userActivityEntryId` | `String?` | Foreign key/reference to related `userActivityEntry` entity. |
| `userActivityEntry` | `UserActivityEntry?` | Stores the `userActivityEntry` value for this AdjustmentOrder record. |
| `warehouse` | `Warehouse` | Stores the `warehouse` value for this AdjustmentOrder record. |
| `lines` | `AdjustmentOrderLine[]` | Stores the `lines` value for this AdjustmentOrder record. |

## Relations
- `userActivityEntry` (`UserActivityEntry?`): Relation defined in Prisma via `@relation` (@relation("UserActivityAdjustmentOrders", fields: [userActivityEntryId], references: [id])).
- `warehouse` (`Warehouse`): Relation defined in Prisma via `@relation` (@relation(fields: [warehouseId], references: [id])).
