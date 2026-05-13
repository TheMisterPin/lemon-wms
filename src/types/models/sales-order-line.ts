export interface ISalesOrderLine {
  id: string
  salesOrderId: string
  warItemId: string
  binId: string | null
  baseQuantity: number
  lotId: string | null
  serialNumberId: string | null
  uom: string
}
