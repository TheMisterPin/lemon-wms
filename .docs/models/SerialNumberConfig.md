# SerialNumberConfig

## Purpose
Defines serial generation rules per entity/item/warehouse.

## Fields
| Field | Type | Purpose |
|---|---|---|
| `id` | `String` | Primary identifier for the record. |
| `entityType` | `SerialEntityType` | Enum-based state/classification for business logic. |
| `prefix` | `String?` | Stores the `prefix` value for this SerialNumberConfig record. |
| `format` | `String` | Stores the `format` value for this SerialNumberConfig record. |
| `lastValue` | `Int` | Stores the `lastValue` value for this SerialNumberConfig record. |
| `incrementBy` | `Int` | Stores the `incrementBy` value for this SerialNumberConfig record. |
| `mode` | `SerialMode` | Enum-based state/classification for business logic. |
| `warehouseId` | `String?` | Foreign key/reference to related `warehouse` entity. |
| `createdAt` | `DateTime` | Timestamp used for lifecycle/audit tracking. |
| `itemId` | `String?` | Foreign key/reference to related `item` entity. |
| `serials` | `SerialNumber[]` | Stores the `serials` value for this SerialNumberConfig record. |
| `item` | `Item?` | Stores the `item` value for this SerialNumberConfig record. |
| `warehouse` | `Warehouse?` | Stores the `warehouse` value for this SerialNumberConfig record. |

## Relations
- `item` (`Item?`): Relation defined in Prisma via `@relation` (@relation(fields: [itemId], references: [id])).
- `warehouse` (`Warehouse?`): Relation defined in Prisma via `@relation` (@relation(fields: [warehouseId], references: [id])).
