import { Prisma } from '@/generated/prisma'
import type { Prisma as PrismaTypes } from '@/generated/prisma'

import { decimalToNumber } from './move-operations-validators'

export async function findAvailableStockItem(
  tx: PrismaTypes.TransactionClient,
  warehouseId: string,
  binId: string,
  itemId: string,
  lotId?: string | null,
  serialNumberId?: string | null
) {
  return tx.binStockItem.findFirst({
    where: {
      warehouseId,
      binId,
      itemId,
      lotId: lotId ?? null,
      serialNumberId: serialNumberId ?? null,
      status: 'AVAILABLE',
      transitDeviceId: null
    }
  })
}

export async function upsertAvailableStockItem(
  tx: PrismaTypes.TransactionClient,
  args: {
    warehouseId: string
    binId: string
    itemId: string
    lotId?: string | null
    serialNumberId?: string | null
    name: string
    sku: string
    uom: string
    quantity: number
    boeId: string
  }
) {
  const existing = await findAvailableStockItem(
    tx,
    args.warehouseId,
    args.binId,
    args.itemId,
    args.lotId,
    args.serialNumberId
  )

  if (existing) {
    return tx.binStockItem.update({
      where: { id: existing.id },
      data: {
        quantityAvailable: { increment: args.quantity },
        name: args.name,
        sku: args.sku,
        lastOperationBoeId: args.boeId,
        status: 'AVAILABLE',
        transitDeviceId: null
      }
    })
  }

  return tx.binStockItem.create({
    data: {
      warehouseId: args.warehouseId,
      name: args.name,
      sku: args.sku,
      binId: args.binId,
      itemId: args.itemId,
      lotId: args.lotId ?? null,
      serialNumberId: args.serialNumberId ?? null,
      quantityAvailable: new Prisma.Decimal(args.quantity),
      quantityReserved: new Prisma.Decimal(0),
      quantityBlocked: new Prisma.Decimal(0),
      uom: args.uom,
      status: 'AVAILABLE',
      transitDeviceId: null,
      createdByBoeId: args.boeId,
      lastOperationBoeId: args.boeId
    }
  })
}

export async function decrementOrDeleteStockItem(
  tx: PrismaTypes.TransactionClient,
  stockItemId: string,
  quantity: number,
  boeId: string
) {
  const source = await tx.binStockItem.findUnique({ where: { id: stockItemId } })
  if (!source) {
    throw new Error('Stock item not found')
  }

  const nextQuantity = decimalToNumber(source.quantityAvailable) - quantity
  if (nextQuantity <= 0) {
    await tx.binStockItem.delete({ where: { id: source.id } })

    return null
  }

  return tx.binStockItem.update({
    where: { id: source.id },
    data: {
      quantityAvailable: new Prisma.Decimal(nextQuantity),
      lastOperationBoeId: boeId
    }
  })
}
