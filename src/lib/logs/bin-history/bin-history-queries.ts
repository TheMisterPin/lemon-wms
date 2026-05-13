import { Prisma, type PrismaClient } from '@/generated/prisma'

import type { BinFillOverTimePoint } from '@/types/bin-detail-dashboard.types'

function decimalToNum(value: Prisma.Decimal | null | undefined): number {
  if (value === null || value === undefined) {
    return 0
  }

  const n = value.toNumber()

  return Number.isFinite(n) ? n : 0
}

/**
 * Line-chart points from `BinHistory` (daily snapshots). `quantityOnHand` is stored as
 * total physical units (available + reserved + blocked) at snapshot time.
 */
export async function getBinFillTimelineFromBinHistory(
  prisma: PrismaClient,
  binId: string,
  maxCapacity: number | null,
  opts?: { currentUnitsHint?: number }
): Promise<BinFillOverTimePoint[]> {
  const rows = await prisma.binHistory.findMany({
    where: { binId },
    select: {
      date: true,
      quantityOnHand: true
    },
    orderBy: { date: 'asc' }
  })

  const max = maxCapacity !== null && maxCapacity > 0 ? maxCapacity : null
  const fallbackUnits = opts?.currentUnitsHint

  const toPoint = (occurredAt: string, unitsOnHand: number): BinFillOverTimePoint => {
    const capped = Number.isFinite(unitsOnHand) ? Math.max(0, unitsOnHand) : 0

    return {
      occurredAt,
      unitsOnHand: capped,
      fillPercent: max === null ? null : Math.min(100, Math.round((capped / max) * 100))
    }
  }

  if (rows.length === 0) {
    const units = fallbackUnits !== undefined ? Math.max(0, fallbackUnits) : 0

    return [toPoint(new Date().toISOString(), units)]
  }

  const points = rows.map((row) => toPoint(row.date.toISOString(), decimalToNum(row.quantityOnHand)))

  if (
    fallbackUnits !== undefined &&
    Math.abs(points[points.length - 1].unitsOnHand - fallbackUnits) > 0.0001
  ) {
    points.push(toPoint(new Date().toISOString(), fallbackUnits))
  }

  return points
}

/**
 * Daily sum of `quantityOnHand` across multiple bins (BinHistory), for category/subcategory dashboards.
 * Same point shape as {@link getBinFillTimelineFromBinHistory}; `fillPercent` is always `null`.
 */
export async function getBinsAggregatedFillTimelineFromBinHistory(
  prisma: PrismaClient,
  binIds: string[],
  opts?: { currentUnitsHint?: number }
): Promise<BinFillOverTimePoint[]> {
  const fallbackUnits = opts?.currentUnitsHint

  const toPoint = (occurredAt: string, unitsOnHand: number): BinFillOverTimePoint => {
    const capped = Number.isFinite(unitsOnHand) ? Math.max(0, Math.round(unitsOnHand)) : 0

    return {
      occurredAt,
      unitsOnHand: capped,
      fillPercent: null
    }
  }

  if (binIds.length === 0) {
    const units = fallbackUnits !== undefined ? Math.max(0, fallbackUnits) : 0

    return [toPoint(new Date().toISOString(), units)]
  }

  const rows = await prisma.binHistory.findMany({
    where: { binId: { in: binIds } },
    select: {
      date: true,
      quantityOnHand: true
    },
    orderBy: { date: 'asc' }
  })

  const sumByDay = new Map<string, number>()

  for (const row of rows) {
    const day = row.date.toISOString().slice(0, 10)
    const q = decimalToNum(row.quantityOnHand)
    sumByDay.set(day, (sumByDay.get(day) ?? 0) + q)
  }

  if (sumByDay.size === 0) {
    const units = fallbackUnits !== undefined ? Math.max(0, fallbackUnits) : 0

    return [toPoint(new Date().toISOString(), units)]
  }

  const sortedDays = [...sumByDay.keys()].sort((a, b) => a.localeCompare(b))
  const points: BinFillOverTimePoint[] = sortedDays.map((day) =>
    toPoint(new Date(`${day}T12:00:00.000Z`).toISOString(), sumByDay.get(day) ?? 0)
  )

  if (
    fallbackUnits !== undefined
    && Math.abs(points[points.length - 1].unitsOnHand - fallbackUnits) > 0.0001
  ) {
    points.push(toPoint(new Date().toISOString(), fallbackUnits))
  }

  return points
}
