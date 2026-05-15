import type { PrismaClient } from '@/generated/prisma'
import { OrderStatus, OrderType } from '@/generated/prisma'

import { loadActiveOrderAssignmentIndex } from '@/lib/orders/shared/order-assignment-touch'
import type { WarehouseOperationalOrderListRow } from '@/lib/orders/shared/warehouse-operational-order-list-row'

const listSelect = {
  id: true,
  reference: true,
  status: true,
  warehouseId: true,
  createdAt: true,
  businessPartyId: true,
  customerName: true,
  businessParty: {
    select: {
      id: true,
      name: true
    }
  }
} as const

async function getWarehouseSalesOrders(
  prisma: PrismaClient,
  warehouseId: string
): Promise<WarehouseOperationalOrderListRow[]> {
  const [orders, assignmentIndex] = await Promise.all([
    prisma.salesOrder.findMany({
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
    loadActiveOrderAssignmentIndex(prisma, warehouseId, [OrderType.SALES])
  ])

  return orders.map((order) => {
    const touch = assignmentIndex.get(`SALES:${order.id}`)

    return {
      id: order.id,
      reference: order.reference,
      status: order.status,
      supplier: order.businessParty?.name ?? order.customerName ?? '',
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

export { getWarehouseSalesOrders }
