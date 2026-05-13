export interface ITransferOrderLine {
  id: string
  transferOrderId: string
  warItemId: string
  binId: string | null
  baseQuantity: number
  lotId: string | null
  serialNumberId: string | null
  uom: string
}
