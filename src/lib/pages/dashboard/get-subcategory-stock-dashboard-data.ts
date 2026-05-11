import type { PrismaClient } from '@/generated/prisma'

import { DomainError } from '@/lib/errors'
import type { SubcategoryStockDashboardDTO } from '@/types/subcategory-stock-dashboard.types'

function displayRound(n: number): number {
  return Math.round(n)
}

type ItemAgg = {
  available: number
  reserved: number
  blocked: number
}

function emptyAgg(): ItemAgg {
  return {
    available: 0,
    reserved: 0,
    blocked: 0
  }
}

export async function getSubcategoryStockDashboardData(
  prisma: PrismaClient,
  subcategoryCode: string
): Promise<SubcategoryStockDashboardDTO> {
  const trimmed = subcategoryCode.trim()
  if (trimmed === '') {
    throw new DomainError('Subcategory code is required.', 'VALIDATION_ERROR', 400)
  }

  const category = await prisma.itemCategory.findUnique({
    where: { code: trimmed },
    select: {
      code: true,
      name: true,
      iconUrl: true,
      parentCode: true,
      parent: { select: { code: true, name: true, iconUrl: true } }
    }
  })

  if (!category) {
    throw new DomainError('Category not found.', 'NOT_FOUND', 404)
  }

  if (!category.parentCode || !category.parent) {
    throw new DomainError(
      'This category has no parent — use the category stock overview for top-level categories.',
      'VALIDATION_ERROR',
      400
    )
  }

  const items = await prisma.item.findMany({
    where: { categoryId: trimmed, deletedAt: null },
    select: {
      id: true,
      sku: true,
      name: true,
      minQuantity: true,
      uom: true
    }
  })

  const itemIds = items.map((i) => i.id)

  const stockRows =
    itemIds.length === 0
      ? []
      : await prisma.binStockItem.findMany({
        where: { itemId: { in: itemIds } },
        select: {
          itemId: true,
          binId: true,
          quantityAvailable: true,
          quantityReserved: true,
          quantityBlocked: true
        }
      })

  const byItem = new Map<string, ItemAgg>()
  const binIds = new Set<string>()

  for (const row of stockRows) {
    binIds.add(row.binId)
    const agg = byItem.get(row.itemId) ?? emptyAgg()
    const a = row.quantityAvailable.toNumber()
    const r = row.quantityReserved.toNumber()
    const b = row.quantityBlocked.toNumber()

    agg.available += a
    agg.reserved += r
    agg.blocked += b
    byItem.set(row.itemId, agg)
  }

  let totalAvailable = 0
  let totalReserved = 0
  let totalBlocked = 0

  for (const item of items) {
    const agg = byItem.get(item.id) ?? emptyAgg()
    totalAvailable += agg.available
    totalReserved += agg.reserved
    totalBlocked += agg.blocked
  }

  const itemRows = items
    .map((item) => {
      const agg = byItem.get(item.id) ?? emptyAgg()
      const minQ = item.minQuantity.toNumber()
      const available = displayRound(agg.available)
      const reserved = displayRound(agg.reserved)
      const blocked = displayRound(agg.blocked)
      const onHand = displayRound(agg.available + agg.reserved + agg.blocked)

      return {
        itemId: item.id,
        sku: item.sku,
        name: item.name,
        uom: item.uom,
        minQuantity: displayRound(minQ),
        available,
        reserved,
        blocked,
        onHand,
        isLowStock: agg.available + agg.reserved + agg.blocked < minQ,
        href: `/dashboard/stock/items/${item.id}`
      }
    })
    .sort((a, b) => b.onHand - a.onHand)

  const availabilityDonut: SubcategoryStockDashboardDTO['availabilityDonut'] = []
  const availQ = displayRound(totalAvailable)
  const resQ = displayRound(totalReserved)
  const blkQ = displayRound(totalBlocked)

  if (availQ > 0) {
    availabilityDonut.push({ bucket: 'AVAILABLE', quantity: availQ })
  }

  if (resQ > 0) {
    availabilityDonut.push({ bucket: 'RESERVED', quantity: resQ })
  }

  if (blkQ > 0) {
    availabilityDonut.push({ bucket: 'BLOCKED', quantity: blkQ })
  }

  let availabilityOverTime: SubcategoryStockDashboardDTO['availabilityOverTime'] = []

  if (itemIds.length > 0) {
    const ledgerRows = await prisma.itemLedgerEntry.findMany({
      where: { warItemId: { in: itemIds } },
      orderBy: [{ createdAt: 'asc' }, { id: 'asc' }],
      take: 12000,
      select: {
        createdAt: true,
        quantityDelta: true
      }
    })

    let running = 0
    const byDay = new Map<string, number>()

    for (const row of ledgerRows) {
      running += row.quantityDelta.toNumber()
      const day = row.createdAt.toISOString().slice(0, 10)
      byDay.set(day, running)
    }

    availabilityOverTime = [...byDay.entries()]
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([date, totalUnits]) => ({
        date,
        totalUnits: displayRound(totalUnits)
      }))
  }

  const currentTotal = displayRound(totalAvailable + totalReserved + totalBlocked)

  if (availabilityOverTime.length === 0 && currentTotal > 0) {
    const today = new Date().toISOString().slice(0, 10)
    availabilityOverTime = [{ date: today, totalUnits: currentTotal }]
  } else if (availabilityOverTime.length > 0) {
    const today = new Date().toISOString().slice(0, 10)
    const last = availabilityOverTime[availabilityOverTime.length - 1]

    if (last.date !== today) {
      availabilityOverTime = [...availabilityOverTime, { date: today, totalUnits: currentTotal }]
    } else {
      availabilityOverTime = [
        ...availabilityOverTime.slice(0, -1),
        { date: today, totalUnits: currentTotal }
      ]
    }
  }

  const orderKeySet = new Set<string>()

  if (itemIds.length > 0) {
    const [poGroups, soGroups, toGroups, roGroups, adjGroups] = await Promise.all([
      prisma.purchaseOrderLine.groupBy({
        by: ['purchaseOrderId'],
        where: { itemId: { in: itemIds } }
      }),
      prisma.salesOrderLine.groupBy({
        by: ['salesOrderId'],
        where: { itemId: { in: itemIds } }
      }),
      prisma.transferOrderLine.groupBy({
        by: ['transferOrderId'],
        where: { itemId: { in: itemIds } }
      }),
      prisma.returnOrderLine.groupBy({
        by: ['returnOrderId'],
        where: { itemId: { in: itemIds } }
      }),
      prisma.adjustmentOrderLine.groupBy({
        by: ['adjustmentOrderId'],
        where: { itemId: { in: itemIds } }
      })
    ])

    for (const row of poGroups) {
      orderKeySet.add(`PURCHASE:${row.purchaseOrderId}`)
    }
    for (const row of soGroups) {
      orderKeySet.add(`SALES:${row.salesOrderId}`)
    }
    for (const row of toGroups) {
      orderKeySet.add(`TRANSFER:${row.transferOrderId}`)
    }
    for (const row of roGroups) {
      orderKeySet.add(`RETURN:${row.returnOrderId}`)
    }
    for (const row of adjGroups) {
      orderKeySet.add(`ADJUSTMENT:${row.adjustmentOrderId}`)
    }
  }

  const lowStockCount = itemRows.filter((r) => r.isLowStock).length

  const boeRows =
    itemIds.length === 0
      ? []
      : await prisma.binOperationEntry.findMany({
        where: { warItemId: { in: itemIds } },
        orderBy: { createdAt: 'desc' },
        take: 160,
        select: {
          id: true,
          createdAt: true,
          type: true,
          quantity: true,
          warItemId: true,
          user: { select: { fullName: true } },
          warehouse: { select: { name: true } }
        }
      })

  const itemSkuById = new Map(items.map((i) => [i.id, i.sku]))

  const activities = boeRows.map((row) => ({
    id: row.id,
    createdAt: row.createdAt.toISOString(),
    operationType: row.type,
    quantity: row.quantity.toNumber(),
    itemSku: itemSkuById.get(row.warItemId) ?? '—',
    userName: row.user.fullName ?? '—',
    warehouseName: row.warehouse.name
  }))

  const parentHref = `/dashboard/stock/categories/${encodeURIComponent(category.parent.code)}`

  return {
    header: {
      title: category.name,
      subtitle: 'Subcategory stock dashboard'
    },
    breadcrumbs: [
      { label: 'Stock', href: '/dashboard/stock' },
      { label: 'Categories', href: '/dashboard/stock/categories' },
      { label: category.parent.name, href: parentHref },
      {
        label: category.name,
        href: `/dashboard/stock/subcategory/${encodeURIComponent(category.code)}`
      }
    ],
    parent: {
      code: category.parent.code,
      name: category.parent.name,
      href: parentHref,
      iconUrl: category.parent.iconUrl ?? null
    },
    subcategory: {
      code: category.code,
      name: category.name,
      iconUrl: category.iconUrl ?? null
    },
    kpis: {
      totalOnHand: displayRound(totalAvailable + totalReserved + totalBlocked),
      totalAvailable: displayRound(totalAvailable),
      totalReserved: displayRound(totalReserved),
      totalBlocked: displayRound(totalBlocked),
      occupiedBins: binIds.size,
      ordersUsingItems: orderKeySet.size,
      lowStockItemsCount: lowStockCount
    },
    availabilityDonut,
    availabilityOverTime,
    items: itemRows,
    activities
  }
}
