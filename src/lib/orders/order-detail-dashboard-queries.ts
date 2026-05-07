import type { OrderType, PrismaClient } from '@/generated/prisma'

import { DomainError } from '@/lib/errors'
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

type DecimalLike = { toNumber(): number }

function toQty(value: DecimalLike): number {
  return Math.round(value.toNumber() * 100) / 100
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
      completedLines: true,
      totalLines: true,
      lines: {
        select: {
          id: true,
          itemId: true,
          itemNameSnapshot: true,
          orderedQuantity: true,
          uom: true,
          item: { select: { sku: true } },
          receiptLines: { select: { quantity: true, disposition: true } }
        }
      }
    }
  })

  if (!order) {
    throw new DomainError('Order not found.', 'NOT_FOUND', 404)
  }

  const lines: OrderExecutionLineRow[] = order.lines.map((line) => {
    const expectedQty = toQty(line.orderedQuantity)
    const processedQty = line.receiptLines.reduce((sum, row) => sum + toQty(row.quantity), 0)
    const remainingQty = Math.max(0, expectedQty - processedQty)
    const latestOutcome = line.receiptLines.at(-1)?.disposition

    return {
      lineId: line.id,
      itemId: line.itemId,
      sku: line.item.sku,
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
  const progressPercent = order.totalLines > 0
    ? Math.round((order.completedLines / order.totalLines) * 100)
    : 0

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

type CommonLine = {
  itemId: string
  itemNameSnapshot: string
  baseQuantity: DecimalLike
  handledQuantity: DecimalLike
  isShort: boolean
  uom: string
  item: { sku: string }
}

function mapCommonLines(lines: CommonLine[], keyer: (index: number) => string): {
  lines: OrderExecutionLineRow[]
  expectedTotal: number
  processedTotal: number
} {
  const mapped = lines.map((line, index) => {
    const expectedQty = toQty(line.baseQuantity)
    const processedQty = toQty(line.handledQuantity)
    const remainingQty = Math.max(0, expectedQty - processedQty)

    return {
      lineId: keyer(index),
      itemId: line.itemId,
      sku: line.item.sku,
      name: line.itemNameSnapshot,
      expectedQty,
      processedQty,
      remainingQty,
      uom: line.uom,
      status: lineStatus(expectedQty, processedQty, line.isShort),
      outcome: line.isShort ? 'REJECTED' : undefined,
      href: itemHref(line.itemId)
    } satisfies OrderExecutionLineRow
  })

  return {
    lines: mapped,
    expectedTotal: mapped.reduce((sum, line) => sum + line.expectedQty, 0),
    processedTotal: mapped.reduce((sum, line) => sum + line.processedQty, 0)
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
          handledQuantity: true,
          isShort: true,
          uom: true,
          item: { select: { sku: true } }
        }
      }
    }
  })

  if (!order) {
    throw new DomainError('Order not found.', 'NOT_FOUND', 404)
  }

  const lineStats = mapCommonLines(order.lines, (index) => order.lines[index].id)
  const completedCount = lineStats.lines.filter((line) => line.status === 'COMPLETED').length

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
    lines: lineStats.lines,
    expectedTotal: lineStats.expectedTotal,
    processedTotal: lineStats.processedTotal
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
          handledQuantity: true,
          isShort: true,
          uom: true,
          item: { select: { sku: true } }
        }
      }
    }
  })

  if (!order) {
    throw new DomainError('Order not found.', 'NOT_FOUND', 404)
  }

  const lineStats = mapCommonLines(order.lines, (index) => order.lines[index].id)
  const completedCount = lineStats.lines.filter((line) => line.status === 'COMPLETED').length

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
    lines: lineStats.lines,
    expectedTotal: lineStats.expectedTotal,
    processedTotal: lineStats.processedTotal
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
          handledQuantity: true,
          isShort: true,
          uom: true,
          item: { select: { sku: true } }
        }
      }
    }
  })

  if (!order) {
    throw new DomainError('Order not found.', 'NOT_FOUND', 404)
  }

  const lineStats = mapCommonLines(order.lines, (index) => order.lines[index].id)
  const completedCount = lineStats.lines.filter((line) => line.status === 'COMPLETED').length

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
    lines: lineStats.lines,
    expectedTotal: lineStats.expectedTotal,
    processedTotal: lineStats.processedTotal
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
          handledQuantity: true,
          isShort: true,
          uom: true,
          item: { select: { sku: true } }
        }
      }
    }
  })

  if (!order) {
    throw new DomainError('Order not found.', 'NOT_FOUND', 404)
  }

  const lineStats = mapCommonLines(order.lines, (index) => {
    const line = order.lines[index]

    return `${line.adjustmentOrderId}:${line.sequence}`
  })
  const completedCount = lineStats.lines.filter((line) => line.status === 'COMPLETED').length

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
    lines: lineStats.lines,
    expectedTotal: lineStats.expectedTotal,
    processedTotal: lineStats.processedTotal
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
