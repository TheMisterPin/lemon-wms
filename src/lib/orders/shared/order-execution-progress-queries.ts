import type { OrderType, PrismaClient } from '@/generated/prisma'

import { computePurchaseOrderProgressPercentFromMasterLines } from '@/lib/orders/shared/order-progress'
import { computePickLineProgressPercent } from '@/lib/orders/shared/pick-line-progress'

export type OrderProgressSnapshot = {
  reference: string
  progressPercent: number
  warehouseId: string
}

/**
 * Server-side progress aligned with order-type and orders dashboard queries
 * (master PO lines + receipt lines; master SO/TO lines + pick lines).
 */
export async function getOrderProgressSnapshot(
  prisma: PrismaClient,
  orderId: string,
  orderType: OrderType
): Promise<OrderProgressSnapshot> {
  if (orderType === 'PURCHASE') {
    const order = await prisma.purchaseOrder.findFirst({
      where: { id: orderId },
      select: {
        reference: true,
        warehouseId: true,
        lines: {
          select: {
            orderedQuantity: true,
            receiptLines: { select: { quantity: true } }
          }
        }
      }
    })

    if (!order) {
      return { reference: orderId, progressPercent: 0, warehouseId: '' }
    }

    return {
      reference: order.reference,
      progressPercent: computePurchaseOrderProgressPercentFromMasterLines(order.lines),
      warehouseId: order.warehouseId
    }
  }

  if (orderType === 'SALES') {
    const order = await prisma.salesOrder.findFirst({
      where: { id: orderId },
      select: {
        reference: true,
        warehouseId: true,
        lines: { select: { baseQuantity: true, pickLines: { select: { quantity: true } } } }
      }
    })

    if (!order) {
      return { reference: orderId, progressPercent: 0, warehouseId: '' }
    }

    return {
      reference: order.reference,
      progressPercent: computePickLineProgressPercent(order.lines),
      warehouseId: order.warehouseId
    }
  }

  if (orderType === 'TRANSFER') {
    const order = await prisma.transferOrder.findFirst({
      where: { id: orderId },
      select: {
        reference: true,
        warehouseId: true,
        lines: { select: { baseQuantity: true, pickLines: { select: { quantity: true } } } }
      }
    })

    if (!order) {
      return { reference: orderId, progressPercent: 0, warehouseId: '' }
    }

    return {
      reference: order.reference,
      progressPercent: computePickLineProgressPercent(order.lines),
      warehouseId: order.warehouseId
    }
  }

  if (orderType === 'RETURN') {
    const order = await prisma.returnOrder.findFirst({
      where: { id: orderId },
      select: {
        reference: true,
        warehouseId: true,
        lines: { select: { baseQuantity: true, pickLines: { select: { quantity: true } } } }
      }
    })

    if (!order) {
      return { reference: orderId, progressPercent: 0, warehouseId: '' }
    }

    return {
      reference: order.reference,
      progressPercent: computePickLineProgressPercent(order.lines),
      warehouseId: order.warehouseId
    }
  }

  if (orderType === 'ADJUSTMENT') {
    const order = await prisma.adjustmentOrder.findFirst({
      where: { id: orderId },
      select: {
        reference: true,
        warehouseId: true,
        lines: { select: { baseQuantity: true, pickLines: { select: { quantity: true } } } }
      }
    })

    if (!order) {
      return { reference: orderId, progressPercent: 0, warehouseId: '' }
    }

    return {
      reference: order.reference,
      progressPercent: computePickLineProgressPercent(order.lines),
      warehouseId: order.warehouseId
    }
  }

  return { reference: orderId, progressPercent: 0, warehouseId: '' }
}
