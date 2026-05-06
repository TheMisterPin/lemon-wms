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
