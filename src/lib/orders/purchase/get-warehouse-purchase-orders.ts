import type { PrismaClient } from '@/generated/prisma'
import { OrderStatus } from '@/generated/prisma'

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

export type WarehousePurchaseOrderRow = {
  id: string
  reference: string
  status: OrderStatus
  supplier: string
  warehouseId: string
  createdAt: Date
  businessPartyId: string | null
}

async function getWarehousePurchaseOrders(
  prisma: PrismaClient,
  warehouseId: string
): Promise<WarehousePurchaseOrderRow[]> {
  const orders = await prisma.purchaseOrder.findMany({
    where: {
      deletedAt: null,
      warehouseId,
      status: {
        in: [OrderStatus.RELEASED, OrderStatus.EXECUTING, OrderStatus.PAUSED]
      }
    },
    select: listSelect,
    orderBy: { createdAt: 'desc' }
  })

  return orders.map(order => ({
    id: order.id,
    reference: order.reference,
    status: order.status,
    supplier: order.businessParty?.name ?? order.supplierNameSnapshot ?? '',
    warehouseId: order.warehouseId,
    createdAt: order.createdAt,
    businessPartyId: order.businessPartyId
  }))
}

export { getWarehousePurchaseOrders }
