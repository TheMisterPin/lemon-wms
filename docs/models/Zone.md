# Zone

## Purpose
Represents an area inside a warehouse used for specific operations.

## Fields
| Field | Type | Purpose |
|---|---|---|
| `id` | `String` | Primary identifier for the record. |
| `warehouseId` | `String` | Foreign key/reference to related `warehouse` entity. |
| `name` | `String` | Stores the `name` value for this Zone record. |
| `type` | `ZoneType` | Enum-based state/classification for business logic. |
| `customPermissions` | `Json?` | Stores the `customPermissions` value for this Zone record. |
| `isActive` | `Boolean` | Boolean flag controlling behavior or state. |
| `defaultReceivingBinId` | `String?` | Foreign key/reference to related `defaultReceivingBin` entity. |
| `defaultQuarantineBinId` | `String?` | Foreign key/reference to related `defaultQuarantineBin` entity. |
| `defaultOutgoingBinId` | `String?` | Foreign key/reference to related `defaultOutgoingBin` entity. |
| `deletedAt` | `DateTime?` | Timestamp used for lifecycle/audit tracking. |
| `createdAt` | `DateTime` | Timestamp used for lifecycle/audit tracking. |
| `bins` | `Bin[]` | Stores the `bins` value for this Zone record. |
| `devices` | `Device?` | Stores the `devices` value for this Zone record. |
| `assignments` | `WarehouseAssignment[]` | Stores the `assignments` value for this Zone record. |
| `warehouse` | `Warehouse` | Stores the `warehouse` value for this Zone record. |

## Relations
- `warehouse` (`Warehouse`): Relation defined in Prisma via `@relation` (@relation(fields: [warehouseId], references: [id])).
