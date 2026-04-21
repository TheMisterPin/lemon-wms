import type { BinStockItem, PrismaClient } from '@/generated/prisma'

import type { IBin } from '@/types/models/bin'
import type { IBinItem } from '@/types/models/bin-item'

function getDisplayQuantities(row: BinStockItem): { quantity: number, actualQuantity: number } {
  const actualQuantity = row.quantityAvailable.toNumber() + row.quantityReserved.toNumber() + row.quantityBlocked.toNumber()
  let result: { quantity: number, actualQuantity: number } = { quantity: 0, actualQuantity: 0 }
  switch (row.status) {
  case 'AVAILABLE':
    result = { quantity: row.quantityAvailable.toNumber(), actualQuantity }
    break
  case 'RESERVED':
    result = { quantity: row.quantityReserved.toNumber(), actualQuantity }
    break
  case 'BLOCKED':
    result = { quantity: row.quantityBlocked.toNumber(), actualQuantity }
    break
  }

  return result
}

function normalizeBinStockItem(row: BinStockItem): IBinItem {
  const { quantity, actualQuantity } = getDisplayQuantities(row)

  return {
    id: row.id,
    binId: row.binId,
    itemId: row.itemId,
    lotId: row.lotId,
    serialNumberId: row.serialNumberId,
    quantityAvailable: row.quantityAvailable.toNumber(),
    quantityReserved: row.quantityReserved.toNumber(),
    quantityBlocked: row.quantityBlocked.toNumber(),
    quantity,
    actualQuantity,
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

async function getBinList(prisma: PrismaClient, zoneId: string) {
  return prisma.bin.findMany({
    where: { deletedAt: null, zoneId },
    select: {
      id: true,
      name: true,
      code: true,
      maxCapacity: true,
      currentCapacity: true
    },
    orderBy: { createdAt: 'desc' }
  })
}

async function getBin(prisma: PrismaClient, id: string) {
  return prisma.bin.findFirst({ where: { id, deletedAt: null } })
}

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
    content: bin.binStockItems.map(normalizeBinStockItem)
  }
}

async function getBins(prisma: PrismaClient, filters?: { zoneId?: string; warehouseId?: string }) {
  return prisma.bin.findMany({
    where: {
      deletedAt: null,
      ...(filters?.zoneId ? { zoneId: filters.zoneId } : {}),
      ...(filters?.warehouseId ? { warehouseId: filters.warehouseId } : {})
    },
    select: {
      id: true,
      zoneId: true,
      warehouseId: true,
      name: true,
      code: true,
      type: true,
      isBlocked: true,
      blockReason: true,
      maxWeightKg: true,
      maxVolumeM3: true,
      maxCapacity: true,
      currentCapacity: true,
      createdAt: true,
      deletedAt: true,
      zone: {
        select: {
          name: true
        }
      },
      warehouse: {
        select: {
          name: true
        }
      },
      _count: {
        select: { binStockItems: true }
      }
    },
    orderBy: { createdAt: 'desc' }
  })
}

export { getBinList, getBin, getBinWithContent, getBins }
