import { Prisma, type PrismaClient } from '@/generated/prisma'

import { logAppError } from '@/lib/logs/app-logger'

/** Normalized calendar day at 00:00:00.000 UTC (used as `BinHistory.date`). */
export function utcCalendarDayStart(reference: Date): Date {
  return new Date(
    Date.UTC(reference.getUTCFullYear(), reference.getUTCMonth(), reference.getUTCDate(), 0, 0, 0, 0)
  )
}

export type SyncTodaysBinHistoryResult = {
  inserted: number
}

/**
 * One row per bin per UTC calendar day: total physical units in `quantityOnHand`
 * (available + reserved + blocked), with reserved/blocked split for reporting.
 * Skips bins that already have a row for `date = today (UTC)`.
 */
export async function syncTodaysBinHistorySnapshots(
  prisma: PrismaClient
): Promise<SyncTodaysBinHistoryResult> {
  const today = utcCalendarDayStart(new Date())

  const aggregates = await prisma.binStockItem.groupBy({
    by: ['binId'],
    where: {
      bin: { deletedAt: null }
    },
    _sum: {
      quantityAvailable: true,
      quantityReserved: true,
      quantityBlocked: true
    }
  })

  if (aggregates.length === 0) {
    return { inserted: 0 }
  }

  const binIds = aggregates.map((row) => row.binId)

  const already = await prisma.binHistory.findMany({
    where: {
      date: today,
      binId: { in: binIds }
    },
    select: { binId: true }
  })

  const seen = new Set(already.map((row) => row.binId))
  const zero = new Prisma.Decimal(0)

  const toCreate: Array<{
    binId: string
    date: Date
    quantityOnHand: Prisma.Decimal
    quantityReserved: Prisma.Decimal
    quantityBlocked: Prisma.Decimal
  }> = []

  for (const agg of aggregates) {
    if (seen.has(agg.binId)) {
      continue
    }

    const av = agg._sum.quantityAvailable ?? zero
    const res = agg._sum.quantityReserved ?? zero
    const blk = agg._sum.quantityBlocked ?? zero
    const total = av.plus(res).plus(blk)

    toCreate.push({
      binId: agg.binId,
      date: today,
      quantityOnHand: total,
      quantityReserved: res,
      quantityBlocked: blk
    })
  }

  if (toCreate.length === 0) {
    return { inserted: 0 }
  }

  await prisma.binHistory.createMany({ data: toCreate })

  return { inserted: toCreate.length }
}

/**
 * Runs {@link syncTodaysBinHistorySnapshots} after auth success; failures never block login.
 */
export async function syncTodaysBinHistorySnapshotsAfterLogin(prisma: PrismaClient): Promise<void> {
  try {
    await syncTodaysBinHistorySnapshots(prisma)
  } catch (error) {
    logAppError('[syncTodaysBinHistorySnapshotsAfterLogin]', error)
  }
}
