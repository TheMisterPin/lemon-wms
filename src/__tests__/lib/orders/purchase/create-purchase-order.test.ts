import { describe, expect, it, vi } from 'vitest'
import { OrderStatus } from '@/generated/prisma'
import { DomainError } from '@/lib/errors'
import { createPurchaseOrder } from '@/lib/orders/purchase/create-purchase-order'

const baseInput = {
  orderNo: 'PO-REF-1',
  businessPartyId: 'SUP-0001',
  warehouseId: 'WH-001',
  lines: [{ itemId: 'item-1', baseQuantity: 2, itemName: 'Client name' }],
  createdById: 'user-1'
}

function setupTransaction(mocks: {
  warehouse: unknown
  supplier: unknown
  item: unknown
  createResult?: unknown
}) {
  const tx = {
    warehouse: { findFirst: vi.fn().mockResolvedValue(mocks.warehouse) },
    businessParty: { findFirst: vi.fn().mockResolvedValue(mocks.supplier) },
    item: { findFirst: vi.fn().mockResolvedValue(mocks.item) },
    purchaseOrder: {
      create: vi.fn().mockResolvedValue(
        mocks.createResult ?? {
          id: 'po-uuid',
          reference: 'PO-REF-1',
          status: OrderStatus.DRAFT,
          lines: [{ id: 'line-uuid' }]
        }
      )
    }
  }

  const prisma = {
    $transaction: vi.fn(async (fn: (t: typeof tx) => Promise<unknown>) => fn(tx))
  }

  return { prisma, tx }
}

describe('createPurchaseOrder', () => {
  it('creates PO with server-side itemName and uom', async () => {
    const { prisma, tx } = setupTransaction({
      warehouse: { id: 'WH-001' },
      supplier: { id: 'SUP-0001', name: 'Acme Supplies' },
      item: { id: 'item-1', name: 'Real Item Name', uom: 'EA' }
    })

    const result = await createPurchaseOrder(prisma as never, baseInput)

    expect(tx.warehouse.findFirst).toHaveBeenCalled()
    expect(tx.businessParty.findFirst).toHaveBeenCalled()
    expect(tx.item.findFirst).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          id: 'item-1',
          supplierId: 'SUP-0001',
          isActive: true,
          deletedAt: null
        })
      })
    )
    expect(tx.purchaseOrder.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        reference: 'PO-REF-1',
        warehouseId: 'WH-001',
        businessPartyId: 'SUP-0001',
        supplier: 'Acme Supplies',
        createdById: 'user-1',
        lines: {
          create: [
            {
              lineSequence: 1,
              itemId: 'item-1',
              itemName: 'Real Item Name',
              uom: 'EA',
              baseQuantity: expect.any(Object)
            }
          ]
        }
      }),
      select: {
        id: true,
        reference: true,
        status: true,
        lines: { select: { id: true } }
      }
    })
    expect(result).toMatchObject({
      id: 'po-uuid',
      reference: 'PO-REF-1',
      status: OrderStatus.DRAFT,
      lineCount: 1,
      lines: [{ id: 'line-uuid' }]
    })
  })

  it('throws when warehouse is missing', async () => {
    const { prisma } = setupTransaction({
      warehouse: null,
      supplier: { id: 'SUP-0001', name: 'Acme' },
      item: { id: 'item-1', name: 'X', uom: 'EA' }
    })

    await expect(createPurchaseOrder(prisma as never, baseInput)).rejects.toThrow(DomainError)
    await expect(createPurchaseOrder(prisma as never, baseInput)).rejects.toMatchObject({
      code: 'NOT_FOUND',
      status: 404
    })
  })

  it('throws when supplier is missing', async () => {
    const { prisma } = setupTransaction({
      warehouse: { id: 'WH-001' },
      supplier: null,
      item: { id: 'item-1', name: 'X', uom: 'EA' }
    })

    await expect(createPurchaseOrder(prisma as never, baseInput)).rejects.toMatchObject({
      code: 'NOT_FOUND',
      status: 404
    })
  })

  it('throws when item is not in supplier catalog', async () => {
    const { prisma } = setupTransaction({
      warehouse: { id: 'WH-001' },
      supplier: { id: 'SUP-0001', name: 'Acme' },
      item: null
    })

    await expect(createPurchaseOrder(prisma as never, baseInput)).rejects.toMatchObject({
      code: 'INVALID_LINE_ITEM',
      status: 400
    })
  })
})
