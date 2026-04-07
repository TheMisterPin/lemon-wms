# Device

## Purpose
Represents floor or office hardware used to access WMS workflows.

## Fields
| Field | Type | Purpose |
|---|---|---|
| `id` | `String` | Primary identifier for the record. |
| `name` | `String` | Stores the `name` value for this Device record. |
| `code` | `String` | Stores the `code` value for this Device record. |
| `warehouseId` | `String?` | Foreign key/reference to related `warehouse` entity. |
| `zoneId` | `String?` | Foreign key/reference to related `zone` entity. |
| `authorized` | `Boolean` | Stores the `authorized` value for this Device record. |
| `isActive` | `Boolean` | Boolean flag controlling behavior or state. |
| `type` | `DeviceType` | Enum-based state/classification for business logic. |
| `registeredAt` | `DateTime` | Timestamp used for lifecycle/audit tracking. |
| `lastSeenAt` | `DateTime?` | Timestamp used for lifecycle/audit tracking. |
| `loginMode` | `LoginMode` | Enum-based state/classification for business logic. |
| `lastUserId` | `String?` | Foreign key/reference to related `lastUser` entity. |
| `lastUser` | `User?` | Stores the `lastUser` value for this Device record. |
| `warehouse` | `Warehouse?` | Stores the `warehouse` value for this Device record. |
| `zone` | `Zone?` | Stores the `zone` value for this Device record. |
| `loggedInByUsers` | `User[]` | Stores the `loggedInByUsers` value for this Device record. |

## Relations
- `lastUser` (`User?`): Relation defined in Prisma via `@relation` (@relation("DeviceLastUser", fields: [lastUserId], references: [id])).
- `warehouse` (`Warehouse?`): Relation defined in Prisma via `@relation` (@relation(fields: [warehouseId], references: [id])).
- `zone` (`Zone?`): Relation defined in Prisma via `@relation` (@relation(fields: [zoneId], references: [id])).
- `loggedInByUsers` (`User[]`): Relation defined in Prisma via `@relation` (@relation("UserLastDevice")).
