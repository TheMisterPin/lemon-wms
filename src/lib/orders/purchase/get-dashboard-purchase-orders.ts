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
          name: true
        }
      },
      receipts: {
        select: {
          id: true,
          lines: {
            select: {
              id: true,
              itemId: true,
              itemNameSnapshot: true,
              uom: true,
              quantity: true,
              orderedQuantity: true
            }
          }
        } } },
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
    lineCount: order.receipts.reduce((acc, receipt) => acc + receipt.lines.length, 0),
    lines: order.receipts.flatMap(receipt => receipt.lines.map(line => ({
      id: line.id,
      itemId: line.itemId,
      itemName: line.itemNameSnapshot ?? '',
      uom: line.uom,
      baseQuantity: line.orderedQuantity.toNumber(),
      handledQuantity: line.quantity.toNumber()
    })))
  }))

  return mappedOrders
}

export { getDashboardPurchaseOrders }
