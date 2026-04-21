import type { PrismaClient } from '@/generated/prisma'
import type { TrolleyItemRecord } from '@/types/stock'

async function getItemsInBin(
  prisma: PrismaClient,
  binId: string,
  onlyAvailable: boolean = false
) {
  const baseSelect = {
    id: true,
    name: true,
    sku: true,
    lotId: true,
    boxId: true,
    serialNumberId: true,
    uom: true,
    quantityAvailable: true,
    quantityReserved: true,
    quantityBlocked: true
  } as const

  return prisma.binStockItem.findMany({
    where: {
      binId,
      ...(onlyAvailable && { quantityAvailable: { gt: 0 } })
    },
    select: onlyAvailable
      ? baseSelect
      : { ...baseSelect, quantityBlocked: true, quantityReserved: true },
    orderBy: { createdAt: 'desc' }
  })
}

export async function getTrolleyItems(
  prisma: PrismaClient,
  warehouseId: string,
  deviceId: string
): Promise<TrolleyItemRecord[]> {
  const items = await prisma.binStockItem.findMany({
    where: {
      warehouseId,
      transitDeviceId: deviceId,
      status: 'IN_TRANSIT',
      quantityAvailable: { gt: 0 }
    },
    include: {
      item: {
        select: {
          name: true
        }
      },
      bin: {
        select: {
          id: true,
          name: true,
          code: true
        }
      }
    },
    orderBy: { updatedAt: 'desc' }
  })

  return items.map((item) => ({
    id: item.id,
    sourceBinId: item.binId,
    sourceBinName: item.bin.name,
    sourceBinCode: item.bin.code,
    itemId: item.itemId,
    description: item.item.name,
    lotId: item.lotId,
    serialNumberId: item.serialNumberId,
    uom: item.uom,
    quantityAvailable: Number(item.quantityAvailable) || 0
  }))
}

export { getItemsInBin }
