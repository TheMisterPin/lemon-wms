import type { ReceiptOutcome } from '@/generated/prisma'

/**
 * GET /api/warehouse/orders/purchase/:id/receipt — line envelope (mirror of ReceiptLineRow server shape).
 */
export type WarehousePurchaseOrderReceiptLineApi = {
  id: string
  purchaseOrderLineId: string
  itemId: string
  itemNameSnapshot: string
  uom: string
  quantity: string
  orderedQuantity: string
  /** Last declared outcome for this primary line */
  disposition: ReceiptOutcome | string
  notes: string | null
}

/**
 * GET /api/warehouse/orders/purchase/:id/receipt — document envelope (mirror of ReceiptWithLines server shape).
 */
export type WarehousePurchaseOrderReceiptApi = {
  id: string
  reference: string
  status: string
  purchaseOrderId: string
  totalProcessedQuantity: string
  totalAcceptedQuantity: string
  totalRejectedQuantity: string
  totalQuarantinedQty: string
  lines: WarehousePurchaseOrderReceiptLineApi[]
}
