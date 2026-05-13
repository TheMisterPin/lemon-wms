import { OrderStatus, OrderType, type PrismaClient } from '@/generated/prisma'

import { DomainError } from '@/lib/errors'
import { computePickLineProgressPercent } from '@/lib/orders/shared/pick-line-progress'
import { computePurchaseOrderProgressPercentFromMasterLines } from '@/lib/orders/shared/order-progress'
import { getDashboardPurchaseOrders, type DashboardPurchaseOrderRow } from '@/lib/orders/purchase'
import type {
  OrderTypeDashboardDTO,
  OrderTypeOverviewActivityItem,
  OrderTypeOverviewOrderCard,
  OrderTypeOverviewStatusSlice,
  OrderTypeOverviewWarehouseBarRow
} from '@/types/order-type-dashboard.types'

export type OrderTypeDashboardPayload = OrderTypeDashboardDTO & {
  purchaseOrdersForTable?: DashboardPurchaseOrderRow[]
}

type RouteKey = 'purchase' | 'sales' | 'transfer'

function normalizeRouteKey(param: string): RouteKey | null {
  const p = param.trim().toLowerCase()

  if (p === 'purchase' || p === 'sales' || p === 'transfer') {
    return p
  }

  return null
}

function prismaOrderType(key: RouteKey): OrderType {
  if (key === 'purchase') {
    return OrderType.PURCHASE
  }
  if (key === 'sales') {
    return OrderType.SALES
  }

  return OrderType.TRANSFER
}

function orderDetailHref(routeKey: RouteKey, orderId: string): string {
  return `/dashboard/orders/${routeKey}/${orderId}`
}

function warehouseOverviewHref(warehouseId: string): string {
  return `/dashboard/locations/warehouses/${warehouseId}`
}

type NormalizedOrder = {
  id: string
  reference: string
  status: OrderStatus
  warehouseId: string
  warehouseName: string
  createdAt: Date
  progressPercent: number
}

function totalBarCount(row: OrderTypeOverviewWarehouseBarRow): number {
  return Object.values(row.byStatus).reduce((sum, n) => sum + n, 0)
}

const MAX_ORDER_TYPE_ASSIGNMENT_ACTIVITY_ROWS = 300

function latestOrderAssignmentTouch(row: {
  assignedAt: Date
  startedAt: Date | null
  pausedAt: Date | null
  releasedAt: Date | null
  completedAt: Date | null
  cancelledAt: Date | null
  timedOutAt: Date | null
}): Date {
  let latestMs = row.assignedAt.getTime()
  const rest = [
    row.startedAt,
    row.pausedAt,
    row.releasedAt,
    row.completedAt,
    row.cancelledAt,
    row.timedOutAt
  ]

  for (const d of rest) {
    if (d !== null && d.getTime() > latestMs) {
      latestMs = d.getTime()
    }
  }

  return new Date(latestMs)
}

async function getOrderTypeDashboardData(
  prisma: PrismaClient,
  orderTypeParam: string
): Promise<OrderTypeDashboardPayload> {
  const routeKey = normalizeRouteKey(orderTypeParam)
  if (!routeKey) {
    throw new DomainError('Unsupported order type.', 'VALIDATION_ERROR', 400)
  }

  const prismaOt = prismaOrderType(routeKey)

  let normalized: NormalizedOrder[] = []

  if (routeKey === 'purchase') {
    const rows = await prisma.purchaseOrder.findMany({
      where: { deletedAt: null },
      select: {
        id: true,
        reference: true,
        status: true,
        warehouseId: true,
        createdAt: true,
        warehouse: { select: { name: true } },
        lines: {
          select: {
            orderedQuantity: true,
            receiptLines: { select: { quantity: true } }
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    normalized = rows.map((r) => ({
      id: r.id,
      reference: r.reference,
      status: r.status,
      warehouseId: r.warehouseId,
      warehouseName: r.warehouse.name,
      createdAt: r.createdAt,
      progressPercent: computePurchaseOrderProgressPercentFromMasterLines(r.lines)
    }))
  } else if (routeKey === 'sales') {
    const rows = await prisma.salesOrder.findMany({
      where: { deletedAt: null },
      select: {
        id: true,
        reference: true,
        status: true,
        warehouseId: true,
        createdAt: true,
        warehouse: { select: { name: true } },
        lines: { select: { baseQuantity: true, pickLines: { select: { quantity: true } } } }
      },
      orderBy: { createdAt: 'desc' }
    })

    normalized = rows.map((r) => ({
      id: r.id,
      reference: r.reference,
      status: r.status,
      warehouseId: r.warehouseId,
      warehouseName: r.warehouse.name,
      createdAt: r.createdAt,
      progressPercent: computePickLineProgressPercent(r.lines)
    }))
  } else {
    const rows = await prisma.transferOrder.findMany({
      where: { deletedAt: null },
      select: {
        id: true,
        reference: true,
        status: true,
        warehouseId: true,
        createdAt: true,
        warehouse: { select: { name: true } },
        lines: { select: { baseQuantity: true, pickLines: { select: { quantity: true } } } }
      },
      orderBy: { createdAt: 'desc' }
    })

    normalized = rows.map((r) => ({
      id: r.id,
      reference: r.reference,
      status: r.status,
      warehouseId: r.warehouseId,
      warehouseName: r.warehouse.name,
      createdAt: r.createdAt,
      progressPercent: computePickLineProgressPercent(r.lines)
    }))
  }

  const totalOrders = normalized.length
  const warehouseIdSet = new Set(normalized.map((o) => o.warehouseId))
  const warehousesWithOrders = warehouseIdSet.size
  const aggregateProgressPercent =
    totalOrders > 0
      ? Math.round(
        normalized.reduce((sum, o) => sum + o.progressPercent, 0) / totalOrders
      )
      : 0

  const statusCount = new Map<string, number>()
  for (const st of Object.values(OrderStatus)) {
    statusCount.set(st, 0)
  }
  for (const o of normalized) {
    statusCount.set(o.status, (statusCount.get(o.status) ?? 0) + 1)
  }

  const statusDonut: OrderTypeOverviewStatusSlice[] = [...statusCount.entries()]
    .filter(([, c]) => c > 0)
    .map(([status, count]) => ({ status, count }))
    .sort((a, b) => b.count - a.count)

  const warehouseMap = new Map<
    string,
    { warehouseName: string; counts: Map<OrderStatus, number> }
  >()

  for (const o of normalized) {
    if (!warehouseMap.has(o.warehouseId)) {
      warehouseMap.set(o.warehouseId, {
        warehouseName: o.warehouseName,
        counts: new Map()
      })
    }

    const w = warehouseMap.get(o.warehouseId)!
    w.counts.set(o.status, (w.counts.get(o.status) ?? 0) + 1)
  }

  const warehousePrelim: OrderTypeOverviewWarehouseBarRow[] = [...warehouseMap.entries()].map(
    ([warehouseId, { warehouseName, counts }]) => {
      const byStatus: Record<string, number> = {}
      for (const st of Object.values(OrderStatus)) {
        byStatus[st] = counts.get(st) ?? 0
      }

      return {
        warehouseId,
        warehouseName,
        href: warehouseOverviewHref(warehouseId),
        byStatus
      }
    }
  )

  const warehouseBars = warehousePrelim.sort((a, b) => totalBarCount(b) - totalBarCount(a))

  const refByOrderId = new Map(normalized.map((o) => [o.id, o.reference]))
  const orderIdsForAssignments = [...new Set(normalized.map((o) => o.id))]

  const orders: OrderTypeOverviewOrderCard[] = normalized.map((o) => ({
    orderId: o.id,
    orderLabel: o.reference,
    status: o.status,
    warehouseId: o.warehouseId,
    warehouseName: o.warehouseName,
    progressPercent: o.progressPercent,
    href: orderDetailHref(routeKey, o.id),
    createdAt: o.createdAt.toISOString()
  }))

  const assignmentRows =
    orderIdsForAssignments.length === 0
      ? []
      : await prisma.orderAssignment.findMany({
        where: {
          orderType: prismaOt,
          orderId: { in: orderIdsForAssignments }
        },
        select: {
          id: true,
          orderId: true,
          status: true,
          assignedAt: true,
          startedAt: true,
          pausedAt: true,
          releasedAt: true,
          completedAt: true,
          cancelledAt: true,
          timedOutAt: true,
          user: { select: { fullName: true } }
        }
      })

  const activities: OrderTypeOverviewActivityItem[] = assignmentRows
    .map((a) => ({
      row: a,
      at: latestOrderAssignmentTouch(a)
    }))
    .sort((x, y) => y.at.getTime() - x.at.getTime())
    .slice(0, MAX_ORDER_TYPE_ASSIGNMENT_ACTIVITY_ROWS)
    .map(({ row: a, at }) => ({
      id: a.id,
      createdAt: at.toISOString(),
      activityType: a.status,
      userName: a.user.fullName ?? '—',
      orderId: a.orderId,
      orderLabel: refByOrderId.get(a.orderId) ?? a.orderId.slice(0, 8),
      href: orderDetailHref(routeKey, a.orderId)
    }))

  const title =
    routeKey === 'purchase'
      ? 'Purchase orders'
      : routeKey === 'sales'
        ? 'Sales orders'
        : 'Transfer orders'

  const base: OrderTypeDashboardDTO = {
    title,
    orderTypeRouteKey: routeKey,
    kpis: {
      totalOrders,
      warehousesWithOrders,
      aggregateProgressPercent
    },
    statusDonut,
    warehouseBars,
    orders,
    activities
  }

  if (routeKey === 'purchase') {
    const purchaseOrdersForTable = await getDashboardPurchaseOrders(prisma)

    return { ...base, purchaseOrdersForTable }
  }

  return base
}

export { getOrderTypeDashboardData }
