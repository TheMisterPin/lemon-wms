import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { Prisma } from '@/generated/prisma'
import * as binsMutations from '@/lib/locations/bins/bins-mutations'
import { loadItemsToTrolley, unloadItemsFromTrolley } from '@/lib/stock/bin-stock-items/bin-stock-items-mutations'
import { getTrolleyItems } from '@/lib/stock/bin-stock-items/bin-stock-items-queries'

function createMockPrisma() {
  const tx = {
    bin: {
      findFirst: vi.fn(),
      findUnique: vi.fn(),
      update: vi.fn()
    },
    binOperationEntry: {
      create: vi.fn()
    },
    binStockItem: {
      findFirst: vi.fn(),
      findUnique: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      updateMany: vi.fn(),
      upsert: vi.fn(),
      delete: vi.fn(),
      deleteMany: vi.fn(),
      findMany: vi.fn()
    },
    zone: {
      findFirst: vi.fn().mockResolvedValue({ id: 'zone-1', name: 'Zone 1' })
    }
  }

  const prisma = {
    $transaction: vi.fn(async (callback) => callback(tx)),
    binStockItem: {
      findMany: tx.binStockItem.findMany
    }
  }

  return { prisma, tx }
}

describe('move-operations transit flow', () => {
  let updateCapacitySpy: ReturnType<typeof vi.spyOn>

  beforeEach(() => {
    updateCapacitySpy = vi.spyOn(binsMutations, 'updateBinCapacity').mockResolvedValue({} as never)
  })

  afterEach(() => {
    updateCapacitySpy.mockRestore()
  })

  it('loads to trolley in origin bin with TRANSFER_LOAD and IN_TRANSIT flags', async () => {
    const { prisma, tx } = createMockPrisma()

    tx.binStockItem.findUnique.mockResolvedValue({
      id: 'source-stock',
      warehouseId: 'wh-1',
      binId: 'bin-origin',
      itemId: 'item-1',
      lotId: null,
      serialNumberId: null,
      quantityAvailable: new Prisma.Decimal(20),
      uom: 'EA',
      status: 'AVAILABLE',
      description: 'Widget A'
    })
    tx.binOperationEntry.create.mockResolvedValue({ id: 'boe-load' })
    tx.binStockItem.upsert.mockResolvedValue({ id: 'transit-row-1' })

    const result = await loadItemsToTrolley({
      prisma: prisma as never,
      userId: 'user-1',
      warehouseId: 'wh-1',
      deviceId: 'device-1',
      sourceBinStockItemId: 'source-stock',
      quantity: 4
    })

    expect(tx.binOperationEntry.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          zoneId: 'zone-1',
          type: 'TRANSFER_LOAD',
          fromBinId: 'bin-origin',
          toBinId: null,
          quantity: new Prisma.Decimal(-4)
        })
      })
    )

    expect(tx.binStockItem.upsert).toHaveBeenCalledWith(
      expect.objectContaining({
        create: expect.objectContaining({
          binId: 'bin-origin',
          status: 'IN_TRANSIT',
          transitDeviceId: 'device-1',
          quantityAvailable: new Prisma.Decimal(4)
        })
      })
    )

    expect(tx.binStockItem.updateMany).not.toHaveBeenCalled()
    expect(tx.binStockItem.deleteMany).not.toHaveBeenCalled()
    expect(result.transitStockItem.id).toBe('transit-row-1')
  })

  it('unloads from trolley with TRANSFER_UNLOAD and updates source/destination/transit quantities', async () => {
    const { prisma, tx } = createMockPrisma()

    tx.bin.findFirst.mockResolvedValue({ id: 'bin-destination' })

    tx.binStockItem.findUnique
      .mockResolvedValueOnce({
        id: 'transit-row-1',
        warehouseId: 'wh-1',
        binId: 'bin-origin',
        itemId: 'item-1',
        lotId: null,
        serialNumberId: null,
        quantityAvailable: new Prisma.Decimal(3),
        uom: 'EA',
        status: 'IN_TRANSIT',
        description: 'Widget A'
      })
      // Post-decrement re-read inside decrementOrDeleteStockItem for source-avail-1 (10 - 3 = 7)
      .mockResolvedValueOnce({
        id: 'source-avail-1',
        quantityAvailable: new Prisma.Decimal(7)
      })
      // Post-decrement re-read inside decrementOrDeleteStockItem for transit-row-1 (3 - 3 = 0)
      .mockResolvedValueOnce({
        id: 'transit-row-1',
        quantityAvailable: new Prisma.Decimal(0)
      })

    tx.binStockItem.findFirst.mockResolvedValueOnce({
      id: 'source-avail-1',
      warehouseId: 'wh-1',
      binId: 'bin-origin',
      itemId: 'item-1',
      lotId: null,
      serialNumberId: null,
      quantityAvailable: new Prisma.Decimal(10)
    })

    tx.binOperationEntry.create.mockResolvedValue({ id: 'boe-unload' })
    tx.binStockItem.updateMany.mockResolvedValue({ count: 1 })
    tx.binStockItem.upsert.mockResolvedValue({ id: 'dest-avail-created' })
    tx.binStockItem.deleteMany.mockResolvedValue({ count: 1 })

    tx.bin.findUnique
      .mockResolvedValueOnce({ currentCapacity: new Prisma.Decimal(20) })
      .mockResolvedValueOnce({ currentCapacity: new Prisma.Decimal(5) })
    tx.bin.update.mockResolvedValue({ id: 'bin-updated' })

    const result = await unloadItemsFromTrolley({
      prisma: prisma as never,
      userId: 'user-1',
      warehouseId: 'wh-1',
      toBinId: 'bin-destination',
      selections: [{ transitBinStockItemId: 'transit-row-1' }]
    })

    expect(tx.binOperationEntry.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          zoneId: 'zone-1',
          type: 'TRANSFER_UNLOAD',
          fromBinId: 'bin-origin',
          toBinId: 'bin-destination',
          quantity: new Prisma.Decimal(3)
        })
      })
    )

    expect(tx.binStockItem.updateMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ id: 'source-avail-1', quantityAvailable: { gte: 3 } }),
        data: expect.objectContaining({
          quantityAvailable: { decrement: 3 }
        })
      })
    )

    expect(tx.binStockItem.upsert).toHaveBeenCalledWith(
      expect.objectContaining({
        create: expect.objectContaining({
          binId: 'bin-destination',
          status: 'AVAILABLE',
          transitDeviceId: null,
          quantityAvailable: new Prisma.Decimal(3)
        })
      })
    )

    expect(tx.binStockItem.updateMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ id: 'transit-row-1', quantityAvailable: { gte: 3 } })
      })
    )
    expect(tx.binStockItem.deleteMany).toHaveBeenCalledWith({
      where: { id: 'transit-row-1', quantityAvailable: new Prisma.Decimal(0) }
    })
    expect(result.results[0]).toMatchObject({
      boeId: 'boe-unload',
      transitBinStockItemId: 'transit-row-1',
      unloadedQuantity: 3
    })
  })

  it('returns device-scoped trolley items from query helper', async () => {
    const { prisma, tx } = createMockPrisma()

    tx.binStockItem.findMany.mockResolvedValue([
      {
        id: 'transit-1',
        binId: 'bin-origin',
        itemId: 'item-1',
        item: { name: 'Widget A' },
        lotId: null,
        serialNumberId: null,
        uom: 'EA',
        quantityAvailable: new Prisma.Decimal(2),
        bin: { id: 'bin-origin', name: 'Origin Bin', code: 'BIN-01' }
      }
    ])

    const result = await getTrolleyItems(prisma as never, 'wh-1', 'device-1')

    expect(tx.binStockItem.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          warehouseId: 'wh-1',
          transitDeviceId: 'device-1',
          status: 'IN_TRANSIT'
        })
      })
    )
    expect(result).toEqual([
      {
        id: 'transit-1',
        sourceBinId: 'bin-origin',
        sourceBinName: 'Origin Bin',
        sourceBinCode: 'BIN-01',
        itemId: 'item-1',
        description: 'Widget A',
        lotId: null,
        serialNumberId: null,
        uom: 'EA',
        quantityAvailable: 2
      }
    ])
  })
})
