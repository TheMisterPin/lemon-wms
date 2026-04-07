# Notification

## Purpose
Represents a user-facing notification message.

## Fields
| Field | Type | Purpose |
|---|---|---|
| `id` | `String` | Primary identifier for the record. |
| `userId` | `String` | Foreign key/reference to related `user` entity. |
| `type` | `String` | Enum-based state/classification for business logic. |
| `title` | `String` | Stores the `title` value for this Notification record. |
| `body` | `String` | Stores the `body` value for this Notification record. |
| `entityType` | `String?` | Enum-based state/classification for business logic. |
| `entityId` | `String?` | Foreign key/reference to related `entity` entity. |
| `isRead` | `Boolean` | Boolean flag controlling behavior or state. |
| `createdAt` | `DateTime` | Timestamp used for lifecycle/audit tracking. |
| `user` | `User` | Stores the `user` value for this Notification record. |

## Relations
- `user` (`User`): Relation defined in Prisma via `@relation` (@relation(fields: [userId], references: [id])).
