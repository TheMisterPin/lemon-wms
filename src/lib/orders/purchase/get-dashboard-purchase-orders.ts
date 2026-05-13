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

/**
 * getDashboardPurchaseOrders.
 * @param prisma - Parameter for getDashboardPurchaseOrders.
 * @returns Result from getDashboardPurchaseOrders.
 */
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
      supplierNameSnapshot: true,
      warehouseId: true,
      createdAt: true,
      businessParty: {
        select: {
          id: true,
          name: true
        }
      },
      lines: {
        select: {
          id: true,
          itemId: true,
          itemNameSnapshot: true,
          uom: true,
          orderedQuantity: true,
          receiptLines: { select: { quantity: true } }
        }
      }
    },
    orderBy: { createdAt: 'desc' }
  })

  const mappedOrders = orders.map(order => ({
    id: order.id,
    reference: order.reference,
    status: order.status,
    supplier: order.businessParty?.name ?? order.supplierNameSnapshot ?? '',
    warehouseId: order.warehouseId,
    createdAt: order.createdAt,
    businessPartyId: order.businessParty?.id ?? null,
    lineCount: order.lines.length,
    lines: order.lines.map((line) => ({
      id: line.id,
      itemId: line.itemId,
      itemName: line.itemNameSnapshot ?? '',
      uom: line.uom,
      baseQuantity: line.orderedQuantity.toNumber(),
      handledQuantity: line.receiptLines.reduce((sum, rl) => sum + rl.quantity.toNumber(), 0)
    }))
  }))

  return mappedOrders
}

export { getDashboardPurchaseOrders }
