export interface IReturnOrderLine {
  id: string
  returnOrderId: string
  warItemId: string
  binId: string | null
  baseQuantity: number
  handledQuantity: number
  isShort: boolean
  lotId: string | null
  serialNumberId: string | null
  uom: string
}
