import type { PrismaClient } from '@/generated/prisma'
import { OrderStatus } from '@/generated/prisma'

const listSelect = {
  id: true,
  reference: true,
  status: true,
  supplier: true,
  warehouseId: true,
  createdAt: true,
  businessPartyId: true
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
  return prisma.purchaseOrder.findMany({
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
}

export { getWarehousePurchaseOrders }
