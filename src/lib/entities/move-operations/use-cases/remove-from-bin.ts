import { Prisma } from '@/generated/prisma'

import { updateBinCapacityBy } from '@/lib/stock/mutations'
import type { RemoveItemsFromBinArgs } from '@/types/stock'
import { decrementOrDeleteStockItem } from '../mutations'
import { normalizePositiveQuantity } from '../validation'

/**
 * removeItemsFromBin.
 * @param args - Parameter for removeItemsFromBin.
 * @returns Result from removeItemsFromBin.
 */
export async function removeItemsFromBin(args: RemoveItemsFromBinArgs) {
  const { prisma, binStockItemId, quantity, userId, warehouseId, reasonCode, notes } = args
  const normalizedQuantity = normalizePositiveQuantity(quantity)

  return prisma.$transaction(async (tx) => {
    const source = await tx.binStockItem.findUnique({ where: { id: binStockItemId } })
    if (!source || source.warehouseId !== warehouseId) {
      throw new Error('Source bin stock item not found')
    }
    if (source.quantityAvailable.lt(normalizedQuantity)) {
      throw new Error('Insufficient quantity in source bin stock item')
    }

    const boe = await tx.binOperationEntry.create({
      data: {
        userId,
        warehouseId,
        type: 'ADJUST',
        fromBinId: source.binId,
        toBinId: null,
        warItemId: source.itemId,
        quantity: new Prisma.Decimal(-normalizedQuantity),
        uom: source.uom,
        lotId: source.lotId,
        serialNumberId: source.serialNumberId,
        reasonCode,
        notes
      }
    })

    await decrementOrDeleteStockItem(tx, source.id, normalizedQuantity, boe.id)
    await updateBinCapacityBy(tx, source.binId, -normalizedQuantity)

    return { boes: [boe] }
  })
}
