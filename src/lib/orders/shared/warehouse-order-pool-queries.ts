import { OrderStatus, OrderType, type PrismaClient } from '@/generated/prisma'

import { computePurchaseOrderProgressPercentFromMasterLines } from '@/lib/orders/shared/order-progress'
import { latestOrderAssignmentTouch } from '@/lib/orders/shared/order-assignment-touch'
import { computePickLineProgressPercent } from '@/lib/orders/shared/pick-line-progress'
import {
  listUserExecutingOperationalOrderRefs,
  type OperationalOrderRef
} from '@/lib/orders/shared/warehouse-user-executing-operational-orders'

const OPERATIONAL_ORDER_STATUSES = [
  OrderStatus.RELEASED,
  OrderStatus.EXECUTING,
  OrderStatus.PAUSED
] as const

export type WarehouseOrderPoolRecord = {
  id: string
  reference: string
  status: (typeof OPERATIONAL_ORDER_STATUSES)[number]
  type: 'PURCHASE' | 'SALES' | 'TRANSFER'
  infoLabel: string
  infoValue: string
  assignedTo: string
  assignedUserId: string | null
  lastActiveAt: string | null
  pausedAt: string | null
  progress: number
  createdAt: string
}

export async function getWarehouseOrderPoolRecords(
  prisma: PrismaClient,
  warehouseId: string
): Promise<WarehouseOrderPoolRecord[]> {
  const [purchaseOrders, transferOrders, salesOrders, assignments] = await Promise.all([
    prisma.purchaseOrder.findMany({
      where: { warehouseId, deletedAt: null, status: { in: [...OPERATIONAL_ORDER_STATUSES] } },
      select: {
        id: true,
        reference: true,
        status: true,
        createdAt: true,
        supplierNameSnapshot: true,
        businessParty: { select: { name: true } },
        lines: {
          select: {
            orderedQuantity: true,
            receiptLines: { select: { quantity: true } }
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    }),
    prisma.transferOrder.findMany({
      where: { warehouseId, deletedAt: null, status: { in: [...OPERATIONAL_ORDER_STATUSES] } },
      select: {
        id: true,
        reference: true,
        status: true,
        createdAt: true,
        destinationBin: {
          select: {
            code: true,
            warehouse: { select: { name: true } }
          }
        },
        lines: { select: { baseQuantity: true, pickLines: { select: { quantity: true } } } }
      },
      orderBy: { createdAt: 'desc' }
    }),
    prisma.salesOrder.findMany({
      where: { warehouseId, deletedAt: null, status: { in: [...OPERATIONAL_ORDER_STATUSES] } },
      select: {
        id: true,
        reference: true,
        status: true,
        createdAt: true,
        customerName: true,
        businessParty: { select: { name: true } },
        lines: { select: { baseQuantity: true, pickLines: { select: { quantity: true } } } }
      },
      orderBy: { createdAt: 'desc' }
    }),
    prisma.orderAssignment.findMany({
      where: {
        warehouseId,
        orderType: { in: ['PURCHASE', 'SALES', 'TRANSFER'] },
        isActive: true
      },
      select: {
        orderId: true,
        orderType: true,
        userId: true,
        assignedAt: true,
        startedAt: true,
        pausedAt: true,
        releasedAt: true,
        completedAt: true,
        cancelledAt: true,
        timedOutAt: true,
        user: { select: { fullName: true } }
      },
      orderBy: { assignedAt: 'desc' }
    })
  ])

  const assignmentByOrder = new Map<string, {
    assignedTo: string
    assignedUserId: string
    lastActiveAt: string
    pausedAt: string | null
  }>()

  for (const assignment of assignments) {
    const key = `${assignment.orderType}:${assignment.orderId}`

    if (!assignmentByOrder.has(key)) {
      assignmentByOrder.set(key, {
        assignedTo: assignment.user.fullName,
        assignedUserId: assignment.userId,
        lastActiveAt: latestOrderAssignmentTouch(assignment).toISOString(),
        pausedAt: assignment.pausedAt?.toISOString() ?? null
      })
    }
  }

  const mappedPurchaseOrders: WarehouseOrderPoolRecord[] = purchaseOrders.map((order) => {
    const assignment = assignmentByOrder.get(`PURCHASE:${order.id}`)

    return {
      id: order.id,
      reference: order.reference,
      type: 'PURCHASE',
      status: order.status as WarehouseOrderPoolRecord['status'],
      infoLabel: 'Supplier',
      infoValue: order.businessParty?.name ?? order.supplierNameSnapshot ?? 'Supplier unavailable',
      assignedTo: assignment?.assignedTo ?? 'Unassigned',
      assignedUserId: assignment?.assignedUserId ?? null,
      lastActiveAt: assignment?.lastActiveAt ?? null,
      pausedAt: assignment?.pausedAt ?? null,
      progress: computePurchaseOrderProgressPercentFromMasterLines(order.lines),
      createdAt: order.createdAt.toISOString()
    }
  })

  const mappedTransferOrders: WarehouseOrderPoolRecord[] = transferOrders.map((order) => {
    const assignment = assignmentByOrder.get(`TRANSFER:${order.id}`)

    return {
      id: order.id,
      reference: order.reference,
      type: 'TRANSFER',
      status: order.status as WarehouseOrderPoolRecord['status'],
      infoLabel: 'Destination',
      infoValue: order.destinationBin?.warehouse.name
        ? `${order.destinationBin.warehouse.name}${order.destinationBin.code ? ` · ${order.destinationBin.code}` : ''}`
        : 'Destination unavailable',
      assignedTo: assignment?.assignedTo ?? 'Unassigned',
      assignedUserId: assignment?.assignedUserId ?? null,
      lastActiveAt: assignment?.lastActiveAt ?? null,
      pausedAt: assignment?.pausedAt ?? null,
      progress: computePickLineProgressPercent(order.lines),
      createdAt: order.createdAt.toISOString()
    }
  })

  const mappedSalesOrders: WarehouseOrderPoolRecord[] = salesOrders.map((order) => {
    const assignment = assignmentByOrder.get(`SALES:${order.id}`)

    return {
      id: order.id,
      reference: order.reference,
      type: 'SALES',
      status: order.status as WarehouseOrderPoolRecord['status'],
      infoLabel: 'Customer',
      infoValue: order.businessParty?.name ?? order.customerName ?? 'Customer unavailable',
      assignedTo: assignment?.assignedTo ?? 'Unassigned',
      assignedUserId: assignment?.assignedUserId ?? null,
      lastActiveAt: assignment?.lastActiveAt ?? null,
      pausedAt: assignment?.pausedAt ?? null,
      progress: computePickLineProgressPercent(order.lines),
      createdAt: order.createdAt.toISOString()
    }
  })

  return [...mappedPurchaseOrders, ...mappedTransferOrders, ...mappedSalesOrders]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
}

function poolRecordMatchesOperationalRef(
  row: WarehouseOrderPoolRecord,
  ref: OperationalOrderRef
): boolean {
  if (row.id !== ref.orderId) {
    return false
  }

  if (ref.orderType === OrderType.PURCHASE) {
    return row.type === 'PURCHASE'
  }

  if (ref.orderType === OrderType.SALES) {
    return row.type === 'SALES'
  }

  return row.type === 'TRANSFER'
}

/**
 * Active executing order for this user, independent of which assignment row the pool chose to display.
 */
export async function resolveWarehouseActiveExecutingPoolRecord(
  prisma: PrismaClient,
  warehouseId: string,
  userId: string,
  poolRecords: WarehouseOrderPoolRecord[]
): Promise<WarehouseOrderPoolRecord | null> {
  const refs = await listUserExecutingOperationalOrderRefs(prisma, userId, warehouseId)

  for (const ref of refs) {
    const row = poolRecords.find((candidate) => poolRecordMatchesOperationalRef(candidate, ref))

    if (row) {
      return row
    }
  }

  return null
}
