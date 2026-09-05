import { describe, expect, it } from 'vitest'

import { Prisma } from '@/generated/prisma'
import type { Prisma as PrismaTypes } from '@/generated/prisma'
import {
  decrementOrDeleteStockItem,
  updateBinCapacityBy,
  upsertAvailableStockItem
} from '@/lib/stock/stock-mutations'

/**
 * These fakes model the atomic guarded-write semantics of the real Postgres
 * statements they stand in for (a conditional `UPDATE ... WHERE ... AND
 * quantity >= X`, an `INSERT ... ON CONFLICT DO UPDATE`, a raw clamp-and-add
 * UPDATE) by performing their check-then-write synchronously, with no
 * `await` in between. Because `Promise.all` invokes each concurrent call's
 * body synchronously up to its first `await`, this reproduces the same
 * interleaving a real DB transaction boundary would: whichever call's
 * synchronous write lands first is immediately visible to the next call's
 * synchronous check, so a naive read-then-write bug (reading stale state
 * before either write commits) cannot hide behind these fakes the way it
 * could behind a real DB's own concurrency — and correspondingly, this repo's
 * atomic rewrites are what makes these tests pass at all.
 */

describe('decrementOrDeleteStockItem concurrency', () => {
  it('lets only one of two concurrent decrements succeed when stock is insufficient for both', async () => {
    let row: { id: string; quantityAvailable: InstanceType<typeof Prisma.Decimal> } | null = {
      id: 'bsi-1',
      quantityAvailable: new Prisma.Decimal(5)
    }

    const tx = {
      binStockItem: {
        updateMany: ({
          where,
          data
        }: {
          where: { id: string; quantityAvailable: { gte: number } }
          data: { quantityAvailable: { decrement: number } }
        }) => {
          if (!row || row.id !== where.id || row.quantityAvailable.lt(where.quantityAvailable.gte)) {
            return Promise.resolve({ count: 0 })
          }
          row = { ...row, quantityAvailable: row.quantityAvailable.sub(data.quantityAvailable.decrement) }

          return Promise.resolve({ count: 1 })
        },
        findUnique: ({ where }: { where: { id: string } }) =>
          Promise.resolve(row && row.id === where.id ? { ...row } : null),
        deleteMany: ({ where }: { where: { id: string; quantityAvailable: unknown } }) => {
          if (row && row.id === where.id) {
            row = null

            return Promise.resolve({ count: 1 })
          }

          return Promise.resolve({ count: 0 })
        }
      }
    } as unknown as PrismaTypes.TransactionClient

    const results = await Promise.allSettled([
      decrementOrDeleteStockItem(tx, 'bsi-1', 3, 'boe-a'),
      decrementOrDeleteStockItem(tx, 'bsi-1', 3, 'boe-b')
    ])

    const fulfilled = results.filter((r) => r.status === 'fulfilled')
    const rejected = results.filter((r) => r.status === 'rejected')

    expect(fulfilled).toHaveLength(1)
    expect(rejected).toHaveLength(1)
    expect((rejected[0] as PromiseRejectedResult).reason).toMatchObject({
      code: 'INSUFFICIENT_STOCK',
      status: 409
    })

    // Exactly one decrement landed — never negative, never double-applied.
    expect(row).not.toBeNull()
    expect((row as { quantityAvailable: InstanceType<typeof Prisma.Decimal> }).quantityAvailable.toNumber()).toBe(2)
  })
})

describe('upsertAvailableStockItem concurrency', () => {
  it('merges two concurrent inserts into the same brand-new bucket instead of creating duplicates', async () => {
    const rows = new Map<string, Record<string, unknown>>()

    const tx = {
      binStockItem: {
        upsert: ({
          where,
          update,
          create
        }: {
          where: { bucketKey: string }
          update: { quantityAvailable: { increment: number } }
          create: Record<string, unknown> & { quantityAvailable: InstanceType<typeof Prisma.Decimal> }
        }) => {
          const existing = rows.get(where.bucketKey)
          if (existing) {
            const current = existing.quantityAvailable as InstanceType<typeof Prisma.Decimal>
            existing.quantityAvailable = current.add(update.quantityAvailable.increment)

            return Promise.resolve({ ...existing })
          }
          rows.set(where.bucketKey, { ...create })

          return Promise.resolve({ ...create })
        }
      }
    } as unknown as PrismaTypes.TransactionClient

    const baseArgs = {
      warehouseId: 'wh-1',
      binId: 'bin-1',
      itemId: 'item-1',
      name: 'Widget',
      sku: 'W-1',
      uom: 'EA',
      boeId: 'boe-x'
    }

    await Promise.all([
      upsertAvailableStockItem(tx, { ...baseArgs, quantity: 4 }),
      upsertAvailableStockItem(tx, { ...baseArgs, quantity: 6 })
    ])

    expect(rows.size).toBe(1)
    const [row] = [...rows.values()]
    expect((row.quantityAvailable as InstanceType<typeof Prisma.Decimal>).toNumber()).toBe(10)
  })
})

describe('updateBinCapacityBy concurrency', () => {
  it('applies concurrent capacity deltas cumulatively via one atomic statement each', async () => {
    let capacity = 2

    const tx = {
      $executeRaw: (..._args: [TemplateStringsArray, number, string]) => {
        const [, delta] = _args
        capacity = Math.max(0, capacity + delta)

        return Promise.resolve(1)
      }
    } as unknown as PrismaTypes.TransactionClient

    await Promise.all([updateBinCapacityBy(tx, 'bin-1', -1), updateBinCapacityBy(tx, 'bin-1', -1)])

    // Both decrements landed (2 - 1 - 1 = 0), not just one of them.
    expect(capacity).toBe(0)
  })
})
