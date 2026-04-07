# AdjustmentOrderLine

## Purpose
Represents an adjustment line with counted/handled quantity.

## Fields
| Field | Type | Purpose |
|---|---|---|
| `adjustmentOrderId` | `String` | Foreign key/reference to related `adjustmentOrder` entity. |
| `warItemId` | `String` | Foreign key/reference to related `warItem` entity. |
| `binId` | `String?` | Foreign key/reference to related `bin` entity. |
| `baseQuantity` | `Decimal` | Stores the `baseQuantity` value for this AdjustmentOrderLine record. |
| `handledQuantity` | `Decimal` | Stores the `handledQuantity` value for this AdjustmentOrderLine record. |
| `isShort` | `Boolean` | Boolean flag controlling behavior or state. |
| `lotId` | `String?` | Foreign key/reference to related `lot` entity. |
| `serialNumberId` | `String?` | Foreign key/reference to related `serialNumber` entity. |
| `uom` | `String` | Stores the `uom` value for this AdjustmentOrderLine record. |
| `sequence` | `Int` | Stores the `sequence` value for this AdjustmentOrderLine record. |
| `userActivityEntryId` | `String?` | Foreign key/reference to related `userActivityEntry` entity. |
| `adjustmentOrder` | `AdjustmentOrder` | Stores the `adjustmentOrder` value for this AdjustmentOrderLine record. |
| `userActivityEntry` | `UserActivityEntry?` | Stores the `userActivityEntry` value for this AdjustmentOrderLine record. |
| `unitOfMeasure` | `UnitOfMeasure` | Stores the `unitOfMeasure` value for this AdjustmentOrderLine record. |

## Relations
- `adjustmentOrder` (`AdjustmentOrder`): Relation defined in Prisma via `@relation` (@relation(fields: [adjustmentOrderId], references: [id], onDelete: Cascade)).
- `userActivityEntry` (`UserActivityEntry?`): Relation defined in Prisma via `@relation` (@relation("UserActivityAdjustmentOrderLines", fields: [userActivityEntryId], references: [id])).
- `unitOfMeasure` (`UnitOfMeasure`): Relation defined in Prisma via `@relation` (@relation(fields: [uom], references: [id])).
