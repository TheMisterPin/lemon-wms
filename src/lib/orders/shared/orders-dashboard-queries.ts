import type { OrderStatus, PrismaClient } from '@/generated/prisma'

import { computePickLineProgressPercent } from '@/lib/orders/shared/pick-line-progress'
import { computePurchaseOrderProgressPercentFromMasterLines } from '@/lib/orders/shared/order-progress'
import type { OrderSummaryRow, WarehouseWorkloadRow, OrderAttentionCard } from '@/types/orders-dashboard.types'

const ACTIVE_STATUSES: OrderStatus[] = ['RELEASED', 'EXECUTING', 'PAUSED']
const COMPLETED_STATUSES: OrderStatus[] = ['EXECUTED', 'SIGNED_OFF']
const EXCEPTION_STATUSES: OrderStatus[] = ['EXECUTED_WITH_PROBLEMS']

const ORDER_LIMIT_PER_TYPE = 15

function orderHref(type: string, id: string): string {
  return `/dashboard/orders/${type.toLowerCase()}/${id}`
}

async function getPurchaseOrderSummaries(prisma: PrismaClient) {
  return prisma.purchaseOrder.findMany({
    where: { deletedAt: null, status: { in: [...ACTIVE_STATUSES, ...COMPLETED_STATUSES, ...EXCEPTION_STATUSES, 'DRAFT', 'CONFIRMED'] } },
    orderBy: { createdAt: 'desc' },
    take: ORDER_LIMIT_PER_TYPE,
    select: {
      id: true,
      reference: true,
      status: true,
      warehouseId: true,
      createdAt: true,
      executionStartedAt: true,
      warehouse: { select: { name: true } },
      lines: {
        select: {
          orderedQuantity: true,
          receiptLines: { select: { quantity: true } }
        }
      }
    }
  })
}

async function getSalesOrderSummaries(prisma: PrismaClient) {
  return prisma.salesOrder.findMany({
    where: { deletedAt: null },
    orderBy: { createdAt: 'desc' },
    take: ORDER_LIMIT_PER_TYPE,
    select: {
      id: true,
      reference: true,
      status: true,
      warehouseId: true,
      createdAt: true,
      warehouse: { select: { name: true } },
      lines: { select: { baseQuantity: true, pickLines: { select: { quantity: true } } } }
    }
  })
}

async function getTransferOrderSummaries(prisma: PrismaClient) {
  return prisma.transferOrder.findMany({
    where: { deletedAt: null },
    orderBy: { createdAt: 'desc' },
    take: ORDER_LIMIT_PER_TYPE,
    select: {
      id: true,
      reference: true,
      status: true,
      warehouseId: true,
      createdAt: true,
      warehouse: { select: { name: true } },
      lines: { select: { baseQuantity: true, pickLines: { select: { quantity: true } } } }
    }
  })
}

async function getReturnOrderSummaries(prisma: PrismaClient) {
  return prisma.returnOrder.findMany({
    where: { deletedAt: null },
    orderBy: { createdAt: 'desc' },
    take: ORDER_LIMIT_PER_TYPE,
    select: {
      id: true,
      reference: true,
      status: true,
      warehouseId: true,
      createdAt: true,
      warehouse: { select: { name: true } },
      lines: { select: { baseQuantity: true, pickLines: { select: { quantity: true } } } }
    }
  })
}

async function getAdjustmentOrderSummaries(prisma: PrismaClient) {
  return prisma.adjustmentOrder.findMany({
    where: { deletedAt: null },
    orderBy: { createdAt: 'desc' },
    take: ORDER_LIMIT_PER_TYPE,
    select: {
      id: true,
      reference: true,
      status: true,
      warehouseId: true,
      createdAt: true,
      warehouse: { select: { name: true } },
      lines: { select: { baseQuantity: true, pickLines: { select: { quantity: true } } } }
    }
  })
}

async function getOrderStatusCounts(prisma: PrismaClient): Promise<Record<OrderStatus, number>> {
  const [po, so, to, ro, ao] = await Promise.all([
    prisma.purchaseOrder.groupBy({ by: ['status'], _count: { _all: true }, where: { deletedAt: null } }),
    prisma.salesOrder.groupBy({ by: ['status'], _count: { _all: true }, where: { deletedAt: null } }),
    prisma.transferOrder.groupBy({ by: ['status'], _count: { _all: true }, where: { deletedAt: null } }),
    prisma.returnOrder.groupBy({ by: ['status'], _count: { _all: true }, where: { deletedAt: null } }),
    prisma.adjustmentOrder.groupBy({ by: ['status'], _count: { _all: true }, where: { deletedAt: null } })
  ])

  const totals: Partial<Record<OrderStatus, number>> = {}

  for (const group of [...po, ...so, ...to, ...ro, ...ao]) {
    const st = group.status as OrderStatus
    totals[st] = (totals[st] ?? 0) + group._count._all
  }

  return totals as Record<OrderStatus, number>
}

async function getActiveAssignmentsByOrder(
  prisma: PrismaClient,
  orderIds: string[]
): Promise<Map<string, { userName: string; startedAt: string | null }>> {
  if (orderIds.length === 0) {
    return new Map()
  }

  const assignments = await prisma.orderAssignment.findMany({
    where: {
      orderId: { in: orderIds },
      isActive: true,
      status: { in: ['ASSIGNED', 'STARTED', 'RESUMED', 'PAUSED'] }
    },
    orderBy: { assignedAt: 'desc' },
    select: {
      orderId: true,
      startedAt: true,
      user: { select: { fullName: true } }
    }
  })

  const map = new Map<string, { userName: string; startedAt: string | null }>()
  for (const a of assignments) {
    if (!map.has(a.orderId)) {
      map.set(a.orderId, {
        userName: a.user.fullName ?? '',
        startedAt: a.startedAt?.toISOString() ?? null
      })
    }
  }

  return map
}

function buildOrderSummaryRows(
  pos: Awaited<ReturnType<typeof getPurchaseOrderSummaries>>,
  sos: Awaited<ReturnType<typeof getSalesOrderSummaries>>,
  tos: Awaited<ReturnType<typeof getTransferOrderSummaries>>,
  ros: Awaited<ReturnType<typeof getReturnOrderSummaries>>,
  aos: Awaited<ReturnType<typeof getAdjustmentOrderSummaries>>,
  assignmentMap: Map<string, { userName: string; startedAt: string | null }>
): OrderSummaryRow[] {
  const rows: OrderSummaryRow[] = []

  for (const o of pos) {
    const pct = computePurchaseOrderProgressPercentFromMasterLines(o.lines)
    const assignment = assignmentMap.get(o.id)

    rows.push({
      orderId: o.id,
      orderLabel: o.reference,
      type: 'PURCHASE',
      warehouseId: o.warehouseId,
      warehouseName: o.warehouse.name,
      status: o.status,
      progressPercent: pct,
      assignedUserName: assignment?.userName,
      startedAt: o.executionStartedAt?.toISOString() ?? assignment?.startedAt ?? undefined,
      href: orderHref('purchase', o.id)
    })
  }

  for (const o of sos) {
    const assignment = assignmentMap.get(o.id)

    rows.push({
      orderId: o.id,
      orderLabel: o.reference,
      type: 'SALES',
      warehouseId: o.warehouseId,
      warehouseName: o.warehouse.name,
      status: o.status,
      progressPercent: computePickLineProgressPercent(o.lines),
      assignedUserName: assignment?.userName,
      startedAt: assignment?.startedAt ?? undefined,
      href: orderHref('sales', o.id)
    })
  }

  for (const o of tos) {
    const assignment = assignmentMap.get(o.id)

    rows.push({
      orderId: o.id,
      orderLabel: o.reference,
      type: 'TRANSFER',
      warehouseId: o.warehouseId,
      warehouseName: o.warehouse.name,
      status: o.status,
      progressPercent: computePickLineProgressPercent(o.lines),
      assignedUserName: assignment?.userName,
      startedAt: assignment?.startedAt ?? undefined,
      href: orderHref('transfer', o.id)
    })
  }

  for (const o of ros) {
    const assignment = assignmentMap.get(o.id)

    rows.push({
      orderId: o.id,
      orderLabel: o.reference,
      type: 'RETURN',
      warehouseId: o.warehouseId,
      warehouseName: o.warehouse.name,
      status: o.status,
      progressPercent: computePickLineProgressPercent(o.lines),
      assignedUserName: assignment?.userName,
      startedAt: assignment?.startedAt ?? undefined,
      href: orderHref('return', o.id)
    })
  }

  for (const o of aos) {
    const assignment = assignmentMap.get(o.id)

    rows.push({
      orderId: o.id,
      orderLabel: o.reference,
      type: 'ADJUSTMENT',
      warehouseId: o.warehouseId,
      warehouseName: o.warehouse.name,
      status: o.status,
      progressPercent: computePickLineProgressPercent(o.lines),
      assignedUserName: assignment?.userName,
      startedAt: assignment?.startedAt ?? undefined,
      href: orderHref('adjustment', o.id)
    })
  }

  rows.sort((a, b) => {
    if (a.startedAt && b.startedAt) {
      return new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime()
    }
    if (a.startedAt) {
      return -1
    }
    if (b.startedAt) {
      return 1
    }

    return 0
  })

  return rows
}

function buildWarehouseWorkload(rows: OrderSummaryRow[]): WarehouseWorkloadRow[] {
  const byWarehouse = new Map<string, WarehouseWorkloadRow>()

  for (const r of rows) {
    if (!byWarehouse.has(r.warehouseId)) {
      byWarehouse.set(r.warehouseId, {
        warehouseId: r.warehouseId,
        warehouseName: r.warehouseName,
        active: 0,
        released: 0,
        completedToday: 0,
        exceptions: 0,
        href: `/dashboard/locations/warehouses/${r.warehouseId}`
      })
    }

    const wh = byWarehouse.get(r.warehouseId)!
    if (r.status === 'EXECUTING') {
      wh.active++
    } else if (r.status === 'RELEASED') {
      wh.released++
    } else if (r.status === 'EXECUTED' || r.status === 'SIGNED_OFF') {
      wh.completedToday++
    } else if (r.status === 'EXECUTED_WITH_PROBLEMS') {
      wh.exceptions++
    }
  }

  return [...byWarehouse.values()].sort((a, b) => b.active - a.active)
}

function buildAttentionCards(rows: OrderSummaryRow[]): OrderAttentionCard[] {
  const cards: OrderAttentionCard[] = []

  const exceptions = rows
    .filter((r) => r.status === 'EXECUTED_WITH_PROBLEMS')
    .slice(0, 3)

  for (const r of exceptions) {
    cards.push({
      orderId: r.orderId,
      orderLabel: r.orderLabel,
      type: r.type,
      reason: 'Executed with problems — needs sign-off review',
      tone: 'danger',
      href: r.href
    })
  }

  const paused = rows
    .filter((r) => r.status === 'PAUSED')
    .slice(0, 3)

  for (const r of paused) {
    cards.push({
      orderId: r.orderId,
      orderLabel: r.orderLabel,
      type: r.type,
      reason: 'Paused — may need reassignment',
      tone: 'warning',
      href: r.href
    })
  }

  const releasedUnassigned = rows
    .filter((r) => r.status === 'RELEASED' && !r.assignedUserName)
    .slice(0, 3)

  for (const r of releasedUnassigned) {
    cards.push({
      orderId: r.orderId,
      orderLabel: r.orderLabel,
      type: r.type,
      reason: 'Released and unassigned',
      tone: 'neutral',
      href: r.href
    })
  }

  return cards.slice(0, 9)
}

export {
  ACTIVE_STATUSES,
  COMPLETED_STATUSES,
  buildAttentionCards,
  buildOrderSummaryRows,
  buildWarehouseWorkload,
  getActiveAssignmentsByOrder,
  getAdjustmentOrderSummaries,
  getOrderStatusCounts,
  getPurchaseOrderSummaries,
  getReturnOrderSummaries,
  getSalesOrderSummaries,
  getTransferOrderSummaries
}
