# AlertRule

## Purpose
Defines proactive rules that trigger operational notifications.

## Fields
| Field | Type | Purpose |
|---|---|---|
| `id` | `String` | Primary identifier for the record. |
| `type` | `AlertRuleType` | Enum-based state/classification for business logic. |
| `warehouseId` | `String` | Foreign key/reference to related `warehouse` entity. |
| `warItemId` | `String?` | Foreign key/reference to related `warItem` entity. |
| `threshold` | `Int` | Stores the `threshold` value for this AlertRule record. |
| `recipientRole` | `Role` | Stores the `recipientRole` value for this AlertRule record. |
| `createdAt` | `DateTime` | Timestamp used for lifecycle/audit tracking. |
| `warehouse` | `Warehouse` | Stores the `warehouse` value for this AlertRule record. |

## Relations
- `warehouse` (`Warehouse`): Relation defined in Prisma via `@relation` (@relation(fields: [warehouseId], references: [id])).
