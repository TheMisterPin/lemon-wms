import type { OrderType, PrismaClient } from '@/generated/prisma'

import { DomainError } from '@/lib/errors'
import { sumPickLineQuantities, toQty } from '@/lib/orders/shared/pick-line-progress'
import { computePurchaseOrderProgressPercentFromMasterLines } from '@/lib/orders/shared/order-progress'
import type { OrderExecutionLineRow } from '@/types/order-detail-dashboard.types'

export type OrderDetailHeaderSource = {
  orderId: string
  orderLabel: string
  orderType: OrderType
  warehouseId: string
  warehouseName: string
  status: string
  progressPercent: number
}

function lineStatus(expectedQty: number, processedQty: number, isShort: boolean): OrderExecutionLineRow['status'] {
  if (isShort) {
    return 'EXCEPTION'
  }
  if (processedQty <= 0) {
    return 'OPEN'
  }
  if (processedQty >= expectedQty) {
    return 'COMPLETED'
  }

  return 'PARTIAL'
}

function itemHref(itemId: string): string {
  return `/dashboard/stock/items/${itemId}`
}

async function loadSkuByItemId(prisma: PrismaClient, itemIds: string[]): Promise<Map<string, string>> {
  const unique = [...new Set(itemIds)]
  if (unique.length === 0) {
    return new Map()
  }

  const rows = await prisma.item.findMany({
    where: { id: { in: unique }, deletedAt: null },
    select: { id: true, sku: true }
  })

  return new Map(rows.map((row) => [row.id, row.sku]))
}

async function getPurchaseOrderDetail(prisma: PrismaClient, orderId: string): Promise<{
  header: OrderDetailHeaderSource
  lines: OrderExecutionLineRow[]
  expectedTotal: number
  processedTotal: number
}> {
  const order = await prisma.purchaseOrder.findFirst({
    where: { id: orderId, deletedAt: null },
    select: {
      id: true,
      reference: true,
      warehouseId: true,
      status: true,
      warehouse: { select: { name: true } },
      lines: {
        select: {
          id: true,
          itemId: true,
          itemNameSnapshot: true,
          orderedQuantity: true,
          uom: true,
          receiptLines: { select: { quantity: true, disposition: true } }
        }
      }
    }
  })

  if (!order) {
    throw new DomainError('Order not found.', 'NOT_FOUND', 404)
  }

  const skuMap = await loadSkuByItemId(prisma, order.lines.map((line) => line.itemId))

  const lines: OrderExecutionLineRow[] = order.lines.map((line) => {
    const expectedQty = toQty(line.orderedQuantity)
    const processedQty = line.receiptLines.reduce((sum, row) => sum + toQty(row.quantity), 0)
    const remainingQty = Math.max(0, expectedQty - processedQty)
    const latestOutcome = line.receiptLines.at(-1)?.disposition

    return {
      lineId: line.id,
      itemId: line.itemId,
      sku: skuMap.get(line.itemId) ?? '—',
      name: line.itemNameSnapshot,
      expectedQty,
      processedQty,
      remainingQty,
      uom: line.uom,
      status: lineStatus(expectedQty, processedQty, latestOutcome !== undefined && latestOutcome !== 'ACCEPTED'),
      outcome: latestOutcome,
      href: itemHref(line.itemId)
    }
  })

  const expectedTotal = lines.reduce((sum, line) => sum + line.expectedQty, 0)
  const processedTotal = lines.reduce((sum, line) => sum + line.processedQty, 0)
  const progressPercent = computePurchaseOrderProgressPercentFromMasterLines(
    order.lines.map((line) => ({
      orderedQuantity: line.orderedQuantity,
      receiptLines: line.receiptLines
    }))
  )

  return {
    header: {
      orderId: order.id,
      orderLabel: order.reference,
      orderType: 'PURCHASE',
      warehouseId: order.warehouseId,
      warehouseName: order.warehouse.name,
      status: order.status,
      progressPercent
    },
    lines,
    expectedTotal,
    processedTotal
  }
}

async function getSalesOrderDetail(prisma: PrismaClient, orderId: string) {
  const order = await prisma.salesOrder.findFirst({
    where: { id: orderId, deletedAt: null },
    select: {
      id: true,
      reference: true,
      status: true,
      warehouseId: true,
      warehouse: { select: { name: true } },
      lines: {
        select: {
          id: true,
          itemId: true,
          itemNameSnapshot: true,
          baseQuantity: true,
          uom: true,
          pickLines: { select: { quantity: true, disposition: true } }
        }
      }
    }
  })

  if (!order) {
    throw new DomainError('Order not found.', 'NOT_FOUND', 404)
  }

  const skuMap = await loadSkuByItemId(prisma, order.lines.map((line) => line.itemId))

  const lines: OrderExecutionLineRow[] = order.lines.map((line) => {
    const expectedQty = toQty(line.baseQuantity)
    const processedQty = sumPickLineQuantities(line.pickLines)
    const remainingQty = Math.max(0, expectedQty - processedQty)
    const latestOutcome = line.pickLines.at(-1)?.disposition

    return {
      lineId: line.id,
      itemId: line.itemId,
      sku: skuMap.get(line.itemId) ?? '—',
      name: line.itemNameSnapshot,
      expectedQty,
      processedQty,
      remainingQty,
      uom: line.uom,
      status: lineStatus(
        expectedQty,
        processedQty,
        latestOutcome !== undefined && latestOutcome !== 'ACCEPTED'
      ),
      outcome: latestOutcome,
      href: itemHref(line.itemId)
    }
  })

  const completedCount = lines.filter((line) => line.status === 'COMPLETED').length

  return {
    header: {
      orderId: order.id,
      orderLabel: order.reference,
      orderType: 'SALES' as const,
      warehouseId: order.warehouseId,
      warehouseName: order.warehouse.name,
      status: order.status,
      progressPercent: order.lines.length > 0 ? Math.round((completedCount / order.lines.length) * 100) : 0
    },
    lines,
    expectedTotal: lines.reduce((sum, line) => sum + line.expectedQty, 0),
    processedTotal: lines.reduce((sum, line) => sum + line.processedQty, 0)
  }
}

async function getTransferOrderDetail(prisma: PrismaClient, orderId: string) {
  const order = await prisma.transferOrder.findFirst({
    where: { id: orderId, deletedAt: null },
    select: {
      id: true,
      reference: true,
      status: true,
      warehouseId: true,
      warehouse: { select: { name: true } },
      lines: {
        select: {
          id: true,
          itemId: true,
          itemNameSnapshot: true,
          baseQuantity: true,
          uom: true,
          pickLines: { select: { quantity: true, disposition: true } }
        }
      }
    }
  })

  if (!order) {
    throw new DomainError('Order not found.', 'NOT_FOUND', 404)
  }

  const skuMap = await loadSkuByItemId(prisma, order.lines.map((line) => line.itemId))

  const lines: OrderExecutionLineRow[] = order.lines.map((line) => {
    const expectedQty = toQty(line.baseQuantity)
    const processedQty = sumPickLineQuantities(line.pickLines)
    const remainingQty = Math.max(0, expectedQty - processedQty)
    const latestOutcome = line.pickLines.at(-1)?.disposition

    return {
      lineId: line.id,
      itemId: line.itemId,
      sku: skuMap.get(line.itemId) ?? '—',
      name: line.itemNameSnapshot,
      expectedQty,
      processedQty,
      remainingQty,
      uom: line.uom,
      status: lineStatus(
        expectedQty,
        processedQty,
        latestOutcome !== undefined && latestOutcome !== 'ACCEPTED'
      ),
      outcome: latestOutcome,
      href: itemHref(line.itemId)
    }
  })

  const completedCount = lines.filter((line) => line.status === 'COMPLETED').length

  return {
    header: {
      orderId: order.id,
      orderLabel: order.reference,
      orderType: 'TRANSFER' as const,
      warehouseId: order.warehouseId,
      warehouseName: order.warehouse.name,
      status: order.status,
      progressPercent: order.lines.length > 0 ? Math.round((completedCount / order.lines.length) * 100) : 0
    },
    lines,
    expectedTotal: lines.reduce((sum, line) => sum + line.expectedQty, 0),
    processedTotal: lines.reduce((sum, line) => sum + line.processedQty, 0)
  }
}

async function getReturnOrderDetail(prisma: PrismaClient, orderId: string) {
  const order = await prisma.returnOrder.findFirst({
    where: { id: orderId, deletedAt: null },
    select: {
      id: true,
      reference: true,
      status: true,
      warehouseId: true,
      warehouse: { select: { name: true } },
      lines: {
        select: {
          id: true,
          itemId: true,
          itemNameSnapshot: true,
          baseQuantity: true,
          uom: true,
          pickLines: { select: { quantity: true, disposition: true } }
        }
      }
    }
  })

  if (!order) {
    throw new DomainError('Order not found.', 'NOT_FOUND', 404)
  }

  const skuMap = await loadSkuByItemId(prisma, order.lines.map((line) => line.itemId))

  const lines: OrderExecutionLineRow[] = order.lines.map((line) => {
    const expectedQty = toQty(line.baseQuantity)
    const processedQty = sumPickLineQuantities(line.pickLines)
    const remainingQty = Math.max(0, expectedQty - processedQty)
    const latestOutcome = line.pickLines.at(-1)?.disposition

    return {
      lineId: line.id,
      itemId: line.itemId,
      sku: skuMap.get(line.itemId) ?? '—',
      name: line.itemNameSnapshot,
      expectedQty,
      processedQty,
      remainingQty,
      uom: line.uom,
      status: lineStatus(
        expectedQty,
        processedQty,
        latestOutcome !== undefined && latestOutcome !== 'ACCEPTED'
      ),
      outcome: latestOutcome,
      href: itemHref(line.itemId)
    }
  })

  const completedCount = lines.filter((line) => line.status === 'COMPLETED').length

  return {
    header: {
      orderId: order.id,
      orderLabel: order.reference,
      orderType: 'RETURN' as const,
      warehouseId: order.warehouseId,
      warehouseName: order.warehouse.name,
      status: order.status,
      progressPercent: order.lines.length > 0 ? Math.round((completedCount / order.lines.length) * 100) : 0
    },
    lines,
    expectedTotal: lines.reduce((sum, line) => sum + line.expectedQty, 0),
    processedTotal: lines.reduce((sum, line) => sum + line.processedQty, 0)
  }
}

async function getAdjustmentOrderDetail(prisma: PrismaClient, orderId: string) {
  const order = await prisma.adjustmentOrder.findFirst({
    where: { id: orderId, deletedAt: null },
    select: {
      id: true,
      reference: true,
      status: true,
      warehouseId: true,
      warehouse: { select: { name: true } },
      lines: {
        select: {
          adjustmentOrderId: true,
          sequence: true,
          itemId: true,
          itemNameSnapshot: true,
          baseQuantity: true,
          uom: true,
          pickLines: { select: { quantity: true, disposition: true } }
        }
      }
    }
  })

  if (!order) {
    throw new DomainError('Order not found.', 'NOT_FOUND', 404)
  }

  const skuMap = await loadSkuByItemId(prisma, order.lines.map((line) => line.itemId))

  const lines: OrderExecutionLineRow[] = order.lines.map((line) => {
    const expectedQty = toQty(line.baseQuantity)
    const processedQty = sumPickLineQuantities(line.pickLines)
    const remainingQty = Math.max(0, expectedQty - processedQty)
    const latestOutcome = line.pickLines.at(-1)?.disposition
    const compositeId = `${line.adjustmentOrderId}:${line.sequence}`

    return {
      lineId: compositeId,
      itemId: line.itemId,
      sku: skuMap.get(line.itemId) ?? '—',
      name: line.itemNameSnapshot,
      expectedQty,
      processedQty,
      remainingQty,
      uom: line.uom,
      status: lineStatus(
        expectedQty,
        processedQty,
        latestOutcome !== undefined && latestOutcome !== 'ACCEPTED'
      ),
      outcome: latestOutcome,
      href: itemHref(line.itemId)
    }
  })

  const completedCount = lines.filter((line) => line.status === 'COMPLETED').length

  return {
    header: {
      orderId: order.id,
      orderLabel: order.reference,
      orderType: 'ADJUSTMENT' as const,
      warehouseId: order.warehouseId,
      warehouseName: order.warehouse.name,
      status: order.status,
      progressPercent: order.lines.length > 0 ? Math.round((completedCount / order.lines.length) * 100) : 0
    },
    lines,
    expectedTotal: lines.reduce((sum, line) => sum + line.expectedQty, 0),
    processedTotal: lines.reduce((sum, line) => sum + line.processedQty, 0)
  }
}

export async function getOrderDetailByType(
  prisma: PrismaClient,
  orderType: OrderType,
  orderId: string
) {
  if (orderType === 'PURCHASE') {
    return getPurchaseOrderDetail(prisma, orderId)
  }
  if (orderType === 'SALES') {
    return getSalesOrderDetail(prisma, orderId)
  }
  if (orderType === 'TRANSFER') {
    return getTransferOrderDetail(prisma, orderId)
  }
  if (orderType === 'RETURN') {
    return getReturnOrderDetail(prisma, orderId)
  }

  return getAdjustmentOrderDetail(prisma, orderId)
}
