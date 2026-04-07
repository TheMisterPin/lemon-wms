# BoxLine

## Purpose
Represents an inventory line captured inside a box.

## Fields
| Field | Type | Purpose |
|---|---|---|
| `id` | `String` | Primary identifier for the record. |
| `boxId` | `String` | Foreign key/reference to related `box` entity. |
| `quantity` | `Decimal` | Stores the `quantity` value for this BoxLine record. |
| `lotId` | `String?` | Foreign key/reference to related `lot` entity. |
| `serialNumberId` | `String?` | Foreign key/reference to related `serialNumber` entity. |
| `uom` | `String` | Stores the `uom` value for this BoxLine record. |
| `itemId` | `String` | Foreign key/reference to related `item` entity. |
| `box` | `Box` | Stores the `box` value for this BoxLine record. |
| `item` | `BinStockItem` | Stores the `item` value for this BoxLine record. |
| `lot` | `Lot?` | Stores the `lot` value for this BoxLine record. |
| `serialNumber` | `SerialNumber?` | Stores the `serialNumber` value for this BoxLine record. |
| `unitOfMeasure` | `UnitOfMeasure` | Stores the `unitOfMeasure` value for this BoxLine record. |

## Relations
- `box` (`Box`): Relation defined in Prisma via `@relation` (@relation(fields: [boxId], references: [id], onDelete: Cascade)).
- `item` (`BinStockItem`): Relation defined in Prisma via `@relation` (@relation(fields: [itemId], references: [id])).
- `lot` (`Lot?`): Relation defined in Prisma via `@relation` (@relation(fields: [lotId], references: [id])).
- `serialNumber` (`SerialNumber?`): Relation defined in Prisma via `@relation` (@relation(fields: [serialNumberId], references: [id])).
- `unitOfMeasure` (`UnitOfMeasure`): Relation defined in Prisma via `@relation` (@relation(fields: [uom], references: [id])).
