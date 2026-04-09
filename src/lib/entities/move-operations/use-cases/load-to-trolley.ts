import { Prisma } from '@/generated/prisma'

import { normalizePositiveQuantity } from '../validation'
import type { LoadItemsToTrolleyArgs } from '../types'

export async function loadItemsToTrolley(args: LoadItemsToTrolleyArgs) {
  const { prisma, userId, warehouseId, deviceId, sourceBinStockItemId, quantity } = args
  const normalizedQuantity = normalizePositiveQuantity(quantity)

  return prisma.$transaction(async (tx) => {
    const source = await tx.binStockItem.findUnique({
      where: { id: sourceBinStockItemId }
    })

    if (!source || source.warehouseId !== warehouseId || source.status !== 'AVAILABLE') {
      throw new Error('Source bin stock item not found')
    }
    if (source.quantityAvailable.lt(normalizedQuantity)) {
      throw new Error('Insufficient quantity in source bin stock item')
    }

    const transferLoadBoe = await tx.binOperationEntry.create({
      data: {
        userId,
        warehouseId,
        type: 'TRANSFER_LOAD',
        fromBinId: source.binId,
        toBinId: null,
        warItemId: source.itemId,
        quantity: new Prisma.Decimal(-normalizedQuantity),
        uom: source.uom,
        lotId: source.lotId,
        serialNumberId: source.serialNumberId
      }
    })

    const existingTransit = await tx.binStockItem.findFirst({
      where: {
        warehouseId,
        binId: source.binId,
        itemId: source.itemId,
        lotId: source.lotId,
        serialNumberId: source.serialNumberId,
        transitDeviceId: deviceId,
        status: 'IN_TRANSIT'
      }
    })

    const transitStockItem = existingTransit
      ? await tx.binStockItem.update({
        where: { id: existingTransit.id },
        data: {
          quantityAvailable: { increment: normalizedQuantity },
          lastOperationBoeId: transferLoadBoe.id
        }
      })
      : await tx.binStockItem.create({
        data: {
          warehouseId,
          binId: source.binId,
          itemId: source.itemId,
          lotId: source.lotId,
          serialNumberId: source.serialNumberId,
          quantityAvailable: new Prisma.Decimal(normalizedQuantity),
          quantityReserved: new Prisma.Decimal(0),
          quantityBlocked: new Prisma.Decimal(0),
          uom: source.uom,
          status: 'IN_TRANSIT',
          transitDeviceId: deviceId,
          createdByBoeId: transferLoadBoe.id,
          lastOperationBoeId: transferLoadBoe.id,
          name: source.name,
          sku: source.sku
        }
      })

    return { boes: [transferLoadBoe], transitStockItem }
  })
}
