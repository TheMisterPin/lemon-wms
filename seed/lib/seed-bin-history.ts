import { Prisma, type PrismaClient } from '@/generated/prisma'

import { utcCalendarDayStart } from '@/lib/logs/bin-history/bin-history-helpers'

const HISTORY_DAYS = 60

/**
 * Per-bin keyed hash → stable 0–1 jitter for seeded diversity.
 */
function spread01(seed: number, binId: string, day: number): number {
  const n = binId.charCodeAt((seed + day + 11) % Math.max(binId.length, 1))
  let x = (seed * 97 + day * 31 + n) % 997

  x = ((x ^ (x >>> 5)) >>> 0) % 997

  return x / 996
}

/** True on some contiguous days so the fill line visibly hits zero. */
function inForcedEmptyGap(binSalt: number, day: number): boolean {
  const startA = ((binSalt * 3) % 9) + 6
  const startB = ((binSalt * 5) % 8) + 34
  const lenA = 3 + (binSalt % 3)
  const lenB = 4 + ((binSalt * 7) % 3)

  return (
    (day >= startA && day < startA + lenA)
    || (day >= startB && day < startB + lenB)
    || (day <= (binSalt % 5) && binSalt % 2 === 1)
  )
}

/**
 * Seeds `BinHistory` rows (one per stocked bin per calendar day, UTC).
 * Synthetic profile: soft start, sinusoidal swell, bursts at zero, dips and rebuilds —
 * purely for richer dashboard demos (not BOE-derived).
 */
export async function seedBinHistory(prisma: PrismaClient) {
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
    return { count: 0 }
  }

  const zero = new Prisma.Decimal(0)
  const todayStart = utcCalendarDayStart(new Date())

  const rows: Array<{
    binId: string
    date: Date
    quantityOnHand: Prisma.Decimal
    quantityReserved: Prisma.Decimal
    quantityBlocked: Prisma.Decimal
  }> = []

  for (let b = 0; b < aggregates.length; b += 1) {
    const agg = aggregates[b]
    const binSalt = ((agg.binId.charCodeAt(0) ?? 0) + b * 13) >>> 0

    const av = agg._sum.quantityAvailable ?? zero
    const res = agg._sum.quantityReserved ?? zero
    const blk = agg._sum.quantityBlocked ?? zero
    const baseTotal = av.plus(res).plus(blk)
    const baseNum = baseTotal.toNumber()

    for (let d = 0; d < HISTORY_DAYS; d += 1) {
      const daysAgo = HISTORY_DAYS - 1 - d
      const date = new Date(todayStart.getTime() - daysAgo * 86_400_000)
      const phase = (d + binSalt % 17) / HISTORY_DAYS
      const slow = (Math.sin(phase * Math.PI * 5 + binSalt * 0.07) + 1) / 2
      const coarse = (Math.cos((phase * Math.PI * 2.2 + b * 0.13) ** 2) + 1) / 2
      const jitter = spread01(binSalt + b, agg.binId, d)
      let intensity = Math.min(
        1.02,
        0.06 + slow * 0.58 + coarse * 0.28 + (jitter - 0.5) * 0.18 + Math.sin(d * (0.4 + binSalt % 3) / 7) * 0.06
      )

      intensity = intensity * (0.55 + (((d + binSalt) % 11) / 22))

      if (inForcedEmptyGap(binSalt % 31, d)) {
        intensity = 0
      }

      const totalNum = baseNum > 0 ? Math.max(0, baseNum * intensity) : 0

      const quantityOnHand =
        totalNum <= 1e-6
          ? zero
          : new Prisma.Decimal(Number(totalNum.toFixed(4)))

      let quantityReserved = zero
      let quantityBlocked = zero

      if (baseNum > 0 && totalNum > 1e-6 && !baseTotal.equals(zero)) {
        quantityReserved = res.mul(quantityOnHand).div(baseTotal).toDecimalPlaces(4)
        quantityBlocked = blk.mul(quantityOnHand).div(baseTotal).toDecimalPlaces(4)
      }

      rows.push({
        binId: agg.binId,
        date,
        quantityOnHand,
        quantityReserved,
        quantityBlocked
      })
    }
  }

  if (rows.length === 0) {
    return { count: 0 }
  }

  await prisma.binHistory.createMany({ data: rows })

  return { count: rows.length }
}
