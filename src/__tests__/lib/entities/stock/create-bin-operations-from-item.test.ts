import { describe, expect, it, vi } from 'vitest'
import { Prisma } from '@/generated/prisma'
import {
  createBinOperationsFromItem,
  getAdjustmentBinOperationParams,
  getMovementBinOperationParams,
  normalizeQuantity
} from '@/lib/services/bin-operations'

function createMockPrisma() {
  const tx = {
    bin: {
      findUnique: vi.fn(),
      update: vi.fn()
    },
    binOperationEntry: {
      create: vi.fn()
    },
    binStockItem: {
      create: vi.fn(),
      update: vi.fn(),
      findFirst: vi.fn(),
      findUnique: vi.fn(),
      delete: vi.fn()
    },
    itemLedgerEntry: {
      create: vi.fn(),
      createMany: vi.fn()
    }
  }

  const prisma = {
    $transaction: vi.fn(async cb => cb(tx))
  }

  return { prisma, tx }
}

describe('stock operation helpers', () => {
  it('normalizes positive quantities and rejects non-positive values', () => {
    expect(normalizeQuantity(2)).toBe(2)
    expect(() => normalizeQuantity(0)).toThrow('Quantity must be a positive number')
    expect(() => normalizeQuantity(-1)).toThrow('Quantity must be a positive number')
  })

  it('builds movement and adjustment params from item data', () => {
    const item = { id: 'item-1', uom: 'EA' }

    const movement = getMovementBinOperationParams(item, {
      quantity: 4,
      fromBinId: 'bin-a',
      toBinId: 'bin-b',
      lotId: 'lot-1'
    })

    const adjustment = getAdjustmentBinOperationParams(item, {
      quantity: 3,
      binId: 'bin-c'
    })

    expect(movement).toMatchObject({
      warItemId: 'item-1',
      uom: 'EA',
      fromBinId: 'bin-a',
      toBinId: 'bin-b',
      quantity: 4,
      lotId: 'lot-1'
    })

    expect(adjustment).toMatchObject({
      warItemId: 'item-1',
      uom: 'EA',
      binId: 'bin-c',
      quantity: 3
    })
  })
})

describe('createBinOperationsFromItem', () => {
  it('creates positive BOE, stock item, and ILE for adjustment', async () => {
    const { prisma, tx } = createMockPrisma()

    tx.binOperationEntry.create.mockResolvedValue({ id: 'boe-adj' })
    tx.bin.findUnique.mockResolvedValue({ id: 'bin-1', currentCapacity: new Prisma.Decimal(10) })
    tx.bin.update.mockResolvedValue({ id: 'bin-1' })
    tx.binStockItem.findFirst.mockResolvedValue(null)
    tx.binStockItem.create.mockResolvedValue({ id: 'bsi-adj' })
    tx.itemLedgerEntry.create.mockResolvedValue({ id: 1 })

    const result = await createBinOperationsFromItem({
      prisma: prisma as never,
      operation: 'adjustment',
      item: { id: 'item-1', uom: 'EA' } as never,
      userId: 'user-1',
      warehouseId: 'wh-1',
      binId: 'bin-1',
      quantity: 5
    })

    expect(tx.binOperationEntry.create).toHaveBeenCalledTimes(1)
    expect(tx.binOperationEntry.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          type: 'ADJUST',
          toBinId: 'bin-1',
          quantity: new Prisma.Decimal(5)
        })
      })
    )

    expect(tx.binStockItem.create).toHaveBeenCalledTimes(1)
    expect(tx.binStockItem.update).not.toHaveBeenCalled()
    expect(tx.bin.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 'bin-1' },
        data: expect.objectContaining({ currentCapacity: new Prisma.Decimal(15) })
      })
    )
    expect(tx.itemLedgerEntry.create).toHaveBeenCalledTimes(1)
    expect(result.operation).toBe('adjustment')
  })

  it('increments existing stock item for adjustment and still creates separate BOE and ILE records', async () => {
    const { prisma, tx } = createMockPrisma()

    tx.binOperationEntry.create.mockResolvedValue({ id: 'boe-adj-existing' })
    tx.bin.findUnique.mockResolvedValue({ id: 'bin-1', currentCapacity: new Prisma.Decimal(7) })
    tx.bin.update.mockResolvedValue({ id: 'bin-1' })
    tx.binStockItem.findFirst.mockResolvedValue({
      id: 'bsi-existing',
      quantityAvailable: new Prisma.Decimal(7)
    })
    tx.binStockItem.update.mockResolvedValue({ id: 'bsi-existing' })
    tx.itemLedgerEntry.create.mockResolvedValue({ id: 2 })

    const result = await createBinOperationsFromItem({
      prisma: prisma as never,
      operation: 'adjustment',
      item: { id: 'item-1', uom: 'EA', name: 'Widget' } as never,
      userId: 'user-1',
      warehouseId: 'wh-1',
      binId: 'bin-1',
      quantity: 5
    })

    expect(tx.binOperationEntry.create).toHaveBeenCalledTimes(1)
    expect(tx.binStockItem.create).not.toHaveBeenCalled()
    expect(tx.binStockItem.update).toHaveBeenCalledTimes(1)
    expect(tx.binStockItem.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 'bsi-existing' },
        data: expect.objectContaining({
          quantityAvailable: { increment: 5 },
          lastOperationBoeId: 'boe-adj-existing'
        })
      })
    )

    expect(result.stockItems).toHaveLength(1)
    expect(result.stockItems[0]).toMatchObject({ id: 'bsi-existing' })
    expect(tx.bin.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 'bin-1' },
        data: expect.objectContaining({ currentCapacity: new Prisma.Decimal(12) })
      })
    )
    expect(tx.itemLedgerEntry.create).toHaveBeenCalledTimes(1)
  })

  it('creates negative + positive movement BOEs and updates stock in both bins', async () => {
    const { prisma, tx } = createMockPrisma()

    tx.binStockItem.findFirst
      .mockResolvedValueOnce({
        id: 'source-stock',
        quantityAvailable: new Prisma.Decimal(10)
      })
      .mockResolvedValueOnce(null)

    tx.bin.findUnique
      .mockResolvedValueOnce({ id: 'bin-source', currentCapacity: new Prisma.Decimal(20) })
      .mockResolvedValueOnce({ id: 'bin-destination', currentCapacity: new Prisma.Decimal(4) })

    tx.bin.update.mockResolvedValue({ id: 'bin-updated' })

    tx.binOperationEntry.create
      .mockResolvedValueOnce({ id: 'boe-neg' })
      .mockResolvedValueOnce({ id: 'boe-pos' })

    tx.binStockItem.update.mockResolvedValueOnce({ id: 'source-stock-updated' })
    tx.binStockItem.findUnique.mockResolvedValueOnce({
      id: 'source-stock',
      quantityAvailable: new Prisma.Decimal(10)
    })
    tx.binStockItem.create.mockResolvedValueOnce({ id: 'dest-stock-created' })
    tx.itemLedgerEntry.createMany.mockResolvedValue({ count: 2 })

    const result = await createBinOperationsFromItem({
      prisma: prisma as never,
      operation: 'movement',
      item: { id: 'item-1', uom: 'EA' } as never,
      userId: 'user-1',
      warehouseId: 'wh-1',
      fromBinId: 'bin-source',
      toBinId: 'bin-destination',
      quantity: 4
    })

    expect(tx.binOperationEntry.create).toHaveBeenCalledTimes(2)

    const firstCreateCall = tx.binOperationEntry.create.mock.calls[0][0]
    const secondCreateCall = tx.binOperationEntry.create.mock.calls[1][0]

    expect(firstCreateCall.data.quantity).toEqual(new Prisma.Decimal(-4))
    expect(secondCreateCall.data.quantity).toEqual(new Prisma.Decimal(4))

    expect(tx.binStockItem.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 'source-stock' },
        data: expect.objectContaining({
          quantityAvailable: new Prisma.Decimal(6),
          lastOperationBoeId: 'boe-neg'
        })
      })
    )

    expect(tx.binStockItem.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          binId: 'bin-destination',
          quantityAvailable: new Prisma.Decimal(4)
        })
      })
    )

    expect(tx.itemLedgerEntry.createMany).toHaveBeenCalledTimes(1)
    expect(tx.bin.update).toHaveBeenCalledTimes(2)
    expect(tx.bin.update).toHaveBeenNthCalledWith(
      1,
      expect.objectContaining({
        where: { id: 'bin-source' },
        data: expect.objectContaining({ currentCapacity: new Prisma.Decimal(16) })
      })
    )
    expect(tx.bin.update).toHaveBeenNthCalledWith(
      2,
      expect.objectContaining({
        where: { id: 'bin-destination' },
        data: expect.objectContaining({ currentCapacity: new Prisma.Decimal(8) })
      })
    )
    expect(result.operation).toBe('movement')
  })
})
