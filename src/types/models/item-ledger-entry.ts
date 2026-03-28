import type { LedgerEntryType, OrderType } from './enums'

export interface IItemLedgerEntry {
  id: string
  warehouseId: string
  warItemId: string
  entryType: LedgerEntryType
  quantityChange: number
  lotId: string | null
  serialNumberId: string | null
  orderId: string | null
  orderType: OrderType | null
  boeId: string
  createdAt: Date
}
