# WarehouseAssignment

## Purpose
Maps users to warehouses (and optionally zones) they can operate in.

## Fields
| Field | Type | Purpose |
|---|---|---|
| `id` | `String` | Primary identifier for the record. |
| `userId` | `String` | Foreign key/reference to related `user` entity. |
| `warehouseId` | `String` | Foreign key/reference to related `warehouse` entity. |
| `zoneId` | `String?` | Foreign key/reference to related `zone` entity. |
| `createdAt` | `DateTime` | Timestamp used for lifecycle/audit tracking. |
| `user` | `User` | Stores the `user` value for this WarehouseAssignment record. |
| `warehouse` | `Warehouse` | Stores the `warehouse` value for this WarehouseAssignment record. |
| `zone` | `Zone?` | Stores the `zone` value for this WarehouseAssignment record. |

## Relations
- `user` (`User`): Relation defined in Prisma via `@relation` (@relation(fields: [userId], references: [id], onDelete: Cascade)).
- `warehouse` (`Warehouse`): Relation defined in Prisma via `@relation` (@relation(fields: [warehouseId], references: [id], onDelete: Cascade)).
- `zone` (`Zone?`): Relation defined in Prisma via `@relation` (@relation(fields: [zoneId], references: [id], onDelete: Cascade)).
