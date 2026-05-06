import { addDays } from 'date-fns'

import type { PrismaClient } from '@/generated/prisma'
import { Prisma, ZoneType } from '@/generated/prisma'

import { DomainError } from '@/lib/errors'
import type {
  WarehouseStockDashboardCategoryRow,
  WarehouseStockDashboardData,
  WarehouseStockDashboardItemRow,
  WarehouseStockDashboardKpiRow,
  WarehouseStockDashboardZoneRow
} from '@/types/warehouse-stock-dashboard.types'

const DONUT_PALETTE = ['#22c55e', '#3b82f6', '#a855f7', '#f97316', '#eab308', '#ec4899', '#06b6d4', '#8b5cf6']

const TOP_ITEMS = 30
const TOP_CATEGORIES = 5

function zoneDisplayCode(zone: { name: string }): string {
  const parts = zone.name.trim().split(/\s+/).filter(Boolean)
  if (parts.length >= 2) {
    return `${parts[0].slice(0, 3).toUpperCase()}-${parts[parts.length - 1].slice(0, 2).toUpperCase()}`
  }

  return zone.name.slice(0, 8).toUpperCase().replace(/\s+/g, '-')
}

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

async function getWarehouseStockDashboardData(
  prisma: PrismaClient,
  warehouseId: string
): Promise<WarehouseStockDashboardData> {
  const warehouse = await prisma.warehouse.findFirst({
    where: { id: warehouseId, deletedAt: null },
    select: { id: true, name: true }
  })

  if (!warehouse) {
    throw new DomainError('Warehouse not found.', 'NOT_FOUND', 404)
  }

  const now = new Date()
  const expiringCutoff = addDays(now, 30)

  const [
    stockSums,
    binLines,
    categoryLines,
    zonesRaw,
    stocksForZones,
    quarantineSums,
    expiringSoonCount,
    itemGroupSums
  ] = await Promise.all([
    prisma.binStockItem.aggregate({
      where: { warehouseId },
      _sum: {
        quantityAvailable: true,
        quantityReserved: true,
        quantityBlocked: true
      }
    }),
    prisma.bin.findMany({
      where: { warehouseId, deletedAt: null },
      select: {
        maxCapacity: true,
        currentCapacity: true,
        zoneId: true
      }
    }),
    prisma.binStockItem.findMany({
      where: { warehouseId },
      select: {
        quantityAvailable: true,
        quantityReserved: true,
        quantityBlocked: true,
        item: {
          select: {
            category: { select: { code: true, name: true } }
          }
        }
      }
    }),
    prisma.zone.findMany({
      where: { warehouseId, deletedAt: null },
      select: {
        id: true,
        name: true,
        type: true,
        bins: {
          where: { deletedAt: null },
          select: { maxCapacity: true, currentCapacity: true }
        }
      },
      orderBy: { createdAt: 'asc' }
    }),
    prisma.binStockItem.findMany({
      where: { warehouseId },
      select: {
        quantityAvailable: true,
        quantityReserved: true,
        quantityBlocked: true,
        bin: { select: { zoneId: true } }
      }
    }),
    prisma.binStockItem.aggregate({
      where: {
        warehouseId,
        bin: {
          deletedAt: null,
          zone: { type: ZoneType.QUARANTINE, deletedAt: null }
        }
      },
      _sum: {
        quantityAvailable: true,
        quantityReserved: true,
        quantityBlocked: true
      }
    }),
    prisma.binStockItem.count({
      where: {
        warehouseId,
        expiryDate: { not: null, gt: now, lte: expiringCutoff }
      }
    }),
    prisma.binStockItem.groupBy({
      by: ['itemId'],
      where: { warehouseId },
      _sum: {
        quantityAvailable: true,
        quantityReserved: true,
        quantityBlocked: true
      }
    })
  ])

  const qtyAvailable = decimalToNum(stockSums._sum.quantityAvailable)
  const qtyReserved = decimalToNum(stockSums._sum.quantityReserved)
  const qtyBlocked = decimalToNum(stockSums._sum.quantityBlocked)
  const qtyOnHandTotal = qtyAvailable + qtyReserved + qtyBlocked

  const quarantineOnHand =
    decimalToNum(quarantineSums._sum.quantityAvailable)
    + decimalToNum(quarantineSums._sum.quantityReserved)
    + decimalToNum(quarantineSums._sum.quantityBlocked)

  let occupiedBins = 0
  const totalBinsCounted = binLines.length
  for (const bin of binLines) {
    const max = bin.maxCapacity?.toNumber() ?? null
    const cur = bin.currentCapacity?.toNumber() ?? null
    const pct =
      max !== null && max > 0 && cur !== null
        ? Math.min(100, Math.round((cur / max) * 100))
        : 0
    if (pct > 0) {
      occupiedBins += 1
    }
  }

  const emptyBins = Math.max(0, totalBinsCounted - occupiedBins)

  type CatAgg = { label: string; available: Prisma.Decimal; reserved: Prisma.Decimal; blocked: Prisma.Decimal }
  const catMap = new Map<string, CatAgg>()

  for (const line of categoryLines) {
    const code = line.item.category?.code ?? 'UNCATEGORIZED'
    const label = line.item.category?.name ?? 'Uncategorized'
    const existing = catMap.get(code) ?? {
      label,
      available: new Prisma.Decimal(0),
      reserved: new Prisma.Decimal(0),
      blocked: new Prisma.Decimal(0)
    }

    catMap.set(code, {
      label,
      available: sumDecimal(existing.available, line.quantityAvailable),
      reserved: sumDecimal(existing.reserved, line.quantityReserved),
      blocked: sumDecimal(existing.blocked, line.quantityBlocked)
    })
  }

  const categoryRowsSorted = [...catMap.entries()].map(([, v]) => v).sort((a, b) => {
    const totalA = a.available.plus(a.reserved).plus(a.blocked).toNumber()
    const totalB = b.available.plus(b.reserved).plus(b.blocked).toNumber()

    return totalB - totalA
  })

  const topCategories = categoryRowsSorted.slice(0, TOP_CATEGORIES)
  const restCategories = categoryRowsSorted.slice(TOP_CATEGORIES)

  let otherAvailable = new Prisma.Decimal(0)
  let otherReserved = new Prisma.Decimal(0)
  let otherBlocked = new Prisma.Decimal(0)
  for (const row of restCategories) {
    otherAvailable = sumDecimal(otherAvailable, row.available)
    otherReserved = sumDecimal(otherReserved, row.reserved)
    otherBlocked = sumDecimal(otherBlocked, row.blocked)
  }

  const buildCategoryRow = (
    row: CatAgg,
    idx: number
  ): WarehouseStockDashboardCategoryRow => {
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

  const categoryDistribution: WarehouseStockDashboardCategoryRow[] = []

  topCategories.forEach((row, idx) => {
    categoryDistribution.push(buildCategoryRow(row, idx))
  })

  if (
    restCategories.length > 0
    && decimalToNum(otherAvailable) + decimalToNum(otherReserved) + decimalToNum(otherBlocked) > 0
  ) {
    categoryDistribution.push(
      buildCategoryRow(
        {
          label: 'Other',
          available: otherAvailable,
          reserved: otherReserved,
          blocked: otherBlocked
        },
        categoryDistribution.length
      )
    )
  }

  const categoryDistributionFinal: WarehouseStockDashboardCategoryRow[] =
    categoryDistribution.length > 0
      ? categoryDistribution
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

  const zoneAgg = new Map<
  string,
  { available: Prisma.Decimal; reserved: Prisma.Decimal; blocked: Prisma.Decimal }
  >()

  for (const row of stocksForZones) {
    const zid = row.bin.zoneId
    const agg = zoneAgg.get(zid) ?? {
      available: new Prisma.Decimal(0),
      reserved: new Prisma.Decimal(0),
      blocked: new Prisma.Decimal(0)
    }

    zoneAgg.set(zid, {
      available: sumDecimal(agg.available, row.quantityAvailable),
      reserved: sumDecimal(agg.reserved, row.quantityReserved),
      blocked: sumDecimal(agg.blocked, row.quantityBlocked)
    })
  }

  const zones: WarehouseStockDashboardZoneRow[] = zonesRaw
    .map((zone): WarehouseStockDashboardZoneRow => {
      const qty = zoneAgg.get(zone.id)
      const available = qty ? decimalToNum(qty.available) : 0
      const reserved = qty ? decimalToNum(qty.reserved) : 0
      const blocked = qty ? decimalToNum(qty.blocked) : 0
      const totalOnHand = available + reserved + blocked

      const binFills = zone.bins.map((bin) => {
        const max = bin.maxCapacity?.toNumber() ?? null
        const cur = bin.currentCapacity?.toNumber() ?? null

        return max !== null && max > 0 && cur !== null
          ? Math.min(100, Math.round((cur / max) * 100))
          : 0
      })

      const fillPercent =
        binFills.length > 0 ? Math.round(binFills.reduce((a, b) => a + b, 0) / binFills.length) : 0

      return {
        zoneId: zone.id,
        name: zone.name,
        code: zoneDisplayCode(zone),
        type: String(zone.type),
        totalOnHand: Math.round(totalOnHand),
        available: Math.round(available),
        reserved: Math.round(reserved),
        blocked: Math.round(blocked),
        fillPercent
      }
    })
    .sort((a, b) => b.totalOnHand - a.totalOnHand)

  type ItemTotals = {
    sumAvailable: Prisma.Decimal
    sumReserved: Prisma.Decimal
    sumBlocked: Prisma.Decimal
    itemId: string
  }

  const itemTotals: ItemTotals[] = itemGroupSums.map((g) => ({
    itemId: g.itemId,
    sumAvailable: g._sum.quantityAvailable ?? new Prisma.Decimal(0),
    sumReserved: g._sum.quantityReserved ?? new Prisma.Decimal(0),
    sumBlocked: g._sum.quantityBlocked ?? new Prisma.Decimal(0)
  }))

  itemTotals.sort((a, b) => {
    const tA =
      decimalToNum(a.sumAvailable)
      + decimalToNum(a.sumReserved)
      + decimalToNum(a.sumBlocked)
    const tB =
      decimalToNum(b.sumAvailable)
      + decimalToNum(b.sumReserved)
      + decimalToNum(b.sumBlocked)

    return tB - tA
  })

  const topItemIds = itemTotals.slice(0, TOP_ITEMS).map((x) => x.itemId)

  const binsPerItem = new Map<string, Set<string>>()
  if (topItemIds.length > 0) {
    const binPairsForTopItems = await prisma.binStockItem.findMany({
      where: { warehouseId, itemId: { in: topItemIds } },
      select: { itemId: true, binId: true }
    })

    for (const p of binPairsForTopItems) {
      let set = binsPerItem.get(p.itemId)
      if (!set) {
        set = new Set<string>()
        binsPerItem.set(p.itemId, set)
      }
      set.add(p.binId)
    }
  }

  const itemMasters =
    topItemIds.length === 0
      ? []
      : await prisma.item.findMany({
        where: { id: { in: topItemIds }, deletedAt: null },
        select: {
          id: true,
          sku: true,
          name: true,
          uom: true,
          category: { select: { name: true } }
        }
      })

  const itemMasterById = new Map(itemMasters.map((i) => [i.id, i]))

  const items: WarehouseStockDashboardItemRow[] = itemTotals.slice(0, TOP_ITEMS).map((row) => {
    const master = itemMasterById.get(row.itemId)
    const sku = master?.sku ?? '—'
    const name = master?.name ?? 'Unknown item'
    const categoryName = master?.category?.name ?? '—'
    const uom = master?.uom ?? '—'
    const binsCount = binsPerItem.get(row.itemId)?.size ?? 0
    const available = Math.round(decimalToNum(row.sumAvailable))
    const reserved = Math.round(decimalToNum(row.sumReserved))
    const blocked = Math.round(decimalToNum(row.sumBlocked))

    return {
      itemId: row.itemId,
      sku,
      name,
      categoryName,
      uom,
      totalOnHand: available + reserved + blocked,
      available,
      reserved,
      blocked,
      binsCount
    }
  })

  const kpis: WarehouseStockDashboardKpiRow[] = [
    {
      label: 'Total On Hand',
      value: Math.round(qtyOnHandTotal).toLocaleString(),
      helper:
        qtyOnHandTotal === 0
          ? 'No bin stock recorded for this warehouse yet'
          : 'Sum of available, reserved, and blocked quantities',
      tone: qtyOnHandTotal === 0 ? 'neutral' : 'neutral'
    },
    {
      label: 'Available',
      value: Math.round(qtyAvailable).toLocaleString(),
      helper: 'Sellable / pick-ready quantity',
      tone: 'success'
    },
    {
      label: 'Reserved',
      value: Math.round(qtyReserved).toLocaleString(),
      helper: 'Committed to open work, still physically in bins',
      tone: qtyReserved > 0 ? 'warning' : 'neutral'
    },
    {
      label: 'Blocked',
      value: Math.round(qtyBlocked).toLocaleString(),
      helper: 'Quarantine holds and blocked lines',
      tone: qtyBlocked > 0 ? 'danger' : 'neutral'
    },
    {
      label: 'Occupied Bins',
      value: occupiedBins.toLocaleString(),
      helper:
        totalBinsCounted === 0
          ? 'No bins configured'
          : `${occupiedBins.toLocaleString()} with capacity utilization · ${totalBinsCounted.toLocaleString()} total`,
      tone: occupiedBins > 0 ? 'success' : 'neutral'
    },
    {
      label: 'Empty Bins',
      value: emptyBins.toLocaleString(),
      helper:
        emptyBins === 0 && totalBinsCounted > 0
          ? 'All bins report some capacity use'
          : 'Bins reporting zero capacity utilization',
      tone: emptyBins > Math.max(Math.floor(totalBinsCounted * 0.4), 0) ? 'success' : 'neutral'
    },
    {
      label: 'Stock in Quarantine Zones',
      value: Math.round(quarantineOnHand).toLocaleString(),
      helper: 'Quantity located in QUARANTINE zone bins',
      tone: quarantineOnHand > 0 ? 'warning' : 'neutral'
    },
    {
      label: 'Expiring Soon',
      value: String(expiringSoonCount),
      helper: 'Lot lines with expiry within the next 30 days',
      tone: expiringSoonCount > 0 ? 'warning' : 'neutral'
    }
  ]

  const headerSubtitle =
    qtyOnHandTotal === 0
      ? `${warehouse.name} — no tracked stock balances yet`
      : `Available, reserved, blocked, and occupancy for ${warehouse.name}`

  return {
    warehouseId: warehouse.id,
    header: {
      title: `${warehouse.name} — Stock`,
      subtitle: headerSubtitle
    },
    kpis,
    categoryDistribution: categoryDistributionFinal,
    zones,
    items
  }
}

export { getWarehouseStockDashboardData }
