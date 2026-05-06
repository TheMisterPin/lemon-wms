import type { PrismaClient } from '@/generated/prisma'

import { DomainError } from '@/lib/errors'
import type {
  StockDashboardCategoryRow,
  StockDashboardData,
  StockDashboardItemRow,
  StockDashboardSubcategoryGroup,
  StockDashboardSubcategoryRow
} from '@/types/stock-dashboard.types'

type CategoryRollup = {
  key: string
  label: string
  totalAvailable: number
  totalReserved: number
  totalBlocked: number
  totalOnHand: number
}

type SubAgg = {
  name: string
  available: number
  reserved: number
  blocked: number
  onHand: number
}

function roundQty(n: number): number {
  return Math.round(n * 10000) / 10000
}

function displayRound(n: number): number {
  return Math.round(n)
}

async function getStockDashboard(
  prisma: PrismaClient,
  warehouseId: string | null
): Promise<StockDashboardData> {
  if (warehouseId !== null) {
    const warehouse = await prisma.warehouse.findFirst({
      where: { id: warehouseId, deletedAt: null },
      select: { id: true }
    })
    if (!warehouse) {
      throw new DomainError('Warehouse not found.', 'NOT_FOUND', 404)
    }
  }

  const rows = await prisma.binStockItem.findMany({
    where:
      warehouseId === null
        ? {}
        : {
          bin: {
            warehouseId
          }
        },
    select: {
      itemId: true,
      uom: true,
      quantityAvailable: true,
      quantityReserved: true,
      quantityBlocked: true,
      bin: { select: { id: true } },
      item: {
        select: {
          id: true,
          sku: true,
          name: true,
          category: {
            select: {
              code: true,
              name: true,
              parentCode: true,
              parent: { select: { code: true, name: true } }
            }
          }
        }
      }
    }
  })

  type Normalized = {
    itemId: string
    sku: string
    name: string
    uom: string
    binId: string
    available: number
    reserved: number
    blocked: number
    onHand: number
    parentKey: string
    parentLabel: string
    categoryKey: string
    categoryLabel: string
  }

  const normalized: Normalized[] = rows.map((row) => {
    const available = row.quantityAvailable.toNumber()
    const reserved = row.quantityReserved.toNumber()
    const blocked = row.quantityBlocked.toNumber()
    const onHand = roundQty(available + reserved + blocked)
    const cat = row.item.category
    const categoryKey = cat?.code ?? '__none__'
    const categoryLabel = cat?.name ?? 'Uncategorized'

    const parent = cat?.parent
    const parentKey = parent?.code ?? categoryKey
    const parentLabel = parent?.name ?? categoryLabel

    return {
      itemId: row.item.id,
      sku: row.item.sku,
      name: row.item.name,
      uom: row.uom,
      binId: row.bin.id,
      available: roundQty(available),
      reserved: roundQty(reserved),
      blocked: roundQty(blocked),
      onHand,
      parentKey,
      parentLabel,
      categoryKey,
      categoryLabel
    }
  })

  const occupiedBinIds = new Set<string>()
  let totalAvailable = 0
  let totalReserved = 0
  let totalBlocked = 0
  let totalOnHand = 0

  const categoryMap = new Map<string, CategoryRollup>()
  const subByParent = new Map<string, Map<string, SubAgg>>()

  type ItemAgg = {
    itemId: string
    sku: string
    name: string
    uom: string
    binIds: Set<string>
    totalAvailable: number
    totalReserved: number
    totalBlocked: number
    totalOnHand: number
  }

  const itemMap = new Map<string, ItemAgg>()

  for (const row of normalized) {
    if (row.onHand > 0) {
      occupiedBinIds.add(row.binId)
    }

    totalAvailable += row.available
    totalReserved += row.reserved
    totalBlocked += row.blocked
    totalOnHand += row.onHand

    const cr = categoryMap.get(row.parentKey) ?? {
      key: row.parentKey,
      label: row.parentLabel,
      totalAvailable: 0,
      totalReserved: 0,
      totalBlocked: 0,
      totalOnHand: 0
    }
    cr.totalAvailable += row.available
    cr.totalReserved += row.reserved
    cr.totalBlocked += row.blocked
    cr.totalOnHand += row.onHand
    categoryMap.set(row.parentKey, cr)

    let subMap = subByParent.get(row.parentKey)
    if (!subMap) {
      subMap = new Map<string, SubAgg>()
      subByParent.set(row.parentKey, subMap)
    }

    const sub = subMap.get(row.categoryKey) ?? {
      name: row.categoryLabel,
      available: 0,
      reserved: 0,
      blocked: 0,
      onHand: 0
    }
    sub.available += row.available
    sub.reserved += row.reserved
    sub.blocked += row.blocked
    sub.onHand += row.onHand
    subMap.set(row.categoryKey, sub)

    const item = itemMap.get(row.itemId) ?? {
      itemId: row.itemId,
      sku: row.sku,
      name: row.name,
      uom: row.uom,
      binIds: new Set<string>(),
      totalAvailable: 0,
      totalReserved: 0,
      totalBlocked: 0,
      totalOnHand: 0
    }

    item.binIds.add(row.binId)
    item.totalAvailable += row.available
    item.totalReserved += row.reserved
    item.totalBlocked += row.blocked
    item.totalOnHand += row.onHand
    itemMap.set(row.itemId, item)
  }

  const items: StockDashboardItemRow[] = Array.from(itemMap.values())
    .map(
      (item): StockDashboardItemRow => ({
        itemId: item.itemId,
        sku: item.sku,
        name: item.name,
        uom: item.uom,
        binsCount: item.binIds.size,
        totalAvailable: displayRound(item.totalAvailable),
        totalReserved: displayRound(item.totalReserved),
        totalBlocked: displayRound(item.totalBlocked),
        totalOnHand: displayRound(item.totalOnHand)
      })
    )
    .sort((a, b) => b.totalOnHand - a.totalOnHand)

  const categories: StockDashboardCategoryRow[] = Array.from(categoryMap.values())
    .map((c): StockDashboardCategoryRow => ({
      key: c.key,
      label: c.label,
      totalAvailable: displayRound(c.totalAvailable),
      totalReserved: displayRound(c.totalReserved),
      totalBlocked: displayRound(c.totalBlocked),
      totalOnHand: displayRound(c.totalOnHand)
    }))
    .sort((a, b) => b.totalOnHand - a.totalOnHand)

  const subcategoryGroups: StockDashboardSubcategoryGroup[] = categories.map((cat) => {
    const subMap = subByParent.get(cat.key) ?? new Map<string, SubAgg>()
    const subRows: StockDashboardSubcategoryRow[] = Array.from(subMap.values())
      .map((s) => ({
        name: s.name,
        onHand: displayRound(s.onHand),
        available: displayRound(s.available),
        reserved: displayRound(s.reserved),
        blocked: displayRound(s.blocked)
      }))
      .sort((a, b) => b.onHand - a.onHand)

    return {
      parentKey: cat.key,
      parentLabel: cat.label,
      rows: subRows
    }
  })

  return {
    warehouseId,
    distinctSkus: items.length,
    occupiedBins: occupiedBinIds.size,
    totalOnHand: displayRound(totalOnHand),
    totalAvailable: displayRound(totalAvailable),
    totalReserved: displayRound(totalReserved),
    totalBlocked: displayRound(totalBlocked),
    categories,
    subcategoryGroups,
    items
  }
}

export { getStockDashboard }
