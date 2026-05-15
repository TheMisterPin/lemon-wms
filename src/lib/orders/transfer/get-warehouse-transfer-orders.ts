import type { PrismaClient } from '@/generated/prisma'
import { OrderStatus, OrderType } from '@/generated/prisma'

import { loadActiveOrderAssignmentIndex } from '@/lib/orders/shared/order-assignment-touch'
import type { WarehouseOperationalOrderListRow } from '@/lib/orders/shared/warehouse-operational-order-list-row'

function transferPartyLine(
  originCode: string | null | undefined,
  destinationCode: string | null | undefined,
  notes: string | null | undefined
): string {
  const trimmedNotes = notes?.trim()
  if (trimmedNotes) {
    return trimmedNotes
  }
  if (originCode && destinationCode) {
    return `${originCode} → ${destinationCode}`
  }
  if (originCode) {
    return `From ${originCode}`
  }
  if (destinationCode) {
    return `To ${destinationCode}`
  }

  return ''
}

const listSelect = {
  id: true,
  reference: true,
  status: true,
  warehouseId: true,
  createdAt: true,
  notes: true,
  originBin: { select: { code: true } },
  destinationBin: { select: { code: true } }
} as const

async function getWarehouseTransferOrders(
  prisma: PrismaClient,
  warehouseId: string
): Promise<WarehouseOperationalOrderListRow[]> {
  const [orders, assignmentIndex] = await Promise.all([
    prisma.transferOrder.findMany({
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
    loadActiveOrderAssignmentIndex(prisma, warehouseId, [OrderType.TRANSFER])
  ])

  return orders.map((order) => {
    const touch = assignmentIndex.get(`TRANSFER:${order.id}`)

    return {
      id: order.id,
      reference: order.reference,
      status: order.status,
      supplier: transferPartyLine(order.originBin?.code, order.destinationBin?.code, order.notes),
      warehouseId: order.warehouseId,
      createdAt: order.createdAt,
      businessPartyId: null,
      assignedUserId: touch?.assignedUserId ?? null,
      activeOrderAssignmentId: touch?.orderAssignmentId ?? null,
      lastActiveAt: touch?.lastActiveAt ?? null,
      pausedAt: touch?.pausedAt ?? null
    }
  })
}

export { getWarehouseTransferOrders }
