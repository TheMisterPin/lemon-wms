# BusinessParty

## Purpose
Represents an external organization the warehouse business interacts with, such as a supplier, customer, or carrier.

## Fields
| Field | Type | Purpose |
|---|---|---|
| `id` | `String` | Primary identifier for the record. |
| `code` | `String` | Stores the `code` value for this BusinessParty record. |
| `type` | `BusinessPartyType` | Enum-based state/classification for business logic. |
| `name` | `String` | Stores the `name` value for this BusinessParty record. |
| `legalName` | `String?` | Stores the `legalName` value for this BusinessParty record. |
| `email` | `String?` | Stores the `email` value for this BusinessParty record. |
| `phone` | `String?` | Stores the `phone` value for this BusinessParty record. |
| `website` | `String?` | Stores the `website` value for this BusinessParty record. |
| `vatNumber` | `String?` | Stores the `vatNumber` value for this BusinessParty record. |
| `taxId` | `String?` | Foreign key/reference to related `tax` entity. |
| `isActive` | `Boolean` | Boolean flag controlling behavior or state. |
| `notes` | `String?` | Stores the `notes` value for this BusinessParty record. |
| `createdAt` | `DateTime` | Timestamp used for lifecycle/audit tracking. |
| `updatedAt` | `DateTime` | Timestamp used for lifecycle/audit tracking. |
| `addresses` | `Address[]` | Stores the `addresses` value for this BusinessParty record. |
| `contacts` | `ContactPerson[]` | Stores the `contacts` value for this BusinessParty record. |
| `purchaseOrders` | `PurchaseOrder[]` | Stores the `purchaseOrders` value for this BusinessParty record. |
| `salesOrders` | `SalesOrder[]` | Stores the `salesOrders` value for this BusinessParty record. |

## Relations
- `purchaseOrders` (`PurchaseOrder[]`): Relation defined in Prisma via `@relation` (@relation("SupplierPurchaseOrders")).
- `salesOrders` (`SalesOrder[]`): Relation defined in Prisma via `@relation` (@relation("CustomerSalesOrders")).
