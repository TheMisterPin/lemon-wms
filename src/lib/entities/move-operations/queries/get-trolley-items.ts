import type { PrismaClient } from '@/generated/prisma'

import type { TrolleyItemRecord } from '../types'

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
    description: item.description,
    lotId: item.lotId,
    serialNumberId: item.serialNumberId,
    uom: item.uom,
    quantityAvailable: Number(item.quantityAvailable) || 0
  }))
}
