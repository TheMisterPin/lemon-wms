# Error

## Purpose
Stores captured application/runtime errors for diagnostics.

## Fields
| Field | Type | Purpose |
|---|---|---|
| `id` | `String` | Primary identifier for the record. |
| `message` | `String` | Stores the `message` value for this Error record. |
| `stack` | `String?` | Stores the `stack` value for this Error record. |
| `type` | `ErrorType` | Enum-based state/classification for business logic. |
| `errorCode` | `Int?` | Stores the `errorCode` value for this Error record. |
| `createdAt` | `DateTime` | Timestamp used for lifecycle/audit tracking. |

## Relations
- This model has no explicit `@relation` fields; links are implicit via foreign keys or reverse relations.
