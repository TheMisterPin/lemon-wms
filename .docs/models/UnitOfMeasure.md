# UnitOfMeasure

## Purpose
Represents master units used across items and movement/transaction lines.

## Fields
| Field | Type | Purpose |
|---|---|---|
| `id` | `String` | Primary identifier for the record. |
| `description` | `String` | Stores the `description` value for this UnitOfMeasure record. |
| `decimalRound` | `Int` | Stores the `decimalRound` value for this UnitOfMeasure record. |
| `createdAt` | `DateTime` | Timestamp used for lifecycle/audit tracking. |
| `items` | `Item[]` | Stores the `items` value for this UnitOfMeasure record. |
| `binStockItems` | `BinStockItem[]` | Stores the `binStockItems` value for this UnitOfMeasure record. |
| `boxLines` | `BoxLine[]` | Stores the `boxLines` value for this UnitOfMeasure record. |
| `purchaseOrderLines` | `PurchaseOrderLine[]` | Stores the `purchaseOrderLines` value for this UnitOfMeasure record. |
| `salesOrderLines` | `SalesOrderLine[]` | Stores the `salesOrderLines` value for this UnitOfMeasure record. |
| `transferOrderLines` | `TransferOrderLine[]` | Stores the `transferOrderLines` value for this UnitOfMeasure record. |
| `returnOrderLines` | `ReturnOrderLine[]` | Stores the `returnOrderLines` value for this UnitOfMeasure record. |
| `adjustmentOrderLines` | `AdjustmentOrderLine[]` | Stores the `adjustmentOrderLines` value for this UnitOfMeasure record. |
| `binOperationEntries` | `BinOperationEntry[]` | Stores the `binOperationEntries` value for this UnitOfMeasure record. |
| `itemLedgerEntries` | `ItemLedgerEntry[]` | Stores the `itemLedgerEntries` value for this UnitOfMeasure record. |

## Relations
- This model has no explicit `@relation` fields; links are implicit via foreign keys or reverse relations.
