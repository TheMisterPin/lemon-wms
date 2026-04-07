# RefreshToken

## Purpose
Stores refresh tokens issued to users/devices for sessions.

## Fields
| Field | Type | Purpose |
|---|---|---|
| `id` | `String` | Primary identifier for the record. |
| `userId` | `String` | Foreign key/reference to related `user` entity. |
| `tokenHash` | `String` | Stores the `tokenHash` value for this RefreshToken record. |
| `deviceLabel` | `String` | Stores the `deviceLabel` value for this RefreshToken record. |
| `deviceId` | `String?` | Foreign key/reference to related `device` entity. |
| `expiresAt` | `DateTime` | Timestamp used for lifecycle/audit tracking. |
| `revokedAt` | `DateTime?` | Timestamp used for lifecycle/audit tracking. |
| `createdAt` | `DateTime` | Timestamp used for lifecycle/audit tracking. |
| `user` | `User` | Stores the `user` value for this RefreshToken record. |

## Relations
- `user` (`User`): Relation defined in Prisma via `@relation` (@relation(fields: [userId], references: [id], onDelete: Cascade)).
