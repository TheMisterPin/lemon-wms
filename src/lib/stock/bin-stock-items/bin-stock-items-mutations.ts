import { Prisma } from '@/generated/prisma'

import { getZoneFromBin, updateBinCapacity } from '@/lib/locations'
import { createBinOperationsFromItem } from '@/lib/logs/bin-operation-entries/create-from-item'
import { updateBinCapacityBy } from '@/lib/stock/stock-mutations'
import type { AddItemsToBinArgs, UnloadItemsFromTrolleyArgs } from '@/types/stock'
import type { LoadItemsToTrolleyArgs } from '@/types/stock'
import type { RemoveItemsFromBinArgs } from '@/types/stock'
import { decrementOrDeleteStockItem, findAvailableStockItem, upsertAvailableStockItem } from '../stock-mutations'
import { decimalToNumber, normalizePositiveQuantity } from '../stock-validators'

/**
 * removeItemsFromBin.
 * @param args - Parameter for removeItemsFromBin.
 * @returns Result from removeItemsFromBin.
 */
async function removeItemsFromBin(args: RemoveItemsFromBinArgs) {
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

    const { id: sourceZoneId } = await getZoneFromBin(tx, source.binId)

    const boe = await tx.binOperationEntry.create({
      data: {
        userId,
        warehouseId,
        zoneId: sourceZoneId,
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

/**
 * loadItemsToTrolley.
 * @param args - Parameter for loadItemsToTrolley.
 * @returns Result from loadItemsToTrolley.
 */
async function loadItemsToTrolley(args: LoadItemsToTrolleyArgs) {
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

    const { id: sourceZoneId } = await getZoneFromBin(tx, source.binId)

    const transferLoadBoe = await tx.binOperationEntry.create({
      data: {
        userId,
        warehouseId,
        zoneId: sourceZoneId,
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

/**
 * unloadItemsFromTrolley.
 * @param args - Parameter for unloadItemsFromTrolley.
 * @returns Result from unloadItemsFromTrolley.
 */
async function unloadItemsFromTrolley(args: UnloadItemsFromTrolleyArgs) {
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

    const { id: destinationZoneId } = await getZoneFromBin(tx, toBinId)

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
          zoneId: destinationZoneId,
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

      await updateBinCapacity(tx, transitItem.binId)
      await updateBinCapacity(tx, toBinId)

      results.push({
        boeId: transferUnloadBoe.id,
        transitBinStockItemId: transitItem.id,
        unloadedQuantity: unloadQty
      })
    }

    return { results }
  })
}

/**
 * addItemsToBin.
 * @param args - Parameter for addItemsToBin.
 * @returns Result from addItemsToBin.
 */
async function addItemsToBin(args: AddItemsToBinArgs) {
  return createBinOperationsFromItem({
    ...args,
    operation: 'adjustment'
  })
}

export { addItemsToBin, removeItemsFromBin, loadItemsToTrolley, unloadItemsFromTrolley }
