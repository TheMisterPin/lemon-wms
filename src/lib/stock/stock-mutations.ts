import { Prisma } from '@/generated/prisma'
import type { Prisma as PrismaTypes } from '@/generated/prisma'

import { DomainError } from '@/lib/errors'

/**
 * updateBinCapacityBy.
 * Atomically applies a capacity delta, clamped at zero, in a single
 * conditional UPDATE — no read-then-write race window between concurrent
 * callers touching the same bin.
 * @param tx - Parameter for updateBinCapacityBy.
 * @param binId - Parameter for updateBinCapacityBy.
 * @param delta - Parameter for updateBinCapacityBy.
 * @returns Result from updateBinCapacityBy.
 */
export async function updateBinCapacityBy(
  tx: PrismaTypes.TransactionClient,
  binId: string,
  delta: number
) {
  const affected = await tx.$executeRaw`
    UPDATE "Bin"
    SET "currentCapacity" = GREATEST(0, COALESCE("currentCapacity", 0) + ${delta}::numeric)
    WHERE "id" = ${binId}
  `

  if (affected === 0) {
    throw new DomainError('Bin not found.', 'NOT_FOUND', 404)
  }
}

export type BinStockItemBucketFields = {
  binId: string
  itemId: string
  lotId?: string | null
  serialNumberId?: string | null
  status: string
  transitDeviceId?: string | null
  transitTrolleyId?: string | null
}

/**
 * computeBinStockItemBucketKey.
 * Single always-non-null identity for a BinStockItem bucket. Postgres treats
 * NULL as distinct from NULL in a unique index, so the multi-column
 * @@unique on BinStockItem does not dedupe the common untracked case
 * (lot/serial/transit fields all null) — this joined string does, and is the
 * key every upsert into BinStockItem must use.
 * @param fields - Parameter for computeBinStockItemBucketKey.
 * @returns Result from computeBinStockItemBucketKey.
 */
export function computeBinStockItemBucketKey(fields: BinStockItemBucketFields): string {
  return [
    fields.binId,
    fields.itemId,
    fields.lotId ?? '',
    fields.serialNumberId ?? '',
    fields.status,
    fields.transitDeviceId ?? '',
    fields.transitTrolleyId ?? ''
  ].join(':')
}

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

/**
 * upsertAvailableStockItem.
 * Atomically inserts or merges into the AVAILABLE bucket for
 * (bin, item, lot, serial) via a real DB upsert keyed on the compound unique
 * constraint — two concurrent calls into a brand-new bucket now correctly
 * merge quantities instead of racing on create().
 * @param tx - Parameter for upsertAvailableStockItem.
 * @param args - Parameter for upsertAvailableStockItem.
 * @returns Result from upsertAvailableStockItem.
 */
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
  const lotId = args.lotId ?? null
  const serialNumberId = args.serialNumberId ?? null
  const bucketKey = computeBinStockItemBucketKey({
    binId: args.binId,
    itemId: args.itemId,
    lotId,
    serialNumberId,
    status: 'AVAILABLE',
    transitDeviceId: null,
    transitTrolleyId: null
  })

  return tx.binStockItem.upsert({
    where: { bucketKey },
    update: {
      quantityAvailable: { increment: args.quantity },
      name: args.name,
      sku: args.sku,
      lastOperationBoeId: args.boeId,
      status: 'AVAILABLE',
      transitDeviceId: null
    },
    create: {
      warehouseId: args.warehouseId,
      name: args.name,
      sku: args.sku,
      binId: args.binId,
      itemId: args.itemId,
      lotId,
      serialNumberId,
      bucketKey,
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

/**
 * decrementOrDeleteStockItem.
 * Atomically decrements quantityAvailable via a guarded conditional UPDATE
 * (the `gte` check is re-evaluated against the DB's current value at write
 * time, not a value read earlier), then deletes the row if it landed at zero
 * or below. Throws INSUFFICIENT_STOCK rather than silently going negative or
 * clobbering a concurrent decrement.
 * @param tx - Parameter for decrementOrDeleteStockItem.
 * @param stockItemId - Parameter for decrementOrDeleteStockItem.
 * @param quantity - Parameter for decrementOrDeleteStockItem.
 * @param boeId - Parameter for decrementOrDeleteStockItem.
 * @returns Result from decrementOrDeleteStockItem.
 */
export async function decrementOrDeleteStockItem(
  tx: PrismaTypes.TransactionClient,
  stockItemId: string,
  quantity: number,
  boeId: string
) {
  const decremented = await tx.binStockItem.updateMany({
    where: { id: stockItemId, quantityAvailable: { gte: quantity } },
    data: { quantityAvailable: { decrement: quantity }, lastOperationBoeId: boeId }
  })

  if (decremented.count === 0) {
    const exists = await tx.binStockItem.findUnique({
      where: { id: stockItemId },
      select: { id: true }
    })
    if (!exists) {
      throw new DomainError('Stock item not found.', 'NOT_FOUND', 404)
    }

    throw new DomainError('Insufficient stock available.', 'INSUFFICIENT_STOCK', 409)
  }

  const row = await tx.binStockItem.findUnique({ where: { id: stockItemId } })
  if (row && row.quantityAvailable.lte(0)) {
    await tx.binStockItem.deleteMany({
      where: { id: row.id, quantityAvailable: row.quantityAvailable }
    })

    return null
  }

  return row
}
