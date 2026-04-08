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

export type DashboardPurchaseOrderRow = {
  id: string
  reference: string
  status: OrderStatus
  supplier: string
  warehouseId: string
  createdAt: Date
  businessPartyId: string | null
}

async function getDashboardPurchaseOrders(prisma: PrismaClient): Promise<DashboardPurchaseOrderRow[]> {
  return prisma.purchaseOrder.findMany({
    where: {
      deletedAt: null,
      status: {
        notIn: [OrderStatus.CANCELLED, OrderStatus.CONFIRMED]
      }
    },
    select: listSelect,
    orderBy: { createdAt: 'desc' }
  })
}

export { getDashboardPurchaseOrders }
