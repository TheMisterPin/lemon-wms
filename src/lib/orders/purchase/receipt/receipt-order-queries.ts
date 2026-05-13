import type { PrismaClient } from '@/generated/prisma'

import { DomainError } from '@/lib/errors'

export type ReceiptLineRow = {
  id: string
  purchaseOrderLineId: string
  itemId: string
  itemNameSnapshot: string
  uom: string
  quantity: string
  orderedQuantity: string
  disposition: string
  notes: string | null
}

export type ReceiptWithLines = {
  id: string
  reference: string
  status: string
  purchaseOrderId: string
  totalProcessedQuantity: string
  totalAcceptedQuantity: string
  totalRejectedQuantity: string
  totalQuarantinedQty: string
  lines: ReceiptLineRow[]
}

export async function getActiveReceiptForPurchaseOrder(
  prisma: PrismaClient,
  purchaseOrderId: string,
  warehouseId: string
): Promise<ReceiptWithLines | null> {
  const receipt = await prisma.purchaseOrderReceipt.findFirst({
    where: {
      purchaseOrderId,
      deletedAt: null
    },
    select: {
      id: true,
      reference: true,
      status: true,
      purchaseOrderId: true,
      warehouseId: true,
      totalProcessedQuantity: true,
      totalAcceptedQuantity: true,
      totalRejectedQuantity: true,
      totalQuarantinedQty: true,
      lines: {
        where: { correctionOfLineId: null },
        select: {
          id: true,
          purchaseOrderLineId: true,
          itemId: true,
          itemNameSnapshot: true,
          uom: true,
          quantity: true,
          orderedQuantity: true,
          disposition: true,
          notes: true
        },
        orderBy: { createdAt: 'asc' }
      }
    }
  })

  if (!receipt) {
    return null
  }

  if (receipt.warehouseId !== warehouseId) {
    throw new DomainError('Receipt does not belong to your warehouse.', 'FORBIDDEN', 403)
  }

  return {
    id: receipt.id,
    reference: receipt.reference,
    status: receipt.status,
    purchaseOrderId: receipt.purchaseOrderId,
    totalProcessedQuantity: receipt.totalProcessedQuantity.toString(),
    totalAcceptedQuantity: receipt.totalAcceptedQuantity.toString(),
    totalRejectedQuantity: receipt.totalRejectedQuantity.toString(),
    totalQuarantinedQty: receipt.totalQuarantinedQty.toString(),
    lines: receipt.lines.map((l) => ({
      id: l.id,
      purchaseOrderLineId: l.purchaseOrderLineId,
      itemId: l.itemId,
      itemNameSnapshot: l.itemNameSnapshot,
      uom: l.uom,
      quantity: l.quantity.toString(),
      orderedQuantity: l.orderedQuantity.toString(),
      disposition: l.disposition,
      notes: l.notes
    }))
  }
}
