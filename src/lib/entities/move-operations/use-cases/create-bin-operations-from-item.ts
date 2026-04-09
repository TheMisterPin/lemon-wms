import { Prisma } from '@/generated/prisma'

import {
  getAdjustmentBinOperationParams,
  getMovementBinOperationParams,
  mapAdjustmentLedgerEvent,
  mapMovementLedgerEvent,
  resolveOperationType
} from '@/lib/services/bin-operations/helpers'

import { upsertAvailableStockItem, updateBinCapacityBy, decrementOrDeleteStockItem, findAvailableStockItem } from '../mutations'
import type { CreateBinOperationsFromItemArgs } from '../types'

export async function createBinOperationsFromItem(args: CreateBinOperationsFromItemArgs) {
  const {
    prisma,
    item,
    userId,
    warehouseId,
    lotId,
    serialNumberId,
    orderId,
    orderType,
    reasonCode,
    notes
  } = args

  return prisma.$transaction(async (tx) => {
    if (args.operation === 'adjustment') {
      const adjustment = getAdjustmentBinOperationParams(item, {
        quantity: args.quantity,
        binId: args.binId,
        lotId,
        serialNumberId
      })

      const positiveEntry = await tx.binOperationEntry.create({
        data: {
          userId,
          warehouseId,
          type: resolveOperationType('adjustment'),
          fromBinId: null,
          toBinId: adjustment.binId,
          warItemId: adjustment.warItemId,
          quantity: new Prisma.Decimal(adjustment.quantity),
          uom: adjustment.uom,
          lotId: adjustment.lotId,
          serialNumberId: adjustment.serialNumberId,
          orderId,
          orderType,
          reasonCode,
          notes
        }
      })

      const stockItem = await upsertAvailableStockItem(tx, {
        warehouseId,
        binId: adjustment.binId,
        itemId: adjustment.warItemId,
        lotId: adjustment.lotId,
        serialNumberId: adjustment.serialNumberId,
        name: item.name,
        sku: item.sku,
        uom: adjustment.uom,
        quantity: adjustment.quantity,
        boeId: positiveEntry.id
      })

      await updateBinCapacityBy(tx, adjustment.binId, adjustment.quantity)

      await tx.itemLedgerEntry.create({
        data: {
          warehouseId,
          warItemId: adjustment.warItemId,
          lotId: adjustment.lotId,
          serialNumberId: adjustment.serialNumberId,
          orderId,
          orderType,
          boeId: positiveEntry.id,
          eventType: mapAdjustmentLedgerEvent('positive'),
          performedByUserId: userId,
          quantityDelta: new Prisma.Decimal(adjustment.quantity),
          reasonCode,
          uom: adjustment.uom
        }
      })

      return { operation: args.operation, boes: [positiveEntry], stockItems: [stockItem] }
    }

    const movement = getMovementBinOperationParams(item, {
      quantity: args.quantity,
      fromBinId: args.fromBinId,
      toBinId: args.toBinId,
      lotId,
      serialNumberId
    })

    const sourceStockItem = await findAvailableStockItem(
      tx,
      warehouseId,
      movement.fromBinId,
      movement.warItemId,
      movement.lotId,
      movement.serialNumberId
    )
    if (!sourceStockItem) {
      throw new Error('No source bin stock item found for movement')
    }
    if (sourceStockItem.quantityAvailable.lt(movement.quantity)) {
      throw new Error('Insufficient quantity in source bin stock item')
    }

    const negativeEntry = await tx.binOperationEntry.create({
      data: {
        userId,
        warehouseId,
        type: resolveOperationType('movement'),
        fromBinId: movement.fromBinId,
        toBinId: movement.toBinId,
        warItemId: movement.warItemId,
        quantity: new Prisma.Decimal(-movement.quantity),
        uom: movement.uom,
        lotId: movement.lotId,
        serialNumberId: movement.serialNumberId,
        orderId,
        orderType,
        reasonCode,
        notes
      }
    })

    const positiveEntry = await tx.binOperationEntry.create({
      data: {
        userId,
        warehouseId,
        type: resolveOperationType('movement'),
        fromBinId: movement.fromBinId,
        toBinId: movement.toBinId,
        warItemId: movement.warItemId,
        quantity: new Prisma.Decimal(movement.quantity),
        uom: movement.uom,
        lotId: movement.lotId,
        serialNumberId: movement.serialNumberId,
        orderId,
        orderType,
        reasonCode,
        notes
      }
    })

    const updatedSourceStockItem = await decrementOrDeleteStockItem(
      tx,
      sourceStockItem.id,
      movement.quantity,
      negativeEntry.id
    )

    const upsertedDestinationStockItem = await upsertAvailableStockItem(tx, {
      warehouseId,
      binId: movement.toBinId,
      itemId: movement.warItemId,
      lotId: movement.lotId,
      serialNumberId: movement.serialNumberId,
      name: item.name,
      sku: item.sku,
      uom: movement.uom,
      quantity: movement.quantity,
      boeId: positiveEntry.id
    })

    await updateBinCapacityBy(tx, movement.fromBinId, -movement.quantity)
    await updateBinCapacityBy(tx, movement.toBinId, movement.quantity)

    await tx.itemLedgerEntry.createMany({
      data: [
        {
          warehouseId,
          warItemId: movement.warItemId,
          lotId: movement.lotId,
          serialNumberId: movement.serialNumberId,
          orderId,
          orderType,
          boeId: negativeEntry.id,
          eventType: mapMovementLedgerEvent('negative'),
          performedByUserId: userId,
          quantityDelta: new Prisma.Decimal(-movement.quantity),
          reasonCode,
          uom: movement.uom
        },
        {
          warehouseId,
          warItemId: movement.warItemId,
          lotId: movement.lotId,
          serialNumberId: movement.serialNumberId,
          orderId,
          orderType,
          boeId: positiveEntry.id,
          eventType: mapMovementLedgerEvent('positive'),
          performedByUserId: userId,
          quantityDelta: new Prisma.Decimal(movement.quantity),
          reasonCode,
          uom: movement.uom
        }
      ]
    })

    return {
      operation: args.operation,
      boes: [negativeEntry, positiveEntry],
      stockItems: [updatedSourceStockItem, upsertedDestinationStockItem].filter(Boolean)
    }
  })
}
