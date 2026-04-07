# ItemLedgerEntry

## Purpose
Represents fiscal inventory ledger postings derived from operations.

## Fields
| Field | Type | Purpose |
|---|---|---|
| `warehouseId` | `String` | Foreign key/reference to related `warehouse` entity. |
| `warItemId` | `String` | Foreign key/reference to related `warItem` entity. |
| `lotId` | `String?` | Foreign key/reference to related `lot` entity. |
| `serialNumberId` | `String?` | Foreign key/reference to related `serialNumber` entity. |
| `orderId` | `String?` | Foreign key/reference to related `order` entity. |
| `orderType` | `OrderType?` | Enum-based state/classification for business logic. |
| `boeId` | `String?` | Foreign key/reference to related `boe` entity. |
| `createdAt` | `DateTime` | Timestamp used for lifecycle/audit tracking. |
| `eventType` | `FiscalInventoryEventType` | Stores the `eventType` value for this ItemLedgerEntry record. |
| `externalDocumentRef` | `String?` | Stores the `externalDocumentRef` value for this ItemLedgerEntry record. |
| `performedByUserId` | `String?` | Foreign key/reference to related `performedByUser` entity. |
| `quantityDelta` | `Decimal` | Stores the `quantityDelta` value for this ItemLedgerEntry record. |
| `reasonCode` | `String?` | Stores the `reasonCode` value for this ItemLedgerEntry record. |
| `reference` | `String?` | Stores the `reference` value for this ItemLedgerEntry record. |
| `uom` | `String` | Stores the `uom` value for this ItemLedgerEntry record. |
| `id` | `Int` | Primary identifier for the record. |
| `boe` | `BinOperationEntry?` | Stores the `boe` value for this ItemLedgerEntry record. |
| `unitOfMeasure` | `UnitOfMeasure` | Stores the `unitOfMeasure` value for this ItemLedgerEntry record. |
| `warehouse` | `Warehouse` | Stores the `warehouse` value for this ItemLedgerEntry record. |

## Relations
- `boe` (`BinOperationEntry?`): Relation defined in Prisma via `@relation` (@relation(fields: [boeId], references: [id])).
- `unitOfMeasure` (`UnitOfMeasure`): Relation defined in Prisma via `@relation` (@relation(fields: [uom], references: [id])).
- `warehouse` (`Warehouse`): Relation defined in Prisma via `@relation` (@relation(fields: [warehouseId], references: [id])).
