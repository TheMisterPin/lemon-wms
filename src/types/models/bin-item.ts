import type { BinItemStatus } from './enums'
import type { IUnitOfMeasure } from './unit-of-measure'

export interface IBinItem {
  id: string
  binId: string
  warItemId: string
  lotId: string | null
  serialNumberId: string | null
  quantityAvailable: number
  quantityReserved: number
  quantityBlocked: number
  uomCode: string
  uom?: IUnitOfMeasure
  status: BinItemStatus
  expiryDate: Date | null
  createdAt: Date
}
