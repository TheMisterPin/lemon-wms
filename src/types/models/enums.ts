export type Role = 'OWNER' | 'OFFICE_MANAGER' | 'OFFICE_WORKER' | 'WAREHOUSE_MANAGER' | 'WAREHOUSE_WORKER'

export type LoginType = 'CREDENTIAL' | 'BADGE_PIN' | 'BOTH'

export type WarehouseStatus = 'ACTIVE' | 'INACTIVE' | 'ARCHIVED'

export type ZoneType = 'RECEIVING' | 'STORAGE' | 'PICKING' | 'PACKING' | 'SHIPPING' | 'QUARANTINE' | 'CUSTOM'

export type BinType = 'RECEIVING' | 'STORAGE' | 'PICK_FACE' | 'PACKING' | 'SHIPPING' | 'QUARANTINE' | 'STAGING' | 'CUSTOM'

export type BinItemStatus = 'AVAILABLE' | 'RESERVED' | 'BLOCKED' | 'IN_TRANSIT'

export type ItemTrackingMode = 'NONE' | 'LOT' | 'SERIAL' | 'FIFO'

export type LotStatus = 'ACTIVE' | 'QUARANTINE' | 'EXPIRED' | 'CONSUMED'

export type SerialStatus = 'IN_STOCK' | 'SHIPPED' | 'RETURNED' | 'SCRAPPED'

export type SerialEntityType = 'ITEM' | 'BOX' | 'BOX_LINE' | 'PALLET' | 'ORDER' | 'ORDER_LINE' | 'USER'

export type SerialMode = 'INCREMENTAL' | 'PARTIAL'

export type BoxStatus = 'OPEN' | 'SEALED' | 'IN_TRANSIT' | 'RECEIVED' | 'SHIPPED' | 'SCRAPPED'

export type OrderPriority = 'NORMAL' | 'URGENT' | 'EXPRESS'

export type OrderStatus =
  | 'DRAFT'
  | 'CONFIRMED'
  | 'RELEASED'
  | 'EXECUTING'
  | 'PAUSED'
  | 'EXECUTED'
  | 'EXECUTED_WITH_PROBLEMS'
  | 'SIGNED_OFF'
  | 'CANCELLED'

export type OrderType = 'PURCHASE' | 'SALES' | 'TRANSFER' | 'RETURN' | 'ADJUSTMENT'

export type LedgerEntryType = 'INBOUND' | 'OUTBOUND' | 'ADJUSTMENT' | 'TRANSFER'

export type AlertRuleType = 'LOW_STOCK' | 'EXPIRY' | 'BIN_CAPACITY'

export type DeviceType = 'FLOOR'
