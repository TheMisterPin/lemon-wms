export interface IPurchaseOrderLine {
  id: string
  purchaseOrderId: string
  warItemId: string
  binId: string | null
  baseQuantity: number
  lotId: string | null
  serialNumberId: string | null
  uom: string
}
