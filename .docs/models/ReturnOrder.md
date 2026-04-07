# ReturnOrder

## Purpose
Represents inbound return demand tied to prior outbound activity.

## Fields
| Field | Type | Purpose |
|---|---|---|
| `id` | `String` | Primary identifier for the record. |
| `reference` | `String` | Stores the `reference` value for this ReturnOrder record. |
| `status` | `OrderStatus` | Enum-based state/classification for business logic. |
| `priority` | `OrderPriority` | Enum-based state/classification for business logic. |
| `warehouseId` | `String` | Foreign key/reference to related `warehouse` entity. |
| `notes` | `String?` | Stores the `notes` value for this ReturnOrder record. |
| `originSalesOrderId` | `String?` | Foreign key/reference to related `originSalesOrder` entity. |
| `returnDisposition` | `String?` | Stores the `returnDisposition` value for this ReturnOrder record. |
| `createdById` | `String` | Foreign key/reference to related `createdBy` entity. |
| `confirmedById` | `String?` | Foreign key/reference to related `confirmedBy` entity. |
| `confirmedAt` | `DateTime?` | Timestamp used for lifecycle/audit tracking. |
| `assignedWMId` | `String?` | Foreign key/reference to related `assignedWM` entity. |
| `deletedAt` | `DateTime?` | Timestamp used for lifecycle/audit tracking. |
| `createdAt` | `DateTime` | Timestamp used for lifecycle/audit tracking. |
| `warehouse` | `Warehouse` | Stores the `warehouse` value for this ReturnOrder record. |
| `lines` | `ReturnOrderLine[]` | Stores the `lines` value for this ReturnOrder record. |

## Relations
- `warehouse` (`Warehouse`): Relation defined in Prisma via `@relation` (@relation(fields: [warehouseId], references: [id])).
