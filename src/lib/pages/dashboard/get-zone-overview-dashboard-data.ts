import { format } from 'date-fns'

import type { PrismaClient } from '@/generated/prisma'
import { Prisma } from '@/generated/prisma'

import { DomainError } from '@/lib/errors'
import type {
  ZoneOverviewActivityRow,
  ZoneOverviewBinRow,
  ZoneOverviewDashboardData,
  ZoneOverviewFillBucketRow,
  ZoneOverviewStockCategoryRow
} from '@/types/zone-overview-dashboard.types'

const DONUT_PALETTE = ['#22c55e', '#3b82f6', '#a855f7', '#f97316', '#eab308', '#ec4899', '#06b6d4', '#8b5cf6']

const TOP_CATEGORIES = 5
const ACTIVITY_TAKE = 20

function decimalToNum(value: Prisma.Decimal | null | undefined): number {
  if (value === null || value === undefined) {
    return 0
  }

  const n = value.toNumber()

  return Number.isFinite(n) ? n : 0
}

function sumDecimal(a: Prisma.Decimal, b: Prisma.Decimal | null | undefined): Prisma.Decimal {
  return a.plus(b ?? new Prisma.Decimal(0))
}

function binCapacityFillPercent(bin: {
  maxCapacity: Prisma.Decimal | null
  currentCapacity: Prisma.Decimal | null
}): number {
  const max = bin.maxCapacity?.toNumber() ?? null
  const cur = bin.currentCapacity?.toNumber() ?? null
  if (max === null || max <= 0 || cur === null) {
    return 0
  }

  return Math.min(100, Math.round((cur / max) * 100))
}

function humanizeAction(actionType: string): string {
  return actionType
    .replace(/_/g, ' ')
    .toLowerCase()
    .replace(/^\w/, (ch) => ch.toUpperCase())
}

function activityStatus(actionType: string): ZoneOverviewActivityRow['status'] {
  const upper = actionType.toUpperCase()
  if (upper.includes('EXCEPTION') || upper.includes('FAILED') || upper.includes('BLOCK')) {
    return 'FAILED'
  }
  if (upper.includes('WARNING') || upper.includes('PAUSE') || upper.includes('REJECT')) {
    return 'WARNING'
  }

  return 'SUCCESS'
}

function bucketLabelForFill(pct: number): '0-25%' | '26-50%' | '51-75%' | '76-100%' {
  if (pct <= 25) {
    return '0-25%'
  }
  if (pct <= 50) {
    return '26-50%'
  }
  if (pct <= 75) {
    return '51-75%'
  }

  return '76-100%'
}

async function getZoneOverviewDashboardData(
  prisma: PrismaClient,
  zoneId: string
): Promise<ZoneOverviewDashboardData> {
  const zone = await prisma.zone.findFirst({
    where: { id: zoneId, deletedAt: null },
    select: {
      id: true,
      name: true,
      type: true,
      isActive: true,
      warehouseId: true,
      warehouse: { select: { id: true, name: true } }
    }
  })

  if (!zone) {
    throw new DomainError('Zone not found.', 'NOT_FOUND', 404)
  }

  const bins = await prisma.bin.findMany({
    where: { zoneId: zone.id, deletedAt: null },
    select: {
      id: true,
      code: true,
      type: true,
      isBlocked: true,
      maxCapacity: true,
      currentCapacity: true
    },
    orderBy: { code: 'asc' }
  })

  const binIds = bins.map((b) => b.id)

  const stockRows =
    binIds.length === 0
      ? []
      : await prisma.binStockItem.findMany({
        where: { binId: { in: binIds } },
        select: {
          binId: true,
          quantityAvailable: true,
          quantityReserved: true,
          quantityBlocked: true,
          itemId: true,
          item: {
            select: {
              category: { select: { code: true, name: true } }
            }
          }
        }
      })

  type BinAgg = {
    available: Prisma.Decimal
    reserved: Prisma.Decimal
    blocked: Prisma.Decimal
    itemIds: Set<string>
  }

  const perBin = new Map<string, BinAgg>()

  for (const row of stockRows) {
    const existing = perBin.get(row.binId) ?? {
      available: new Prisma.Decimal(0),
      reserved: new Prisma.Decimal(0),
      blocked: new Prisma.Decimal(0),
      itemIds: new Set<string>()
    }

    existing.itemIds.add(row.itemId)
    existing.available = sumDecimal(existing.available, row.quantityAvailable)
    existing.reserved = sumDecimal(existing.reserved, row.quantityReserved)
    existing.blocked = sumDecimal(existing.blocked, row.quantityBlocked)
    perBin.set(row.binId, existing)
  }

  const binsTotal = bins.length
  let binsBlocked = 0
  let binsEmpty = 0
  let binsOccupied = 0
  const fillBuckets: Record<'0-25%' | '26-50%' | '51-75%' | '76-100%', number> = {
    '0-25%': 0,
    '26-50%': 0,
    '51-75%': 0,
    '76-100%': 0
  }

  let fillSumForAvg = 0
  let fillCountForAvg = 0

  for (const b of bins) {
    const agg = perBin.get(b.id)
    const onHand =
      agg === undefined
        ? 0
        : decimalToNum(agg.available)
        + decimalToNum(agg.reserved)
        + decimalToNum(agg.blocked)

    const capacityFill = binCapacityFillPercent(b)

    if (b.isBlocked) {
      binsBlocked += 1
    }

    const isInactiveSlot = onHand <= 0 && capacityFill <= 0
    if (!b.isBlocked && isInactiveSlot) {
      binsEmpty += 1
    }

    if (!isInactiveSlot) {
      binsOccupied += 1
    }

    if (!b.isBlocked) {
      fillSumForAvg += capacityFill
      fillCountForAvg += 1
      fillBuckets[bucketLabelForFill(capacityFill)] += 1
    }
  }

  const fillDistribution: ZoneOverviewFillBucketRow[] = [
    { label: '0-25%', count: fillBuckets['0-25%'] },
    { label: '26-50%', count: fillBuckets['26-50%'] },
    { label: '51-75%', count: fillBuckets['51-75%'] },
    { label: '76-100%', count: fillBuckets['76-100%'] },
    { label: 'Blocked', count: binsBlocked }
  ]

  let qtyAvailable = new Prisma.Decimal(0)
  let qtyReserved = new Prisma.Decimal(0)
  let qtyBlocked = new Prisma.Decimal(0)

  type CatAgg = { label: string; available: Prisma.Decimal; reserved: Prisma.Decimal; blocked: Prisma.Decimal }
  const catMap = new Map<string, CatAgg>()

  for (const row of stockRows) {
    qtyAvailable = sumDecimal(qtyAvailable, row.quantityAvailable)
    qtyReserved = sumDecimal(qtyReserved, row.quantityReserved)
    qtyBlocked = sumDecimal(qtyBlocked, row.quantityBlocked)

    const code = row.item.category?.code ?? 'UNCATEGORIZED'
    const label = row.item.category?.name ?? 'Uncategorized'
    const existing = catMap.get(code) ?? {
      label,
      available: new Prisma.Decimal(0),
      reserved: new Prisma.Decimal(0),
      blocked: new Prisma.Decimal(0)
    }

    catMap.set(code, {
      label,
      available: sumDecimal(existing.available, row.quantityAvailable),
      reserved: sumDecimal(existing.reserved, row.quantityReserved),
      blocked: sumDecimal(existing.blocked, row.quantityBlocked)
    })
  }

  const qtyOnHandTotal =
    decimalToNum(qtyAvailable)
    + decimalToNum(qtyReserved)
    + decimalToNum(qtyBlocked)

  const categorySorted = [...catMap.values()].sort((a, b) => {
    const tA = a.available.plus(a.reserved).plus(a.blocked).toNumber()
    const tB = b.available.plus(b.reserved).plus(b.blocked).toNumber()

    return tB - tA
  })

  const top = categorySorted.slice(0, TOP_CATEGORIES)
  const rest = categorySorted.slice(TOP_CATEGORIES)

  let otherA = new Prisma.Decimal(0)
  let otherR = new Prisma.Decimal(0)
  let otherB = new Prisma.Decimal(0)
  for (const row of rest) {
    otherA = sumDecimal(otherA, row.available)
    otherR = sumDecimal(otherR, row.reserved)
    otherB = sumDecimal(otherB, row.blocked)
  }

  const buildCat = (row: CatAgg, idx: number): ZoneOverviewStockCategoryRow => {
    const totalOnHand =
      decimalToNum(row.available) + decimalToNum(row.reserved) + decimalToNum(row.blocked)

    return {
      label: row.label,
      totalOnHand: Math.round(totalOnHand),
      available: Math.round(decimalToNum(row.available)),
      reserved: Math.round(decimalToNum(row.reserved)),
      blocked: Math.round(decimalToNum(row.blocked)),
      color: DONUT_PALETTE[idx % DONUT_PALETTE.length]
    }
  }

  const categoryMix: ZoneOverviewStockCategoryRow[] = top.map((row, idx) => buildCat(row, idx))

  if (
    rest.length > 0
    && decimalToNum(otherA) + decimalToNum(otherR) + decimalToNum(otherB) > 0
  ) {
    categoryMix.push(
      buildCat(
        {
          label: 'Other',
          available: otherA,
          reserved: otherR,
          blocked: otherB
        },
        categoryMix.length
      )
    )
  }

  const categoryMixFinal =
    categoryMix.length > 0
      ? categoryMix
      : [
        {
          label: 'None',
          totalOnHand: 0,
          available: 0,
          reserved: 0,
          blocked: 0,
          color: DONUT_PALETTE[0]
        }
      ]

  const fillPercent =
    fillCountForAvg > 0 ? Math.round(fillSumForAvg / fillCountForAvg) : 0

  const zoneBins: ZoneOverviewBinRow[] = bins.map((b) => {
    const agg = perBin.get(b.id)
    const available = agg ? Math.round(decimalToNum(agg.available)) : 0
    const reserved = agg ? Math.round(decimalToNum(agg.reserved)) : 0
    const blocked = agg ? Math.round(decimalToNum(agg.blocked)) : 0
    const onHand = available + reserved + blocked
    const fillPercentRow = binCapacityFillPercent(b)

    let rowStatus: ZoneOverviewBinRow['rowStatus'] = 'AVAILABLE'
    if (b.isBlocked) {
      rowStatus = 'BLOCKED'
    } else if (onHand <= 0 && fillPercentRow <= 0) {
      rowStatus = 'EMPTY'
    } else if (fillPercentRow >= 90 || (onHand > 0 && fillPercentRow >= 85)) {
      rowStatus = 'FULL'
    }

    return {
      binId: b.id,
      code: b.code,
      binType: String(b.type),
      fillPercent: fillPercentRow,
      distinctItems: agg?.itemIds.size ?? 0,
      available,
      reserved,
      blocked,
      rowStatus
    }
  })

  const binCodeById = new Map(bins.map((b) => [b.id, b.code]))

  const uaeRows =
    binIds.length === 0
      ? []
      : await prisma.userActivityEntry.findMany({
        where: {
          warehouseId: zone.warehouseId,
          entityType: 'Bin',
          entityId: { in: binIds }
        },
        orderBy: { createdAt: 'desc' },
        take: ACTIVITY_TAKE,
        include: {
          user: { select: { fullName: true } }
        }
      })

  const activity: ZoneOverviewActivityRow[] = uaeRows.map((entry) => ({
    id: entry.id,
    time: format(entry.createdAt, 'HH:mm'),
    user: entry.user.fullName,
    action: humanizeAction(entry.actionType),
    entity:
      entry.entityType === 'Bin'
        ? `Bin ${binCodeById.get(entry.entityId) ?? entry.entityId}`
        : `${entry.entityType} ${entry.entityId}`,
    status: activityStatus(entry.actionType)
  }))

  const headerSubtitle = zone.isActive
    ? `${zone.warehouse.name} · ${String(zone.type)} zone`
    : `${zone.warehouse.name} · inactive zone`

  return {
    zone: {
      id: zone.id,
      name: zone.name,
      type: String(zone.type),
      isActive: zone.isActive,
      warehouseId: zone.warehouseId,
      warehouseName: zone.warehouse.name
    },
    headerSubtitle,
    metrics: {
      binsTotal,
      binsOccupied,
      binsBlocked,
      binsEmpty,
      qtyOnHandTotal: Math.round(qtyOnHandTotal),
      qtyAvailable: Math.round(decimalToNum(qtyAvailable)),
      qtyReserved: Math.round(decimalToNum(qtyReserved)),
      qtyBlocked: Math.round(decimalToNum(qtyBlocked)),
      fillPercent
    },
    fillDistribution,
    categoryMix: categoryMixFinal,
    bins: zoneBins,
    activity
  }
}

export { getZoneOverviewDashboardData }
