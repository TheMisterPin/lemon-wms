# ReturnOrderLine

## Purpose
Represents a SKU line to receive/disposition in a return order.

## Fields
| Field | Type | Purpose |
|---|---|---|
| `id` | `String` | Primary identifier for the record. |
| `returnOrderId` | `String` | Foreign key/reference to related `returnOrder` entity. |
| `warItemId` | `String` | Foreign key/reference to related `warItem` entity. |
| `binId` | `String?` | Foreign key/reference to related `bin` entity. |
| `baseQuantity` | `Decimal` | Stores the `baseQuantity` value for this ReturnOrderLine record. |
| `handledQuantity` | `Decimal` | Stores the `handledQuantity` value for this ReturnOrderLine record. |
| `isShort` | `Boolean` | Boolean flag controlling behavior or state. |
| `lotId` | `String?` | Foreign key/reference to related `lot` entity. |
| `serialNumberId` | `String?` | Foreign key/reference to related `serialNumber` entity. |
| `uom` | `String` | Stores the `uom` value for this ReturnOrderLine record. |
| `returnOrder` | `ReturnOrder` | Stores the `returnOrder` value for this ReturnOrderLine record. |
| `unitOfMeasure` | `UnitOfMeasure` | Stores the `unitOfMeasure` value for this ReturnOrderLine record. |

## Relations
- `returnOrder` (`ReturnOrder`): Relation defined in Prisma via `@relation` (@relation(fields: [returnOrderId], references: [id], onDelete: Cascade)).
- `unitOfMeasure` (`UnitOfMeasure`): Relation defined in Prisma via `@relation` (@relation(fields: [uom], references: [id])).
