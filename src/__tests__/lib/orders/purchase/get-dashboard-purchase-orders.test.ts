import { describe, expect, it, vi } from 'vitest'
import { OrderStatus } from '@/generated/prisma'
import { getDashboardPurchaseOrders } from '@/lib/orders/purchase/get-dashboard-purchase-orders'

describe('getDashboardPurchaseOrders', () => {
  it('queries with dashboard status filter and soft-delete guard', async () => {
    const findMany = vi.fn().mockResolvedValue([])
    const prisma = { purchaseOrder: { findMany } } as never

    await getDashboardPurchaseOrders(prisma)

    expect(findMany).toHaveBeenCalledWith({
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
  })
})
