# SalesOrderLine

## Purpose
Represents a SKU line to pick/ship for a sales order.

## Fields
| Field | Type | Purpose |
|---|---|---|
| `id` | `String` | Primary identifier for the record. |
| `salesOrderId` | `String` | Foreign key/reference to related `salesOrder` entity. |
| `warItemId` | `String` | Foreign key/reference to related `warItem` entity. |
| `destinationBinId` | `String?` | Foreign key/reference to related `destinationBin` entity. |
| `originBinId` | `String?` | Foreign key/reference to related `originBin` entity. |
| `baseQuantity` | `Decimal` | Stores the `baseQuantity` value for this SalesOrderLine record. |
| `handledQuantity` | `Decimal` | Stores the `handledQuantity` value for this SalesOrderLine record. |
| `isShort` | `Boolean` | Boolean flag controlling behavior or state. |
| `lotId` | `String?` | Foreign key/reference to related `lot` entity. |
| `serialNumberId` | `String?` | Foreign key/reference to related `serialNumber` entity. |
| `uom` | `String` | Stores the `uom` value for this SalesOrderLine record. |
| `userActivityEntryId` | `String?` | Foreign key/reference to related `userActivityEntry` entity. |
| `salesOrder` | `SalesOrder` | Stores the `salesOrder` value for this SalesOrderLine record. |
| `userActivityEntry` | `UserActivityEntry?` | Stores the `userActivityEntry` value for this SalesOrderLine record. |
| `unitOfMeasure` | `UnitOfMeasure` | Stores the `unitOfMeasure` value for this SalesOrderLine record. |

## Relations
- `salesOrder` (`SalesOrder`): Relation defined in Prisma via `@relation` (@relation(fields: [salesOrderId], references: [id], onDelete: Cascade)).
- `userActivityEntry` (`UserActivityEntry?`): Relation defined in Prisma via `@relation` (@relation("UserActivitySalesOrderLines", fields: [userActivityEntryId], references: [id])).
- `unitOfMeasure` (`UnitOfMeasure`): Relation defined in Prisma via `@relation` (@relation(fields: [uom], references: [id])).
