# OrderAssignment

## Purpose
Maps users to specific operational orders.

## Fields
| Field | Type | Purpose |
|---|---|---|
| `id` | `String` | Primary identifier for the record. |
| `orderId` | `String` | Foreign key/reference to related `order` entity. |
| `orderType` | `OrderType` | Enum-based state/classification for business logic. |
| `userId` | `String` | Foreign key/reference to related `user` entity. |
| `createdAt` | `DateTime` | Timestamp used for lifecycle/audit tracking. |
| `user` | `User` | Stores the `user` value for this OrderAssignment record. |
| `userActivities` | `UserActivityEntry[]` | Stores the `userActivities` value for this OrderAssignment record. |

## Relations
- `user` (`User`): Relation defined in Prisma via `@relation` (@relation(fields: [userId], references: [id], onDelete: Cascade)).
- `userActivities` (`UserActivityEntry[]`): Relation defined in Prisma via `@relation` (@relation("OrderAssignmentActivities")).
