export interface IReturnOrderLine {
  id: string
  returnOrderId: string
  warItemId: string
  binId: string | null
  baseQuantity: number
  lotId: string | null
  serialNumberId: string | null
  uom: string
}
