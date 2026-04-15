import type { PrismaClient } from '@/generated/prisma'
import { OrderStatus } from '@/generated/prisma'

export type DashboardPurchaseOrderLineRow = {
  id: string
  itemId: string
  itemName: string
  uom: string
  baseQuantity: number
  handledQuantity: number
}
export type DashboardPurchaseOrderRow = {
  id: string
  reference: string
  status: OrderStatus
  supplier: string
  warehouseId: string
  createdAt: Date
  businessPartyId: string | null
  lineCount: number
  lines: DashboardPurchaseOrderLineRow[]
}

async function getDashboardPurchaseOrders(prisma: PrismaClient): Promise<DashboardPurchaseOrderRow[]> {
  const orders = await prisma.purchaseOrder.findMany({
    where: {
      deletedAt: null,
      status: {
        notIn: [OrderStatus.CANCELLED, OrderStatus.CONFIRMED]
      }
    },
    select: {
      id: true,
      reference: true,
      status: true,
      supplier: true,
      warehouseId: true,
      createdAt: true,
      businessParty: {
        select: {
          name: true
        }
      },
      lines: true
    },
    orderBy: { createdAt: 'desc' }
  })

  const mappedOrders = orders.map(order => ({
    id: order.id,
    reference: order.reference,
    status: order.status,
    supplier: order.businessParty?.name ?? '',
    warehouseId: order.warehouseId,
    createdAt: order.createdAt,
    businessPartyId: order.businessParty?.name ?? null,
    lineCount: order.lines.length,
    lines: order.lines.map(line => ({
      id: line.id,
      itemId: line.itemId,
      itemName: line.itemName,
      uom: line.uom,
      baseQuantity: line.baseQuantity.toNumber(),
      handledQuantity: line.handledQuantity.toNumber()
    }))
  }))

  return mappedOrders
}

export { getDashboardPurchaseOrders }
