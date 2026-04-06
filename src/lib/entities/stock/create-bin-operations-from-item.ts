import { Prisma } from '@/generated/prisma'
import type { Item, PrismaClient } from '@/generated/prisma'

import {
  getAdjustmentBinOperationParams,
  getMovementBinOperationParams,
  mapAdjustmentLedgerEvent,
  mapMovementLedgerEvent,
  resolveOperationType
} from './bin-operation-helpers'

type BaseArgs = {
  prisma: PrismaClient
  item: Pick<Item, 'id' | 'uom' | 'name' >
  userId: string
  warehouseId: string
  quantity: number
  lotId?: string
  serialNumberId?: string
  orderId?: string
  orderType?: 'PURCHASE' | 'SALES' | 'TRANSFER' | 'RETURN' | 'ADJUSTMENT'
  reasonCode?: string
  notes?: string
}

type AdjustmentArgs = BaseArgs & {
  operation: 'adjustment'
  binId: string
}

type MovementArgs = BaseArgs & {
  operation: 'movement'
  fromBinId: string
  toBinId: string
}

type CreateBinOperationsFromItemArgs = AdjustmentArgs | MovementArgs

function decimalToNumber(value: unknown): number {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return value
  }

  if (typeof value === 'string' && value.trim() !== '') {
    const parsed = Number(value)

    if (Number.isFinite(parsed)) {
      return parsed
    }
  }

  if (typeof value === 'object' && value !== null) {
    const parsed = Number(value.toString())

    if (Number.isFinite(parsed)) {
      return parsed
    }
  }

  return 0
}

async function createBinOperationsFromItem(args: CreateBinOperationsFromItemArgs) {
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

  return prisma.$transaction(async tx => {
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

      const existingStockItem = await tx.binStockItem.findFirst({
        where: {
          warehouseId,
          binId: adjustment.binId,
          itemId: adjustment.warItemId,
          lotId: adjustment.lotId,
          serialNumberId: adjustment.serialNumberId
        }
      })

      const stockItem = existingStockItem
        ? await tx.binStockItem.update({
          where: { id: existingStockItem.id },
          data: {
            quantityAvailable: { increment: adjustment.quantity },
            description: item.name,
            lastOperationBoeId: positiveEntry.id
          }
        })
        : await tx.binStockItem.create({
          data: {
            warehouseId,
            description: item.name,
            binId: adjustment.binId,
            itemId: adjustment.warItemId,
            lotId: adjustment.lotId,
            serialNumberId: adjustment.serialNumberId,
            quantityAvailable: new Prisma.Decimal(adjustment.quantity),
            uom: adjustment.uom,
            createdByBoeId: positiveEntry.id,
            lastOperationBoeId: positiveEntry.id
          }
        })

      const destinationBin = await tx.bin.findUnique({
        where: { id: adjustment.binId },
        select: { id: true, currentCapacity: true }
      })

      if (!destinationBin) {
        throw new Error('Destination bin not found for adjustment')
      }

      await tx.bin.update({
        where: { id: adjustment.binId },
        data: {
          currentCapacity: new Prisma.Decimal(
            decimalToNumber(destinationBin.currentCapacity) + adjustment.quantity
          )
        }
      })

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

      return {
        operation: args.operation,
        boes: [positiveEntry],
        stockItems: [stockItem]
      }
    }

    const movement = getMovementBinOperationParams(item, {
      quantity: args.quantity,
      fromBinId: args.fromBinId,
      toBinId: args.toBinId,
      lotId,
      serialNumberId
    })

    const sourceStockItem = await tx.binStockItem.findFirst({
      where: {
        warehouseId,
        binId: movement.fromBinId,
        itemId: movement.warItemId,
        lotId: movement.lotId,
        serialNumberId: movement.serialNumberId
      }
    })

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

    const updatedSourceStockItem = await tx.binStockItem.update({
      where: { id: sourceStockItem.id },
      data: {
        quantityAvailable: { decrement: movement.quantity },
        lastOperationBoeId: negativeEntry.id
      }
    })

    const destinationStockItem = await tx.binStockItem.findFirst({
      where: {
        warehouseId,
        binId: movement.toBinId,
        itemId: movement.warItemId,
        lotId: movement.lotId,
        serialNumberId: movement.serialNumberId
      }
    })

    const upsertedDestinationStockItem = destinationStockItem
      ? await tx.binStockItem.update({
        where: { id: destinationStockItem.id },
        data: {
          quantityAvailable: { increment: movement.quantity },
          lastOperationBoeId: positiveEntry.id
        }
      })
      : await tx.binStockItem.create({
        data: {
          warehouseId,
          description: item.name,
          binId: movement.toBinId,
          itemId: movement.warItemId,
          lotId: movement.lotId,
          serialNumberId: movement.serialNumberId,
          quantityAvailable: new Prisma.Decimal(movement.quantity),
          uom: movement.uom,
          createdByBoeId: positiveEntry.id,
          lastOperationBoeId: positiveEntry.id
        }
      })

    const sourceBin = await tx.bin.findUnique({
      where: { id: movement.fromBinId },
      select: { id: true, currentCapacity: true }
    })

    const destinationBin = await tx.bin.findUnique({
      where: { id: movement.toBinId },
      select: { id: true, currentCapacity: true }
    })

    if (!sourceBin || !destinationBin) {
      throw new Error('Bin not found for movement operation')
    }

    const sourceCapacity = Math.max(0, decimalToNumber(sourceBin.currentCapacity) - movement.quantity)
    const destinationCapacity = decimalToNumber(destinationBin.currentCapacity) + movement.quantity

    await tx.bin.update({
      where: { id: movement.fromBinId },
      data: {
        currentCapacity: new Prisma.Decimal(sourceCapacity)
      }
    })

    await tx.bin.update({
      where: { id: movement.toBinId },
      data: {
        currentCapacity: new Prisma.Decimal(destinationCapacity)
      }
    })

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
      stockItems: [updatedSourceStockItem, upsertedDestinationStockItem]
    }
  })
}

export { createBinOperationsFromItem }
export type { CreateBinOperationsFromItemArgs }
