# PurchaseOrderLine

## Purpose
Represents a SKU line to be received for a purchase order.

## Fields
| Field | Type | Purpose |
|---|---|---|
| `id` | `String` | Primary identifier for the record. |
| `purchaseOrderId` | `String` | Foreign key/reference to related `purchaseOrder` entity. |
| `warItemId` | `String` | Foreign key/reference to related `warItem` entity. |
| `binId` | `String?` | Foreign key/reference to related `bin` entity. |
| `baseQuantity` | `Decimal` | Stores the `baseQuantity` value for this PurchaseOrderLine record. |
| `handledQuantity` | `Decimal` | Stores the `handledQuantity` value for this PurchaseOrderLine record. |
| `isShort` | `Boolean` | Boolean flag controlling behavior or state. |
| `lotId` | `String?` | Foreign key/reference to related `lot` entity. |
| `serialNumberId` | `String?` | Foreign key/reference to related `serialNumber` entity. |
| `uom` | `String` | Stores the `uom` value for this PurchaseOrderLine record. |
| `userActivityEntryId` | `String?` | Foreign key/reference to related `userActivityEntry` entity. |
| `purchaseOrder` | `PurchaseOrder` | Stores the `purchaseOrder` value for this PurchaseOrderLine record. |
| `userActivityEntry` | `UserActivityEntry?` | Stores the `userActivityEntry` value for this PurchaseOrderLine record. |
| `unitOfMeasure` | `UnitOfMeasure` | Stores the `unitOfMeasure` value for this PurchaseOrderLine record. |

## Relations
- `purchaseOrder` (`PurchaseOrder`): Relation defined in Prisma via `@relation` (@relation(fields: [purchaseOrderId], references: [id], onDelete: Cascade)).
- `userActivityEntry` (`UserActivityEntry?`): Relation defined in Prisma via `@relation` (@relation("UserActivityPurchaseOrderLines", fields: [userActivityEntryId], references: [id])).
- `unitOfMeasure` (`UnitOfMeasure`): Relation defined in Prisma via `@relation` (@relation(fields: [uom], references: [id])).
