import { describe, expect, it, vi } from 'vitest'
import { OrderStatus } from '@/generated/prisma'
import { getWarehousePurchaseOrders } from '@/lib/orders/purchase/get-warehouse-purchase-orders'

describe('getWarehousePurchaseOrders', () => {
  it('queries with operational statuses and warehouse scope', async () => {
    const findMany = vi.fn().mockResolvedValue([])
    const prisma = { purchaseOrder: { findMany } } as never

    await getWarehousePurchaseOrders(prisma, 'wh-1')

    expect(findMany).toHaveBeenCalledWith({
      where: {
        deletedAt: null,
        warehouseId: 'wh-1',
        status: {
          in: [OrderStatus.RELEASED, OrderStatus.EXECUTING, OrderStatus.PAUSED]
        }
      },
      select: {
        id: true,
        reference: true,
        status: true,
        supplier: true,
        warehouseId: true,
        createdAt: true,
        businessPartyId: true
      },
      orderBy: { createdAt: 'desc' }
    })
  })
})
