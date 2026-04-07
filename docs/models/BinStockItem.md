# BinStockItem

## Purpose
Represents on-hand, reserved, or blocked stock for an item in a specific bin and tracking context.

## Fields
| Field | Type | Purpose |
|---|---|---|
| `id` | `String` | Primary identifier for the record. |
| `warehouseId` | `String` | Foreign key/reference to related `warehouse` entity. |
| `binId` | `String` | Foreign key/reference to related `bin` entity. |
| `itemId` | `String` | Foreign key/reference to related `item` entity. |
| `lotId` | `String?` | Foreign key/reference to related `lot` entity. |
| `serialNumberId` | `String?` | Foreign key/reference to related `serialNumber` entity. |
| `quantityAvailable` | `Decimal` | Stores the `quantityAvailable` value for this BinStockItem record. |
| `quantityReserved` | `Decimal` | Stores the `quantityReserved` value for this BinStockItem record. |
| `quantityBlocked` | `Decimal` | Stores the `quantityBlocked` value for this BinStockItem record. |
| `uom` | `String` | Stores the `uom` value for this BinStockItem record. |
| `status` | `BinItemStatus` | Enum-based state/classification for business logic. |
| `expiryDate` | `DateTime?` | Stores the `expiryDate` value for this BinStockItem record. |
| `createdByBoeId` | `String?` | Foreign key/reference to related `createdByBoe` entity. |
| `lastOperationBoeId` | `String?` | Foreign key/reference to related `lastOperationBoe` entity. |
| `createdAt` | `DateTime` | Timestamp used for lifecycle/audit tracking. |
| `updatedAt` | `DateTime` | Timestamp used for lifecycle/audit tracking. |
| `boxId` | `String?` | Foreign key/reference to related `box` entity. |
| `description` | `String` | Stores the `description` value for this BinStockItem record. |
| `reservedByOrderId` | `String?` | Foreign key/reference to related `reservedByOrder` entity. |
| `bin` | `Bin` | Stores the `bin` value for this BinStockItem record. |
| `item` | `Item` | Stores the `item` value for this BinStockItem record. |
| `lot` | `Lot?` | Stores the `lot` value for this BinStockItem record. |
| `serialNumber` | `SerialNumber?` | Stores the `serialNumber` value for this BinStockItem record. |
| `unitOfMeasure` | `UnitOfMeasure` | Stores the `unitOfMeasure` value for this BinStockItem record. |
| `boxLines` | `BoxLine[]` | Stores the `boxLines` value for this BinStockItem record. |

## Relations
- `bin` (`Bin`): Relation defined in Prisma via `@relation` (@relation(fields: [binId], references: [id])).
- `item` (`Item`): Relation defined in Prisma via `@relation` (@relation(fields: [itemId], references: [id])).
- `lot` (`Lot?`): Relation defined in Prisma via `@relation` (@relation(fields: [lotId], references: [id])).
- `serialNumber` (`SerialNumber?`): Relation defined in Prisma via `@relation` (@relation(fields: [serialNumberId], references: [id])).
- `unitOfMeasure` (`UnitOfMeasure`): Relation defined in Prisma via `@relation` (@relation(fields: [uom], references: [id])).
