import { describe, expect, it, vi } from 'vitest'
import { OrderStatus, OrderType } from '@/generated/prisma'
import { getWarehousePurchaseOrders } from '@/lib/orders/purchase/get-warehouse-purchase-orders'

describe('getWarehousePurchaseOrders', () => {
  it('queries purchase orders and active assignments in parallel', async () => {
    const findManyOrders = vi.fn().mockResolvedValue([])
    const findManyAssignments = vi.fn().mockResolvedValue([])
    const prisma = {
      purchaseOrder: { findMany: findManyOrders },
      orderAssignment: { findMany: findManyAssignments }
    } as never

    await getWarehousePurchaseOrders(prisma, 'wh-1')

    expect(findManyOrders).toHaveBeenCalledWith({
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
      },
      orderBy: { createdAt: 'desc' }
    })

    expect(findManyAssignments).toHaveBeenCalledWith({
      where: {
        warehouseId: 'wh-1',
        orderType: { in: [OrderType.PURCHASE] },
        isActive: true
      },
      select: {
        id: true,
        orderId: true,
        orderType: true,
        userId: true,
        assignedAt: true,
        startedAt: true,
        pausedAt: true,
        releasedAt: true,
        completedAt: true,
        cancelledAt: true,
        timedOutAt: true
      },
      orderBy: { assignedAt: 'desc' }
    })
  })
})
