# TransferOrderLine

## Purpose
Represents a SKU line to move in a transfer order.

## Fields
| Field | Type | Purpose |
|---|---|---|
| `id` | `String` | Primary identifier for the record. |
| `transferOrderId` | `String` | Foreign key/reference to related `transferOrder` entity. |
| `warItemId` | `String` | Foreign key/reference to related `warItem` entity. |
| `binId` | `String?` | Foreign key/reference to related `bin` entity. |
| `baseQuantity` | `Decimal` | Stores the `baseQuantity` value for this TransferOrderLine record. |
| `handledQuantity` | `Decimal` | Stores the `handledQuantity` value for this TransferOrderLine record. |
| `isShort` | `Boolean` | Boolean flag controlling behavior or state. |
| `lotId` | `String?` | Foreign key/reference to related `lot` entity. |
| `serialNumberId` | `String?` | Foreign key/reference to related `serialNumber` entity. |
| `uom` | `String` | Stores the `uom` value for this TransferOrderLine record. |
| `transferOrder` | `TransferOrder` | Stores the `transferOrder` value for this TransferOrderLine record. |
| `unitOfMeasure` | `UnitOfMeasure` | Stores the `unitOfMeasure` value for this TransferOrderLine record. |

## Relations
- `transferOrder` (`TransferOrder`): Relation defined in Prisma via `@relation` (@relation(fields: [transferOrderId], references: [id], onDelete: Cascade)).
- `unitOfMeasure` (`UnitOfMeasure`): Relation defined in Prisma via `@relation` (@relation(fields: [uom], references: [id])).
