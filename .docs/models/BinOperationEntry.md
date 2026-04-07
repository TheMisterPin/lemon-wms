# BinOperationEntry

## Purpose
Represents atomic bin-level movement/operation events.

## Fields
| Field | Type | Purpose |
|---|---|---|
| `id` | `String` | Primary identifier for the record. |
| `userId` | `String` | Foreign key/reference to related `user` entity. |
| `fromBinId` | `String?` | Foreign key/reference to related `fromBin` entity. |
| `toBinId` | `String?` | Foreign key/reference to related `toBin` entity. |
| `warItemId` | `String` | Foreign key/reference to related `warItem` entity. |
| `quantity` | `Decimal` | Stores the `quantity` value for this BinOperationEntry record. |
| `lotId` | `String?` | Foreign key/reference to related `lot` entity. |
| `serialNumberId` | `String?` | Foreign key/reference to related `serialNumber` entity. |
| `orderId` | `String?` | Foreign key/reference to related `order` entity. |
| `orderType` | `OrderType?` | Enum-based state/classification for business logic. |
| `createdAt` | `DateTime` | Timestamp used for lifecycle/audit tracking. |
| `affectsFiscalStock` | `Boolean` | Stores the `affectsFiscalStock` value for this BinOperationEntry record. |
| `boxId` | `String?` | Foreign key/reference to related `box` entity. |
| `notes` | `String?` | Stores the `notes` value for this BinOperationEntry record. |
| `reasonCode` | `String?` | Stores the `reasonCode` value for this BinOperationEntry record. |
| `reversedByEntryId` | `String?` | Foreign key/reference to related `reversedByEntry` entity. |
| `reversesEntryId` | `String?` | Foreign key/reference to related `reversesEntry` entity. |
| `type` | `BinOperationType` | Enum-based state/classification for business logic. |
| `uom` | `String` | Stores the `uom` value for this BinOperationEntry record. |
| `userActivityEntryId` | `String?` | Foreign key/reference to related `userActivityEntry` entity. |
| `warehouseId` | `String` | Foreign key/reference to related `warehouse` entity. |
| `userActivityEntry` | `UserActivityEntry?` | Stores the `userActivityEntry` value for this BinOperationEntry record. |
| `user` | `User` | Stores the `user` value for this BinOperationEntry record. |
| `unitOfMeasure` | `UnitOfMeasure` | Stores the `unitOfMeasure` value for this BinOperationEntry record. |
| `warehouse` | `Warehouse` | Stores the `warehouse` value for this BinOperationEntry record. |
| `itemLedgers` | `ItemLedgerEntry[]` | Stores the `itemLedgers` value for this BinOperationEntry record. |

## Relations
- `userActivityEntry` (`UserActivityEntry?`): Relation defined in Prisma via `@relation` (@relation(fields: [userActivityEntryId], references: [id])).
- `user` (`User`): Relation defined in Prisma via `@relation` (@relation(fields: [userId], references: [id])).
- `unitOfMeasure` (`UnitOfMeasure`): Relation defined in Prisma via `@relation` (@relation(fields: [uom], references: [id])).
- `warehouse` (`Warehouse`): Relation defined in Prisma via `@relation` (@relation(fields: [warehouseId], references: [id])).
