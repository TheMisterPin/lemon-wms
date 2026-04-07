# Bin

## Purpose
Represents a concrete storage or handling location inside a zone.

## Fields
| Field | Type | Purpose |
|---|---|---|
| `id` | `String` | Primary identifier for the record. |
| `zoneId` | `String` | Foreign key/reference to related `zone` entity. |
| `warehouseId` | `String` | Foreign key/reference to related `warehouse` entity. |
| `name` | `String` | Stores the `name` value for this Bin record. |
| `code` | `String` | Stores the `code` value for this Bin record. |
| `type` | `BinType` | Enum-based state/classification for business logic. |
| `isBlocked` | `Boolean` | Boolean flag controlling behavior or state. |
| `blockReason` | `String?` | Stores the `blockReason` value for this Bin record. |
| `maxWeightKg` | `Decimal?` | Stores the `maxWeightKg` value for this Bin record. |
| `maxVolumeM3` | `Decimal?` | Stores the `maxVolumeM3` value for this Bin record. |
| `deletedAt` | `DateTime?` | Timestamp used for lifecycle/audit tracking. |
| `createdAt` | `DateTime` | Timestamp used for lifecycle/audit tracking. |
| `maxCapacity` | `Decimal?` | Stores the `maxCapacity` value for this Bin record. |
| `currentCapacity` | `Decimal?` | Stores the `currentCapacity` value for this Bin record. |
| `warehouse` | `Warehouse` | Stores the `warehouse` value for this Bin record. |
| `zone` | `Zone` | Stores the `zone` value for this Bin record. |
| `binStockItems` | `BinStockItem[]` | Stores the `binStockItems` value for this Bin record. |
| `boxes` | `Box[]` | Stores the `boxes` value for this Bin record. |
| `toTransfers` | `TransferOrder[]` | Stores the `toTransfers` value for this Bin record. |
| `fromTransfers` | `TransferOrder[]` | Stores the `fromTransfers` value for this Bin record. |

## Relations
- `warehouse` (`Warehouse`): Relation defined in Prisma via `@relation` (@relation(fields: [warehouseId], references: [id])).
- `zone` (`Zone`): Relation defined in Prisma via `@relation` (@relation(fields: [zoneId], references: [id])).
- `toTransfers` (`TransferOrder[]`): Relation defined in Prisma via `@relation` (@relation("TransferToBin")).
- `fromTransfers` (`TransferOrder[]`): Relation defined in Prisma via `@relation` (@relation("TransferFromBin")).
