export type StockItemRecord = {
  id: string
  name: string
  sku: string
  lotId: string | null
  serialNumberId: string | null
  boxId: string | null
  uom: string
  quantityAvailable: number
  quantityReserved: number
  quantityBlocked: number
}
