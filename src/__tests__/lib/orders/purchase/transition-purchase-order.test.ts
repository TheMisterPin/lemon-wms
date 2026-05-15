import { describe, expect, it, vi } from 'vitest'

import type { PrismaClient } from '@/generated/prisma'
import { OrderStatus } from '@/generated/prisma'
import {
  pausePurchaseOrder,
  releasePurchaseOrder,
  resumePurchaseOrder,
  startPurchaseOrder
} from '@/lib/orders/purchase/transition-purchase-order'

const poId = 'po-1'
const whA = 'wh-a'
const whB = 'wh-b'
const userId = 'usr-1'

function prismaWith(
  findFirstResult: unknown,
  updateManyCount = 1
): PrismaClient {
  const tx = {
    purchaseOrder: {
      updateMany: vi.fn().mockResolvedValue({ count: updateManyCount })
    },
    userActivityEntry: {
      create: vi.fn().mockResolvedValue({ id: 'uae-1' })
    },
    orderAssignment: {
      findFirst: vi.fn().mockResolvedValue(null),
      update: vi.fn().mockResolvedValue({ id: 'asg-upd' }),
      updateMany: vi.fn().mockResolvedValue({ count: 1 }),
      create: vi.fn().mockResolvedValue({ id: 'asg-new' })
    }
  }

  return {
    purchaseOrder: {
      findFirst: vi.fn().mockResolvedValue(findFirstResult),
      updateMany: vi.fn().mockResolvedValue({ count: updateManyCount })
    },
    userActivityEntry: {
      create: vi.fn().mockResolvedValue({ id: 'uae-1' })
    },
    orderAssignment: {
      findFirst: vi.fn().mockResolvedValue(null),
      update: vi.fn().mockResolvedValue({ id: 'asg-upd' }),
      updateMany: vi.fn().mockResolvedValue({ count: 1 }),
      create: vi.fn().mockResolvedValue({ id: 'asg-new' })
    },
    __tx: tx,
    $transaction: vi.fn().mockImplementation(async (callback) => callback(tx))
  } as unknown as PrismaClient
}

describe('releasePurchaseOrder', () => {
  it('releases DRAFT → RELEASED', async () => {
    const prisma = prismaWith({
      id: poId,
      reference: 'PO-0001',
      status: OrderStatus.DRAFT,
      deletedAt: null,
      warehouseId: whA
    })
    const out = await releasePurchaseOrder(prisma, poId, userId)
    expect(out).toEqual({ id: poId, status: OrderStatus.RELEASED })
    expect((prisma as unknown as { __tx: { purchaseOrder: { updateMany: ReturnType<typeof vi.fn> } } }).__tx.purchaseOrder.updateMany).toHaveBeenCalledWith({
      where: { id: poId, status: OrderStatus.DRAFT, deletedAt: null },
      data: { status: OrderStatus.RELEASED }
    })
  })

  it('throws NOT_FOUND when missing', async () => {
    const prisma = prismaWith(null)
    await expect(releasePurchaseOrder(prisma, poId, userId)).rejects.toMatchObject({
      code: 'NOT_FOUND',
      status: 404
    })
  })

  it('throws NOT_FOUND when soft-deleted', async () => {
    const prisma = prismaWith({
      id: poId,
      reference: 'PO-0001',
      status: OrderStatus.DRAFT,
      deletedAt: new Date(),
      warehouseId: whA
    })
    await expect(releasePurchaseOrder(prisma, poId, userId)).rejects.toMatchObject({
      code: 'NOT_FOUND',
      status: 404
    })
  })

  it('throws INVALID_TRANSITION when not DRAFT', async () => {
    const prisma = prismaWith({
      id: poId,
      reference: 'PO-0001',
      status: OrderStatus.RELEASED,
      deletedAt: null,
      warehouseId: whA
    })
    await expect(releasePurchaseOrder(prisma, poId, userId)).rejects.toMatchObject({
      code: 'INVALID_TRANSITION',
      status: 409
    })
  })

  it('throws INVALID_TRANSITION when compare-and-set loses', async () => {
    const prisma = prismaWith(
      {
        id: poId,
        reference: 'PO-0001',
        status: OrderStatus.DRAFT,
        deletedAt: null,
        warehouseId: whA
      },
      0
    )
    await expect(releasePurchaseOrder(prisma, poId, userId)).rejects.toMatchObject({
      code: 'INVALID_TRANSITION',
      status: 409
    })
  })
})

describe('startPurchaseOrder', () => {
  it('starts RELEASED → EXECUTING when warehouse matches', async () => {
    const prisma = prismaWith({
      id: poId,
      reference: 'PO-0001',
      status: OrderStatus.RELEASED,
      deletedAt: null,
      warehouseId: whA
    })
    const out = await startPurchaseOrder(prisma, poId, whA, userId)
    expect(out).toEqual({ id: poId, status: OrderStatus.EXECUTING, orderAssignmentId: 'asg-new' })
  })

  it('throws FORBIDDEN on warehouse mismatch', async () => {
    const prisma = prismaWith({
      id: poId,
      reference: 'PO-0001',
      status: OrderStatus.RELEASED,
      deletedAt: null,
      warehouseId: whA
    })
    await expect(startPurchaseOrder(prisma, poId, whB, userId)).rejects.toMatchObject({
      code: 'FORBIDDEN',
      status: 403
    })
  })

  it('throws INVALID_TRANSITION when not RELEASED', async () => {
    const prisma = prismaWith({
      id: poId,
      reference: 'PO-0001',
      status: OrderStatus.DRAFT,
      deletedAt: null,
      warehouseId: whA
    })
    await expect(startPurchaseOrder(prisma, poId, whA, userId)).rejects.toMatchObject({
      code: 'INVALID_TRANSITION',
      status: 409
    })
  })
})

describe('pausePurchaseOrder', () => {
  it('pauses EXECUTING → PAUSED', async () => {
    const prisma = prismaWith({
      id: poId,
      reference: 'PO-0001',
      status: OrderStatus.EXECUTING,
      deletedAt: null,
      warehouseId: whA
    })
    const out = await pausePurchaseOrder(prisma, poId, whA, userId)
    expect(out).toEqual({ id: poId, status: OrderStatus.PAUSED })
    expect((prisma as unknown as { __tx: { purchaseOrder: { updateMany: ReturnType<typeof vi.fn> } } }).__tx.purchaseOrder.updateMany).toHaveBeenCalledWith({
      where: { id: poId, status: OrderStatus.EXECUTING, deletedAt: null },
      data: { status: OrderStatus.PAUSED }
    })
  })
})

describe('resumePurchaseOrder', () => {
  it('resumes PAUSED → EXECUTING', async () => {
    const prisma = prismaWith({
      id: poId,
      reference: 'PO-0001',
      status: OrderStatus.PAUSED,
      deletedAt: null,
      warehouseId: whA
    })
    const out = await resumePurchaseOrder(prisma, poId, whA, userId, null)
    expect(out).toEqual({ id: poId, status: OrderStatus.EXECUTING, orderAssignmentId: 'asg-new' })
  })
})
