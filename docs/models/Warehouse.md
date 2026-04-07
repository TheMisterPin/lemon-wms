# Warehouse

## Purpose
Represents a physical warehouse and anchors most operational records.

## Fields
| Field | Type | Purpose |
|---|---|---|
| `id` | `String` | Primary identifier for the record. |
| `name` | `String` | Stores the `name` value for this Warehouse record. |
| `address` | `String?` | Stores the `address` value for this Warehouse record. |
| `timezone` | `String?` | Stores the `timezone` value for this Warehouse record. |
| `currency` | `String?` | Stores the `currency` value for this Warehouse record. |
| `status` | `WarehouseStatus` | Enum-based state/classification for business logic. |
| `createdById` | `String?` | Foreign key/reference to related `createdBy` entity. |
| `deletedAt` | `DateTime?` | Timestamp used for lifecycle/audit tracking. |
| `createdAt` | `DateTime` | Timestamp used for lifecycle/audit tracking. |
| `adjustOrders` | `AdjustmentOrder[]` | Stores the `adjustOrders` value for this Warehouse record. |
| `alertRules` | `AlertRule[]` | Stores the `alertRules` value for this Warehouse record. |
| `bins` | `Bin[]` | Stores the `bins` value for this Warehouse record. |
| `binOperationEntries` | `BinOperationEntry[]` | Stores the `binOperationEntries` value for this Warehouse record. |
| `boxes` | `Box[]` | Stores the `boxes` value for this Warehouse record. |
| `devices` | `Device[]` | Stores the `devices` value for this Warehouse record. |
| `itemLedger` | `ItemLedgerEntry[]` | Stores the `itemLedger` value for this Warehouse record. |
| `purchaseOrders` | `PurchaseOrder[]` | Stores the `purchaseOrders` value for this Warehouse record. |
| `returnOrders` | `ReturnOrder[]` | Stores the `returnOrders` value for this Warehouse record. |
| `salesOrders` | `SalesOrder[]` | Stores the `salesOrders` value for this Warehouse record. |
| `serialConfigs` | `SerialNumberConfig[]` | Stores the `serialConfigs` value for this Warehouse record. |
| `transferOrders` | `TransferOrder[]` | Stores the `transferOrders` value for this Warehouse record. |
| `uaeEntries` | `UserActivityEntry[]` | Stores the `uaeEntries` value for this Warehouse record. |
| `createdBy` | `User?` | Stores the `createdBy` value for this Warehouse record. |
| `assignments` | `WarehouseAssignment[]` | Stores the `assignments` value for this Warehouse record. |
| `zones` | `Zone[]` | Stores the `zones` value for this Warehouse record. |

## Relations
- `createdBy` (`User?`): Relation defined in Prisma via `@relation` (@relation("WarehouseCreatedBy", fields: [createdById], references: [id])).
