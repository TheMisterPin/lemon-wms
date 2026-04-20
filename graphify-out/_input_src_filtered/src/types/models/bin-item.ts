import type { BinItemStatus } from './enums'

export interface IBinItem {
  id: string
  binId: string
  itemId: string
  lotId: string | null
  serialNumberId: string | null
  quantityAvailable: number
  quantityReserved: number
  quantityBlocked: number
  uom: string
  status: BinItemStatus
transitDeviceId: string | null
  expiryDate: Date | null
  createdAt: Date
  updatedAt: Date
  boxId: string | null
  name: string
  sku: string
  code: string
  inOtherBin: IBinInfoItem[]
  reservedByOrderId: string | null
  reservedByOrderLineId: string | null
  factboxInfo: IBinItem | null
}
export interface IBinInfoItem {
  binId: string
  quantities: {
    available: number
    reserved: number
    blocked: number
    lotId: string | null
    serialNumberId: string | null
  }[] | null
}
