import type { PrismaClient } from '@/generated/prisma'
import { OrderStatus, OrderType } from '@/generated/prisma'

import { loadActiveOrderAssignmentIndex } from '@/lib/orders/shared/order-assignment-touch'
import type { WarehouseOperationalOrderListRow } from '@/lib/orders/shared/warehouse-operational-order-list-row'

const listSelect = {
  id: true,
  reference: true,
  status: true,
  supplierNameSnapshot: true,
  warehouseId: true,
  createdAt: true,
  businessPartyId: true,
  businessParty: {
    select: {
      id: true,
      name: true
    }
  }
} as const

export type WarehousePurchaseOrderRow = WarehouseOperationalOrderListRow

async function getWarehousePurchaseOrders(
  prisma: PrismaClient,
  warehouseId: string
): Promise<WarehouseOperationalOrderListRow[]> {
  const [orders, assignmentIndex] = await Promise.all([
    prisma.purchaseOrder.findMany({
      where: {
        deletedAt: null,
        warehouseId,
        status: {
          in: [OrderStatus.RELEASED, OrderStatus.EXECUTING, OrderStatus.PAUSED]
        }
      },
      select: listSelect,
      orderBy: { createdAt: 'desc' }
    }),
    loadActiveOrderAssignmentIndex(prisma, warehouseId, [OrderType.PURCHASE])
  ])

  return orders.map(order => {
    const touch = assignmentIndex.get(`PURCHASE:${order.id}`)

    return {
      id: order.id,
      reference: order.reference,
      status: order.status,
      supplier: order.businessParty?.name ?? order.supplierNameSnapshot ?? '',
      warehouseId: order.warehouseId,
      createdAt: order.createdAt,
      businessPartyId: order.businessPartyId,
      assignedUserId: touch?.assignedUserId ?? null,
      activeOrderAssignmentId: touch?.orderAssignmentId ?? null,
      lastActiveAt: touch?.lastActiveAt ?? null,
      pausedAt: touch?.pausedAt ?? null
    }
  })
}

export { getWarehousePurchaseOrders }
