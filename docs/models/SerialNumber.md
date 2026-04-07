# SerialNumber

## Purpose
Represents a generated serial tracked for inventory units/entities.

## Fields
| Field | Type | Purpose |
|---|---|---|
| `id` | `String` | Primary identifier for the record. |
| `serial` | `String` | Stores the `serial` value for this SerialNumber record. |
| `configId` | `String` | Foreign key/reference to related `config` entity. |
| `entityType` | `SerialEntityType` | Enum-based state/classification for business logic. |
| `baseValue` | `Int` | Stores the `baseValue` value for this SerialNumber record. |
| `partialCurrent` | `Int?` | Stores the `partialCurrent` value for this SerialNumber record. |
| `partialTotal` | `Int?` | Stores the `partialTotal` value for this SerialNumber record. |
| `status` | `SerialStatus` | Enum-based state/classification for business logic. |
| `createdAt` | `DateTime` | Timestamp used for lifecycle/audit tracking. |
| `itemId` | `String?` | Foreign key/reference to related `item` entity. |
| `binStockItems` | `BinStockItem[]` | Stores the `binStockItems` value for this SerialNumber record. |
| `boxLines` | `BoxLine[]` | Stores the `boxLines` value for this SerialNumber record. |
| `config` | `SerialNumberConfig` | Stores the `config` value for this SerialNumber record. |
| `item` | `Item?` | Stores the `item` value for this SerialNumber record. |

## Relations
- `config` (`SerialNumberConfig`): Relation defined in Prisma via `@relation` (@relation(fields: [configId], references: [id])).
- `item` (`Item?`): Relation defined in Prisma via `@relation` (@relation(fields: [itemId], references: [id])).
