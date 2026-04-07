# Box

## Purpose
Represents a handling unit/container used in floor operations.

## Fields
| Field | Type | Purpose |
|---|---|---|
| `id` | `String` | Primary identifier for the record. |
| `code` | `String` | Stores the `code` value for this Box record. |
| `status` | `BoxStatus` | Enum-based state/classification for business logic. |
| `binId` | `String?` | Foreign key/reference to related `bin` entity. |
| `warehouseId` | `String` | Foreign key/reference to related `warehouse` entity. |
| `weightKg` | `Decimal?` | Stores the `weightKg` value for this Box record. |
| `notes` | `String?` | Stores the `notes` value for this Box record. |
| `createdAt` | `DateTime` | Timestamp used for lifecycle/audit tracking. |
| `bin` | `Bin?` | Stores the `bin` value for this Box record. |
| `warehouse` | `Warehouse` | Stores the `warehouse` value for this Box record. |
| `lines` | `BoxLine[]` | Stores the `lines` value for this Box record. |

## Relations
- `bin` (`Bin?`): Relation defined in Prisma via `@relation` (@relation(fields: [binId], references: [id])).
- `warehouse` (`Warehouse`): Relation defined in Prisma via `@relation` (@relation(fields: [warehouseId], references: [id])).
