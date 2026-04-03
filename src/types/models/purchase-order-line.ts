import type { IUnitOfMeasure } from './unit-of-measure'

export interface IPurchaseOrderLine {
  id: string
  purchaseOrderId: string
  warItemId: string
  binId: string | null
  baseQuantity: number
  handledQuantity: number
  isShort: boolean
  lotId: string | null
  serialNumberId: string | null
  uomCode: string
  uom?: IUnitOfMeasure
}
