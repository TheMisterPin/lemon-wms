# TransferOrder

## Purpose
Represents stock movement demand between bins/locations.

## Fields
| Field | Type | Purpose |
|---|---|---|
| `id` | `String` | Primary identifier for the record. |
| `reference` | `String` | Stores the `reference` value for this TransferOrder record. |
| `status` | `OrderStatus` | Enum-based state/classification for business logic. |
| `priority` | `OrderPriority` | Enum-based state/classification for business logic. |
| `warehouseId` | `String` | Foreign key/reference to related `warehouse` entity. |
| `notes` | `String?` | Stores the `notes` value for this TransferOrder record. |
| `destinationBinId` | `String?` | Foreign key/reference to related `destinationBin` entity. |
| `originBinId` | `String?` | Foreign key/reference to related `originBin` entity. |
| `isCrossWarehouse` | `Boolean` | Boolean flag controlling behavior or state. |
| `createdById` | `String` | Foreign key/reference to related `createdBy` entity. |
| `confirmedById` | `String?` | Foreign key/reference to related `confirmedBy` entity. |
| `confirmedAt` | `DateTime?` | Timestamp used for lifecycle/audit tracking. |
| `assignedWMId` | `String?` | Foreign key/reference to related `assignedWM` entity. |
| `deletedAt` | `DateTime?` | Timestamp used for lifecycle/audit tracking. |
| `createdAt` | `DateTime` | Timestamp used for lifecycle/audit tracking. |
| `destinationBin` | `Bin?` | Stores the `destinationBin` value for this TransferOrder record. |
| `originBin` | `Bin?` | Stores the `originBin` value for this TransferOrder record. |
| `warehouse` | `Warehouse` | Stores the `warehouse` value for this TransferOrder record. |
| `lines` | `TransferOrderLine[]` | Stores the `lines` value for this TransferOrder record. |

## Relations
- `destinationBin` (`Bin?`): Relation defined in Prisma via `@relation` (@relation("TransferToBin", fields: [destinationBinId], references: [id])).
- `originBin` (`Bin?`): Relation defined in Prisma via `@relation` (@relation("TransferFromBin", fields: [originBinId], references: [id])).
- `warehouse` (`Warehouse`): Relation defined in Prisma via `@relation` (@relation(fields: [warehouseId], references: [id])).
