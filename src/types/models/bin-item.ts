import type { BinItemStatus } from './enums'

export interface IBinItem {
  id: string
  binId: string
  warItemId: string
  lotId: string | null
  serialNumberId: string | null
  quantityAvailable: number
  quantityReserved: number
  quantityBlocked: number
  uom: string
  status: BinItemStatus
  expiryDate: Date | null
  createdAt: Date
}
