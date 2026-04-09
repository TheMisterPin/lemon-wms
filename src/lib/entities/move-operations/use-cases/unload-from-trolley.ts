import { Prisma } from '@/generated/prisma'

import { decrementOrDeleteStockItem, findAvailableStockItem, upsertAvailableStockItem, updateBinCapacityBy } from '../mutations'
import { decimalToNumber, normalizePositiveQuantity } from '../validation'
import type { UnloadItemsFromTrolleyArgs } from '../types'

export async function unloadItemsFromTrolley(args: UnloadItemsFromTrolleyArgs) {
  const { prisma, userId, warehouseId, toBinId, selections } = args
  if (!selections.length) {
    throw new Error('At least one transit item must be selected')
  }

  return prisma.$transaction(async (tx) => {
    const toBin = await tx.bin.findFirst({
      where: { id: toBinId, warehouseId, deletedAt: null },
      select: { id: true }
    })
    if (!toBin) {
      throw new Error('Destination bin not found')
    }

    const results: Array<{ boeId: string; transitBinStockItemId: string; unloadedQuantity: number }> = []

    for (const selection of selections) {
      const transitItem = await tx.binStockItem.findUnique({
        where: { id: selection.transitBinStockItemId }
      })
      if (
        !transitItem ||
        transitItem.warehouseId !== warehouseId ||
        transitItem.status !== 'IN_TRANSIT'
      ) {
        throw new Error('Transit item not found')
      }

      const requestedQty = selection.quantity ?? decimalToNumber(transitItem.quantityAvailable)
      const unloadQty = normalizePositiveQuantity(requestedQty)
      if (transitItem.quantityAvailable.lt(unloadQty)) {
        throw new Error('Insufficient quantity in transit item')
      }

      const sourceAvailable = await findAvailableStockItem(
        tx,
        warehouseId,
        transitItem.binId,
        transitItem.itemId,
        transitItem.lotId,
        transitItem.serialNumberId
      )
      if (!sourceAvailable || sourceAvailable.quantityAvailable.lt(unloadQty)) {
        throw new Error('Insufficient quantity in origin bin stock item')
      }

      const transferUnloadBoe = await tx.binOperationEntry.create({
        data: {
          userId,
          warehouseId,
          type: 'TRANSFER_UNLOAD',
          fromBinId: transitItem.binId,
          toBinId,
          warItemId: transitItem.itemId,
          quantity: new Prisma.Decimal(unloadQty),
          uom: transitItem.uom,
          lotId: transitItem.lotId,
          serialNumberId: transitItem.serialNumberId
        }
      })

      await decrementOrDeleteStockItem(tx, sourceAvailable.id, unloadQty, transferUnloadBoe.id)
      await upsertAvailableStockItem(tx, {
        warehouseId,
        binId: toBinId,
        itemId: transitItem.itemId,
        lotId: transitItem.lotId,
        serialNumberId: transitItem.serialNumberId,
        name: transitItem.name,
        sku: transitItem.sku,
        uom: transitItem.uom,
        quantity: unloadQty,
        boeId: transferUnloadBoe.id
      })

      const nextTransitQty = decimalToNumber(transitItem.quantityAvailable) - unloadQty
      if (nextTransitQty <= 0) {
        await tx.binStockItem.delete({ where: { id: transitItem.id } })
      } else {
        await tx.binStockItem.update({
          where: { id: transitItem.id },
          data: {
            quantityAvailable: new Prisma.Decimal(nextTransitQty),
            lastOperationBoeId: transferUnloadBoe.id
          }
        })
      }

      await updateBinCapacityBy(tx, transitItem.binId, -unloadQty)
      await updateBinCapacityBy(tx, toBinId, unloadQty)

      results.push({
        boeId: transferUnloadBoe.id,
        transitBinStockItemId: transitItem.id,
        unloadedQuantity: unloadQty
      })
    }

    return { results }
  })
}
