# Data Structure

This document explains the database-level domain structure for Lemon WMS and links to detailed model/enum documentation derived from `prisma/schema.prisma`.

## Models

- [BusinessParty](./models/BusinessParty.md): Represents an external organization the warehouse business interacts with, such as a supplier, customer, or carrier.
- [ContactPerson](./models/ContactPerson.md): Stores person-level contact data for a business party.
- [Address](./models/Address.md): Stores addresses for a business party (billing, shipping, returns, etc.).
- [Warehouse](./models/Warehouse.md): Represents a physical warehouse and anchors most operational records.
- [Zone](./models/Zone.md): Represents an area inside a warehouse used for specific operations.
- [Bin](./models/Bin.md): Represents a concrete storage or handling location inside a zone.
- [User](./models/User.md): Represents a platform user and authentication/authorization state.
- [Device](./models/Device.md): Represents floor or office hardware used to access WMS workflows.
- [RefreshToken](./models/RefreshToken.md): Stores refresh tokens issued to users/devices for sessions.
- [BinStockItem](./models/BinStockItem.md): Represents on-hand, reserved, or blocked stock for an item in a specific bin and tracking context.
- [WarehouseAssignment](./models/WarehouseAssignment.md): Maps users to warehouses (and optionally zones) they can operate in.
- [OrderAssignment](./models/OrderAssignment.md): Maps users to specific operational orders.
- [Item](./models/Item.md): Represents a sellable/storable SKU with tracking and UOM configuration.
- [ItemCategory](./models/ItemCategory.md): Represents category hierarchy and handling metadata for items.
- [Lot](./models/Lot.md): Represents a lot/batch instance for lot-tracked inventory.
- [SerialNumber](./models/SerialNumber.md): Represents a generated serial tracked for inventory units/entities.
- [SerialNumberConfig](./models/SerialNumberConfig.md): Defines serial generation rules per entity/item/warehouse.
- [Box](./models/Box.md): Represents a handling unit/container used in floor operations.
- [BoxLine](./models/BoxLine.md): Represents an inventory line captured inside a box.
- [PurchaseOrder](./models/PurchaseOrder.md): Represents inbound procurement demand to receive stock.
- [PurchaseOrderLine](./models/PurchaseOrderLine.md): Represents a SKU line to be received for a purchase order.
- [SalesOrder](./models/SalesOrder.md): Represents outbound customer demand to ship stock.
- [SalesOrderLine](./models/SalesOrderLine.md): Represents a SKU line to pick/ship for a sales order.
- [TransferOrder](./models/TransferOrder.md): Represents stock movement demand between bins/locations.
- [TransferOrderLine](./models/TransferOrderLine.md): Represents a SKU line to move in a transfer order.
- [ReturnOrder](./models/ReturnOrder.md): Represents inbound return demand tied to prior outbound activity.
- [ReturnOrderLine](./models/ReturnOrderLine.md): Represents a SKU line to receive/disposition in a return order.
- [AdjustmentOrder](./models/AdjustmentOrder.md): Represents inventory correction demand (gain/loss/reclass).
- [AdjustmentOrderLine](./models/AdjustmentOrderLine.md): Represents an adjustment line with counted/handled quantity.
- [UserActivityEntry](./models/UserActivityEntry.md): Represents audit trail events performed by users.
- [BinOperationEntry](./models/BinOperationEntry.md): Represents atomic bin-level movement/operation events.
- [ItemLedgerEntry](./models/ItemLedgerEntry.md): Represents fiscal inventory ledger postings derived from operations.
- [AlertRule](./models/AlertRule.md): Defines proactive rules that trigger operational notifications.
- [Notification](./models/Notification.md): Represents a user-facing notification message.
- [Error](./models/Error.md): Stores captured application/runtime errors for diagnostics.
- [UnitOfMeasure](./models/UnitOfMeasure.md): Represents master units used across items and movement/transaction lines.

## Enums

- [ErrorType](./enums/ErrorType.md): Classifies captured errors by origin/type.
- [FiscalInventoryEventType](./enums/FiscalInventoryEventType.md): Classifies fiscal inventory ledger events.
- [BinOperationType](./enums/BinOperationType.md): Classifies warehouse operation events performed in bins.
- [BinItemStatus](./enums/BinItemStatus.md): Represents current availability state of stock in a bin.
- [Role](./enums/Role.md): Defines authorization roles for users.
- [LoginType](./enums/LoginType.md): Defines allowed user login mechanisms.
- [LoginMode](./enums/LoginMode.md): Defines how devices/users authenticate during login.
- [WarehouseStatus](./enums/WarehouseStatus.md): Represents warehouse lifecycle status.
- [ZoneType](./enums/ZoneType.md): Represents functional type of a warehouse zone.
- [BinType](./enums/BinType.md): Represents functional type of a bin.
- [ItemTrackingMode](./enums/ItemTrackingMode.md): Defines item-level inventory tracking strategy.
- [LotStatus](./enums/LotStatus.md): Represents lifecycle state of a lot.
- [SerialStatus](./enums/SerialStatus.md): Represents lifecycle state of a serial number.
- [SerialEntityType](./enums/SerialEntityType.md): Defines entity kinds a serial configuration/record can target.
- [SerialMode](./enums/SerialMode.md): Defines serial generation behavior.
- [BoxStatus](./enums/BoxStatus.md): Represents lifecycle state of a box/container.
- [OrderPriority](./enums/OrderPriority.md): Represents execution urgency for orders.
- [OrderStatus](./enums/OrderStatus.md): Represents lifecycle state for operational orders.
- [OrderType](./enums/OrderType.md): Represents the operational order family.
- [LedgerEntryType](./enums/LedgerEntryType.md): Legacy/alternate grouping of ledger entry direction/type.
- [AlertRuleType](./enums/AlertRuleType.md): Defines rule categories for generating alerts.
- [DeviceType](./enums/DeviceType.md): Defines hardware/device categories in the platform.
- [BusinessPartyType](./enums/BusinessPartyType.md): Defines external party classification.
- [AddressType](./enums/AddressType.md): Defines semantic purpose of an address record.
