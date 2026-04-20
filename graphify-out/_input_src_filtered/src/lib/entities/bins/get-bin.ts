import type { BinStockItem, PrismaClient } from '@/generated/prisma'

import type { IBin } from '@/types/models/bin'
import type { IBinItem } from '@/types/models/bin-item'

/**
 * binStockItemToIBinItem.
 * @param row - Parameter for binStockItemToIBinItem.
 * @returns Result from binStockItemToIBinItem.
 */
function binStockItemToIBinItem(row: BinStockItem): IBinItem {
  return {
    id: row.id,
    binId: row.binId,
    itemId: row.itemId,
    lotId: row.lotId,
    serialNumberId: row.serialNumberId,
    quantityAvailable: row.quantityAvailable.toNumber(),
    quantityReserved: row.quantityReserved.toNumber(),
    quantityBlocked: row.quantityBlocked.toNumber(),
    uom: row.uom,
    status: row.status,
    transitDeviceId: row.transitDeviceId,
    expiryDate: row.expiryDate,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
    boxId: row.boxId,
    name: row.name,
    sku: row.sku,
    code: row.sku,
    inOtherBin: [],
    reservedByOrderId: row.reservedByOrderId,
    reservedByOrderLineId: row.reservedByOrderLineId,
    factboxInfo: null
  }
}

/**
 * getBin.
 * @param prisma - Parameter for getBin.
 * @param id - Parameter for getBin.
 * @returns Result from getBin.
 */
async function getBin(prisma: PrismaClient, id: string) {
  return prisma.bin.findFirst({ where: { id, deletedAt: null } })
}

/**
 * getBinWithContent.
 * @param prisma - Parameter for getBinWithContent.
 * @param id - Parameter for getBinWithContent.
 * @returns Result from getBinWithContent.
 */
async function getBinWithContent(prisma: PrismaClient, id: string): Promise<IBin | null> {
  const bin = await prisma.bin.findFirst({ where: { id, deletedAt: null }, include: { binStockItems: true } })
  if (!bin) {
    return null
  }

  const currentCapacity = bin.binStockItems.reduce(
    (acc, item) => acc + item.quantityAvailable.toNumber(),
    0
  )
  const maxCapacity = bin.maxCapacity?.toNumber() ?? null
  const filledPercentage =
    maxCapacity !== null && maxCapacity > 0 ? (currentCapacity / maxCapacity) * 100 : null

  return {
    id: bin.id,
    zoneId: bin.zoneId,
    warehouseId: bin.warehouseId,
    name: bin.name,
    code: bin.code,
    type: bin.type,
    maxCapacity,
    currentCapacity,
    filledPercentage,
    maxWeightKg: bin.maxWeightKg?.toNumber() ?? null,
    maxVolumeM3: bin.maxVolumeM3?.toNumber() ?? null,
    isBlocked: bin.isBlocked,
    blockReason: bin.blockReason,
    deletedAt: bin.deletedAt,
    createdAt: bin.createdAt,
    updatedAt: bin.createdAt,
    content: bin.binStockItems.map(binStockItemToIBinItem)
  }
}

export { getBin, getBinWithContent }
