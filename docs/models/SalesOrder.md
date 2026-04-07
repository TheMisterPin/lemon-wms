# SalesOrder

## Purpose
Represents outbound customer demand to ship stock.

## Fields
| Field | Type | Purpose |
|---|---|---|
| `id` | `String` | Primary identifier for the record. |
| `reference` | `String` | Stores the `reference` value for this SalesOrder record. |
| `status` | `OrderStatus` | Enum-based state/classification for business logic. |
| `priority` | `OrderPriority` | Enum-based state/classification for business logic. |
| `warehouseId` | `String` | Foreign key/reference to related `warehouse` entity. |
| `notes` | `String?` | Stores the `notes` value for this SalesOrder record. |
| `customerName` | `String` | Stores the `customerName` value for this SalesOrder record. |
| `deliveryAddress` | `String?` | Stores the `deliveryAddress` value for this SalesOrder record. |
| `carrierId` | `String?` | Foreign key/reference to related `carrier` entity. |
| `createdById` | `String` | Foreign key/reference to related `createdBy` entity. |
| `confirmedById` | `String?` | Foreign key/reference to related `confirmedBy` entity. |
| `confirmedAt` | `DateTime?` | Timestamp used for lifecycle/audit tracking. |
| `assignedWMId` | `String?` | Foreign key/reference to related `assignedWM` entity. |
| `deletedAt` | `DateTime?` | Timestamp used for lifecycle/audit tracking. |
| `createdAt` | `DateTime` | Timestamp used for lifecycle/audit tracking. |
| `businessPartyId` | `String?` | Foreign key/reference to related `businessParty` entity. |
| `userActivityEntryId` | `String?` | Foreign key/reference to related `userActivityEntry` entity. |
| `businessParty` | `BusinessParty?` | Stores the `businessParty` value for this SalesOrder record. |
| `userActivityEntry` | `UserActivityEntry?` | Stores the `userActivityEntry` value for this SalesOrder record. |
| `warehouse` | `Warehouse` | Stores the `warehouse` value for this SalesOrder record. |
| `lines` | `SalesOrderLine[]` | Stores the `lines` value for this SalesOrder record. |

## Relations
- `businessParty` (`BusinessParty?`): Relation defined in Prisma via `@relation` (@relation("CustomerSalesOrders", fields: [businessPartyId], references: [id])).
- `userActivityEntry` (`UserActivityEntry?`): Relation defined in Prisma via `@relation` (@relation("UserActivitySalesOrders", fields: [userActivityEntryId], references: [id])).
- `warehouse` (`Warehouse`): Relation defined in Prisma via `@relation` (@relation(fields: [warehouseId], references: [id])).
