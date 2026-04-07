# Address

## Purpose
Stores addresses for a business party (billing, shipping, returns, etc.).

## Fields
| Field | Type | Purpose |
|---|---|---|
| `id` | `String` | Primary identifier for the record. |
| `businessPartyId` | `String` | Foreign key/reference to related `businessParty` entity. |
| `type` | `AddressType` | Enum-based state/classification for business logic. |
| `label` | `String?` | Stores the `label` value for this Address record. |
| `streetLine1` | `String` | Stores the `streetLine1` value for this Address record. |
| `streetLine2` | `String?` | Stores the `streetLine2` value for this Address record. |
| `city` | `String` | Stores the `city` value for this Address record. |
| `state` | `String?` | Stores the `state` value for this Address record. |
| `postalCode` | `String` | Stores the `postalCode` value for this Address record. |
| `country` | `String` | Stores the `country` value for this Address record. |
| `isPrimary` | `Boolean` | Boolean flag controlling behavior or state. |
| `createdAt` | `DateTime` | Timestamp used for lifecycle/audit tracking. |
| `updatedAt` | `DateTime` | Timestamp used for lifecycle/audit tracking. |
| `businessParty` | `BusinessParty` | Stores the `businessParty` value for this Address record. |

## Relations
- `businessParty` (`BusinessParty`): Relation defined in Prisma via `@relation` (@relation(fields: [businessPartyId], references: [id], onDelete: Cascade)).
