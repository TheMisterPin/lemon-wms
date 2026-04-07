# Lot

## Purpose
Represents a lot/batch instance for lot-tracked inventory.

## Fields
| Field | Type | Purpose |
|---|---|---|
| `id` | `String` | Primary identifier for the record. |
| `lotNumber` | `String` | Stores the `lotNumber` value for this Lot record. |
| `purchaseOrderId` | `String?` | Foreign key/reference to related `purchaseOrder` entity. |
| `receivedDate` | `DateTime` | Stores the `receivedDate` value for this Lot record. |
| `expiryDate` | `DateTime?` | Stores the `expiryDate` value for this Lot record. |
| `status` | `LotStatus` | Enum-based state/classification for business logic. |
| `createdAt` | `DateTime` | Timestamp used for lifecycle/audit tracking. |
| `itemId` | `String?` | Foreign key/reference to related `item` entity. |
| `binStockItems` | `BinStockItem[]` | Stores the `binStockItems` value for this Lot record. |
| `boxLines` | `BoxLine[]` | Stores the `boxLines` value for this Lot record. |
| `item` | `Item?` | Stores the `item` value for this Lot record. |

## Relations
- `item` (`Item?`): Relation defined in Prisma via `@relation` (@relation(fields: [itemId], references: [id])).
