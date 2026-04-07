# ContactPerson

## Purpose
Stores person-level contact data for a business party.

## Fields
| Field | Type | Purpose |
|---|---|---|
| `id` | `String` | Primary identifier for the record. |
| `businessPartyId` | `String` | Foreign key/reference to related `businessParty` entity. |
| `firstName` | `String` | Stores the `firstName` value for this ContactPerson record. |
| `lastName` | `String` | Stores the `lastName` value for this ContactPerson record. |
| `fullName` | `String` | Stores the `fullName` value for this ContactPerson record. |
| `roleTitle` | `String?` | Stores the `roleTitle` value for this ContactPerson record. |
| `email` | `String?` | Stores the `email` value for this ContactPerson record. |
| `phone` | `String?` | Stores the `phone` value for this ContactPerson record. |
| `mobile` | `String?` | Stores the `mobile` value for this ContactPerson record. |
| `isPrimary` | `Boolean` | Boolean flag controlling behavior or state. |
| `createdAt` | `DateTime` | Timestamp used for lifecycle/audit tracking. |
| `updatedAt` | `DateTime` | Timestamp used for lifecycle/audit tracking. |
| `businessParty` | `BusinessParty` | Stores the `businessParty` value for this ContactPerson record. |

## Relations
- `businessParty` (`BusinessParty`): Relation defined in Prisma via `@relation` (@relation(fields: [businessPartyId], references: [id], onDelete: Cascade)).
