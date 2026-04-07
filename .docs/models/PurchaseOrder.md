# PurchaseOrder

## Purpose
Represents inbound procurement demand to receive stock.

## Fields
| Field | Type | Purpose |
|---|---|---|
| `id` | `String` | Primary identifier for the record. |
| `reference` | `String` | Stores the `reference` value for this PurchaseOrder record. |
| `status` | `OrderStatus` | Enum-based state/classification for business logic. |
| `priority` | `OrderPriority` | Enum-based state/classification for business logic. |
| `warehouseId` | `String` | Foreign key/reference to related `warehouse` entity. |
| `notes` | `String?` | Stores the `notes` value for this PurchaseOrder record. |
| `supplier` | `String` | Stores the `supplier` value for this PurchaseOrder record. |
| `expectedDate` | `DateTime?` | Stores the `expectedDate` value for this PurchaseOrder record. |
| `receivingSequence` | `Int?` | Stores the `receivingSequence` value for this PurchaseOrder record. |
| `createdById` | `String` | Foreign key/reference to related `createdBy` entity. |
| `confirmedById` | `String?` | Foreign key/reference to related `confirmedBy` entity. |
| `confirmedAt` | `DateTime?` | Timestamp used for lifecycle/audit tracking. |
| `assignedWMId` | `String?` | Foreign key/reference to related `assignedWM` entity. |
| `deletedAt` | `DateTime?` | Timestamp used for lifecycle/audit tracking. |
| `createdAt` | `DateTime` | Timestamp used for lifecycle/audit tracking. |
| `businessPartyId` | `String?` | Foreign key/reference to related `businessParty` entity. |
| `userActivityEntryId` | `String?` | Foreign key/reference to related `userActivityEntry` entity. |
| `assignedToId` | `String?` | Foreign key/reference to related `assignedTo` entity. |
| `assignedTo` | `User?` | Stores the `assignedTo` value for this PurchaseOrder record. |
| `businessParty` | `BusinessParty?` | Stores the `businessParty` value for this PurchaseOrder record. |
| `userActivityEntry` | `UserActivityEntry?` | Stores the `userActivityEntry` value for this PurchaseOrder record. |
| `warehouse` | `Warehouse` | Stores the `warehouse` value for this PurchaseOrder record. |
| `lines` | `PurchaseOrderLine[]` | Stores the `lines` value for this PurchaseOrder record. |

## Relations
- `assignedTo` (`User?`): Relation defined in Prisma via `@relation` (@relation("PurchaseOrderAssignedTo", fields: [assignedToId], references: [id])).
- `businessParty` (`BusinessParty?`): Relation defined in Prisma via `@relation` (@relation("SupplierPurchaseOrders", fields: [businessPartyId], references: [id])).
- `userActivityEntry` (`UserActivityEntry?`): Relation defined in Prisma via `@relation` (@relation("UserActivityPurchaseOrders", fields: [userActivityEntryId], references: [id])).
- `warehouse` (`Warehouse`): Relation defined in Prisma via `@relation` (@relation(fields: [warehouseId], references: [id])).
