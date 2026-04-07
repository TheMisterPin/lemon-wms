# ItemCategory

## Purpose
Represents category hierarchy and handling metadata for items.

## Fields
| Field | Type | Purpose |
|---|---|---|
| `id` | `String` | Primary identifier for the record. |
| `name` | `String` | Stores the `name` value for this ItemCategory record. |
| `description` | `String?` | Stores the `description` value for this ItemCategory record. |
| `hasChildren` | `Boolean` | Stores the `hasChildren` value for this ItemCategory record. |
| `parentId` | `String?` | Foreign key/reference to related `parent` entity. |
| `parent` | `ItemCategory?` | Stores the `parent` value for this ItemCategory record. |
| `children` | `ItemCategory[]` | Stores the `children` value for this ItemCategory record. |
| `handlingFlags` | `Json?` | Stores the `handlingFlags` value for this ItemCategory record. |
| `createdAt` | `DateTime` | Timestamp used for lifecycle/audit tracking. |
| `items` | `Item[]` | Stores the `items` value for this ItemCategory record. |

## Relations
- `parent` (`ItemCategory?`): Relation defined in Prisma via `@relation` (@relation("ItemCategoryChildren", fields: [parentId], references: [id])).
- `children` (`ItemCategory[]`): Relation defined in Prisma via `@relation` (@relation("ItemCategoryChildren")).
- `items` (`Item[]`): Relation defined in Prisma via `@relation` (@relation("ItemInCategory")).
