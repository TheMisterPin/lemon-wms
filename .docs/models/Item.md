# Item

## Purpose
Represents a sellable/storable SKU with tracking and UOM configuration.

## Fields
| Field | Type | Purpose |
|---|---|---|
| `id` | `String` | Primary identifier for the record. |
| `sku` | `String` | Stores the `sku` value for this Item record. |
| `name` | `String` | Stores the `name` value for this Item record. |
| `description` | `String?` | Stores the `description` value for this Item record. |
| `barcode` | `String?` | Stores the `barcode` value for this Item record. |
| `categoryId` | `String?` | Foreign key/reference to related `category` entity. |
| `trackingMode` | `ItemTrackingMode` | Stores the `trackingMode` value for this Item record. |
| `uom` | `String` | Stores the `uom` value for this Item record. |
| `weightKg` | `Decimal?` | Stores the `weightKg` value for this Item record. |
| `dimensions` | `Json?` | Stores the `dimensions` value for this Item record. |
| `minQuantity` | `Decimal` | Stores the `minQuantity` value for this Item record. |
| `isActive` | `Boolean` | Boolean flag controlling behavior or state. |
| `supplierId` | `String?` | Foreign key/reference to related `supplier` entity. |
| `deletedAt` | `DateTime?` | Timestamp used for lifecycle/audit tracking. |
| `createdAt` | `DateTime` | Timestamp used for lifecycle/audit tracking. |
| `binStockItems` | `BinStockItem[]` | Stores the `binStockItems` value for this Item record. |
| `category` | `ItemCategory?` | Stores the `category` value for this Item record. |
| `lots` | `Lot[]` | Stores the `lots` value for this Item record. |
| `serialNumbers` | `SerialNumber[]` | Stores the `serialNumbers` value for this Item record. |
| `serialNumberConfigs` | `SerialNumberConfig[]` | Stores the `serialNumberConfigs` value for this Item record. |
| `unitOfMeasure` | `UnitOfMeasure` | Stores the `unitOfMeasure` value for this Item record. |

## Relations
- `category` (`ItemCategory?`): Relation defined in Prisma via `@relation` (@relation("ItemInCategory", fields: [categoryId], references: [id])).
- `unitOfMeasure` (`UnitOfMeasure`): Relation defined in Prisma via `@relation` (@relation(fields: [uom], references: [id])).
