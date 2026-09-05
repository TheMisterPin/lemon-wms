import { Prisma } from '@/generated/prisma'

import { DomainError } from '@/lib/errors'
import { getZoneFromBin, updateBinCapacity } from '@/lib/locations'
import { createBinOperationsFromItem } from '@/lib/logs/bin-operation-entries/create-from-item'
import { updateBinCapacityBy } from '@/lib/stock/stock-mutations'
import type { AddItemsToBinArgs, UnloadItemsFromTrolleyArgs } from '@/types/stock'
import type { LoadItemsToTrolleyArgs } from '@/types/stock'
import type { RemoveItemsFromBinArgs } from '@/types/stock'
import {
  computeBinStockItemBucketKey,
  decrementOrDeleteStockItem,
  findAvailableStockItem,
  upsertAvailableStockItem
} from '../stock-mutations'
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
      throw new DomainError('Source bin stock item not found.', 'NOT_FOUND', 404)
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
  const { prisma, userId, warehouseId, deviceId, trolleyId, sourceBinStockItemId, quantity } = args
  const normalizedQuantity = normalizePositiveQuantity(quantity)

  return prisma.$transaction(async (tx) => {
    const source = await tx.binStockItem.findUnique({
      where: { id: sourceBinStockItemId }
    })

    if (!source || source.warehouseId !== warehouseId) {
      throw new DomainError('Source bin stock item not found.', 'NOT_FOUND', 404)
    }
    if (source.status !== 'AVAILABLE' && source.status !== 'RESERVED') {
      throw new DomainError('Source bin stock item not found.', 'NOT_FOUND', 404)
    }

    const isReserved = source.status === 'RESERVED'
    const effectiveQty = isReserved ? source.quantityReserved : source.quantityAvailable
    if (effectiveQty.lt(normalizedQuantity)) {
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
        serialNumberId: source.serialNumberId,
        ...(trolleyId && { trolleyId })
      }
    })

    // For RESERVED items: decrement quantityReserved now (source bin ownership is settled at load time).
    // Guarded conditional update — the `gte` check is re-evaluated at write time, not against the
    // `source` snapshot read above, so two concurrent loads can't both succeed against the same reservation.
    if (isReserved) {
      const decremented = await tx.binStockItem.updateMany({
        where: { id: source.id, quantityReserved: { gte: normalizedQuantity } },
        data: { quantityReserved: { decrement: normalizedQuantity }, lastOperationBoeId: transferLoadBoe.id }
      })
      if (decremented.count === 0) {
        throw new DomainError('Insufficient quantity in source bin stock item.', 'INSUFFICIENT_STOCK', 409)
      }

      const updatedSource = await tx.binStockItem.findUnique({ where: { id: source.id } })
      if (updatedSource && updatedSource.quantityReserved.lte(0)) {
        if (updatedSource.quantityAvailable.gt(0)) {
          await tx.binStockItem.updateMany({
            where: { id: source.id, quantityReserved: { lte: 0 } },
            data: {
              quantityReserved: new Prisma.Decimal(0),
              status: 'AVAILABLE',
              reservedByOrderId: null,
              reservedByOrderLineId: null,
              lastOperationBoeId: transferLoadBoe.id
            }
          })
        } else {
          await tx.binStockItem.deleteMany({
            where: { id: source.id, quantityReserved: { lte: 0 }, quantityAvailable: { lte: 0 } }
          })
        }
      }
    }

    const transitBucketKey = computeBinStockItemBucketKey({
      binId: source.binId,
      itemId: source.itemId,
      lotId: source.lotId,
      serialNumberId: source.serialNumberId,
      status: 'IN_TRANSIT',
      transitDeviceId: deviceId,
      transitTrolleyId: trolleyId ?? null
    })

    const transitStockItem = await tx.binStockItem.upsert({
      where: { bucketKey: transitBucketKey },
      update: {
        quantityAvailable: { increment: normalizedQuantity },
        lastOperationBoeId: transferLoadBoe.id
      },
      create: {
        warehouseId,
        binId: source.binId,
        itemId: source.itemId,
        lotId: source.lotId,
        serialNumberId: source.serialNumberId,
        bucketKey: transitBucketKey,
        quantityAvailable: new Prisma.Decimal(normalizedQuantity),
        quantityReserved: new Prisma.Decimal(0),
        quantityBlocked: new Prisma.Decimal(0),
        uom: source.uom,
        status: 'IN_TRANSIT',
        transitDeviceId: deviceId,
        transitTrolleyId: trolleyId ?? null,
        reservedByOrderId: isReserved ? source.reservedByOrderId : null,
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
      throw new DomainError('Destination bin not found.', 'NOT_FOUND', 404)
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
        throw new DomainError('Transit item not found.', 'NOT_FOUND', 404)
      }

      const requestedQty = selection.quantity ?? decimalToNumber(transitItem.quantityAvailable)
      const unloadQty = normalizePositiveQuantity(requestedQty)

      // RESERVED-sourced transit items already had their source bin decremented at load time;
      // only decrement the source AVAILABLE row for AVAILABLE-sourced items.
      const sourceAvailable = !transitItem.reservedByOrderId
        ? await findAvailableStockItem(
          tx,
          warehouseId,
          transitItem.binId,
          transitItem.itemId,
          transitItem.lotId,
          transitItem.serialNumberId
        )
        : null

      if (!transitItem.reservedByOrderId && !sourceAvailable) {
        throw new DomainError('Origin bin stock item not found.', 'NOT_FOUND', 404)
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

      if (sourceAvailable) {
        await decrementOrDeleteStockItem(tx, sourceAvailable.id, unloadQty, transferUnloadBoe.id)
      }
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

      await decrementOrDeleteStockItem(tx, transitItem.id, unloadQty, transferUnloadBoe.id)

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
