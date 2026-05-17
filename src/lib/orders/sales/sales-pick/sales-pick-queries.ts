import type { PrismaClient } from '@/generated/prisma'

import { DomainError } from '@/lib/errors'

export type PickLineRow = {
  id: string
  salesOrderLineId: string
  itemId: string
  itemNameSnapshot: string
  uom: string
  quantity: string
  orderedQuantity: string
  disposition: string
  notes: string | null
}

export type PickWithLines = {
  id: string
  reference: string
  status: string
  salesOrderId: string
  totalPickedQuantity: string
  totalShortQuantity: string
  lines: PickLineRow[]
}

export async function getActivePickForSalesOrder(
  prisma: PrismaClient,
  salesOrderId: string,
  warehouseId: string
): Promise<PickWithLines | null> {
  const pick = await prisma.salesOrderPick.findFirst({
    where: { salesOrderId, deletedAt: null },
    select: {
      id: true,
      reference: true,
      status: true,
      salesOrderId: true,
      warehouseId: true,
      totalPickedQuantity: true,
      totalShortQuantity: true,
      lines: {
        where: { correctionOfLineId: null },
        select: {
          id: true,
          salesOrderLineId: true,
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

  if (!pick) {
    return null
  }

  if (pick.warehouseId !== warehouseId) {
    throw new DomainError('Pick does not belong to your warehouse.', 'FORBIDDEN', 403)
  }

  return {
    id: pick.id,
    reference: pick.reference,
    status: pick.status,
    salesOrderId: pick.salesOrderId,
    totalPickedQuantity: pick.totalPickedQuantity.toString(),
    totalShortQuantity: pick.totalShortQuantity.toString(),
    lines: pick.lines.map((l) => ({
      id: l.id,
      salesOrderLineId: l.salesOrderLineId,
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
