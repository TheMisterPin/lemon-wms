import { format, formatDistanceToNow } from 'date-fns'

import type {
  WarehouseActivityRow,
  WarehouseOrderTypeRow,
  WarehouseStockCategoryRow,
  WarehouseZoneSummaryRow
} from '@/components/features/locations/warehouses/components/warehouse-overview-types'
import type { PrismaClient } from '@/generated/prisma'
import { OrderStatus, Prisma, ReceiptStatus } from '@/generated/prisma'

import { DomainError } from '@/lib/errors'
import type {
  WarehouseOverviewDashboardData,
  WarehouseOverviewDashboardKpiRow
} from '@/types/warehouse-overview-dashboard.types'

const DONUT_PALETTE = ['#22c55e', '#3b82f6', '#a855f7', '#f97316', '#eab308', '#ec4899', '#06b6d4', '#8b5cf6']

function warehouseDisplayCode(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  if (parts.length >= 2) {
    return `${parts[0].slice(0, 3).toUpperCase()}-${parts[parts.length - 1].slice(0, 2).toUpperCase()}`
  }

  return name.slice(0, 8).toUpperCase().replace(/\s+/g, '-')
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

function statusBucketTotals(counts: Partial<Record<OrderStatus, number>>): Pick<
WarehouseOrderTypeRow,
'exceptions' | 'released' | 'assigned' | 'active' | 'paused' | 'completed'
> {
  const released = counts.RELEASED ?? 0
  const assigned = counts.CONFIRMED ?? 0
  const active = counts.EXECUTING ?? 0
  const paused = counts.PAUSED ?? 0
  const exceptions = counts.EXECUTED_WITH_PROBLEMS ?? 0
  const completed = (counts.EXECUTED ?? 0) + (counts.SIGNED_OFF ?? 0)

  return {
    released,
    assigned,
    active,
    paused,
    completed,
    exceptions
  }
}

function humanizeAction(actionType: string): string {
  return actionType
    .replace(/_/g, ' ')
    .toLowerCase()
    .replace(/^\w/, (ch) => ch.toUpperCase())
}

function activityStatus(actionType: string): WarehouseActivityRow['status'] {
  const upper = actionType.toUpperCase()
  if (upper.includes('EXCEPTION') || upper.includes('FAILED') || upper.includes('BLOCK')) {
    return 'FAILED'
  }
  if (upper.includes('WARNING') || upper.includes('PAUSE') || upper.includes('REJECT')) {
    return 'WARNING'
  }

  return 'SUCCESS'
}

type GetWarehouseOverviewDashboardOptions = {
  /**
   * `parent` rolls item subcategory stock into the root category for the donut (items without `parent` stay as their own slice).
   * `leaf` keeps the item’s direct category (legacy behavior).
   */
  stockCategoriesGranularity?: 'parent' | 'leaf'
}

async function getWarehouseOverviewDashboardData(
  prisma: PrismaClient,
  warehouseId: string,
  options?: GetWarehouseOverviewDashboardOptions
): Promise<WarehouseOverviewDashboardData> {
  const stockCategoriesGranularity = options?.stockCategoriesGranularity ?? 'parent'
  const warehouse = await prisma.warehouse.findFirst({
    where: { id: warehouseId, deletedAt: null },
    select: { id: true, name: true }
  })

  if (!warehouse) {
    throw new DomainError('Warehouse not found.', 'NOT_FOUND', 404)
  }

  const [
    devicesTotal,
    devicesAuthorizedActive,
    latestUae,
    purchaseRows,
    salesRows,
    transferRows,
    adjustRows,
    stockSums,
    binLines,
    uaeRecent,
    warehouseAssignments,
    receiptsProblem,
    zonesRaw,
    stocksForZones
  ] = await Promise.all([
    prisma.device.count({
      where: { warehouseId, isActive: true }
    }),
    prisma.device.count({
      where: { warehouseId, isActive: true, authorized: true }
    }),
    prisma.userActivityEntry.findFirst({
      where: { warehouseId },
      orderBy: { createdAt: 'desc' },
      select: { createdAt: true }
    }),
    prisma.purchaseOrder.groupBy({
      by: ['status'],
      where: {
        warehouseId,
        deletedAt: null,
        status: { notIn: [OrderStatus.DRAFT, OrderStatus.CANCELLED] }
      },
      _count: { _all: true }
    }),
    prisma.salesOrder.groupBy({
      by: ['status'],
      where: {
        warehouseId,
        deletedAt: null,
        status: { notIn: [OrderStatus.DRAFT, OrderStatus.CANCELLED] }
      },
      _count: { _all: true }
    }),
    prisma.transferOrder.groupBy({
      by: ['status'],
      where: {
        warehouseId,
        deletedAt: null,
        status: { notIn: [OrderStatus.DRAFT, OrderStatus.CANCELLED] }
      },
      _count: { _all: true }
    }),
    prisma.adjustmentOrder.groupBy({
      by: ['status'],
      where: {
        warehouseId,
        deletedAt: null,
        status: { notIn: [OrderStatus.DRAFT, OrderStatus.CANCELLED] }
      },
      _count: { _all: true }
    }),
    prisma.binStockItem.aggregate({
      where: { warehouseId },
      _sum: {
        quantityAvailable: true,
        quantityReserved: true,
        quantityBlocked: true
      }
    }),
    prisma.bin.findMany({
      where: {
        warehouseId,
        deletedAt: null
      },
      select: {
        maxCapacity: true,
        currentCapacity: true,
        zoneId: true
      }
    }),
    prisma.userActivityEntry.findMany({
      where: { warehouseId },
      orderBy: { createdAt: 'desc' },
      take: 20,
      include: {
        user: {
          select: { fullName: true }
        }
      }
    }),
    prisma.warehouseAssignment.findMany({
      where: { warehouseId },
      distinct: ['userId'],
      select: { userId: true }
    }),
    prisma.purchaseOrderReceipt.count({
      where: {
        warehouseId,
        deletedAt: null,
        status: ReceiptStatus.COMPLETED_WITH_PROBLEMS
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
          select: {
            maxCapacity: true,
            currentCapacity: true
          }
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
        bin: {
          select: {
            zoneId: true
          }
        }
      }
    })
  ])

  const assigneeIds = warehouseAssignments.map((r) => r.userId)
  const assigneeCount = assigneeIds.length
  const assigneesLoggedIn =
    assigneeIds.length === 0
      ? 0
      : await prisma.user.count({
        where: {
          id: { in: assigneeIds },
          deletedAt: null,
          isLoggedIn: true
        }
      })

  const bucketFromGroup = (
    rows: { status: OrderStatus; _count: { _all: number } }[]
  ): Partial<Record<OrderStatus, number>> => {
    const map: Partial<Record<OrderStatus, number>> = {}
    for (const row of rows) {
      map[row.status] = row._count._all
    }

    return map
  }

  const purchaseBuckets = statusBucketTotals(bucketFromGroup(purchaseRows))
  const salesBuckets = statusBucketTotals(bucketFromGroup(salesRows))
  const transferBuckets = statusBucketTotals(bucketFromGroup(transferRows))
  const adjustBuckets = statusBucketTotals(bucketFromGroup(adjustRows))

  const orderTypes: WarehouseOrderTypeRow[] = [
    { type: 'Sales Orders', ...salesBuckets },
    { type: 'Purchase Orders', ...purchaseBuckets },
    { type: 'Transfer Orders', ...transferBuckets },
    { type: 'Adjustment Orders', ...adjustBuckets }
  ]

  const orderCount =
    (Object.values(bucketFromGroup(purchaseRows)).reduce((a, b) => a + b, 0))
    + (Object.values(bucketFromGroup(salesRows)).reduce((a, b) => a + b, 0))
    + (Object.values(bucketFromGroup(transferRows)).reduce((a, b) => a + b, 0))
    + (Object.values(bucketFromGroup(adjustRows)).reduce((a, b) => a + b, 0))

  const activeOrders =
    (bucketFromGroup(purchaseRows).EXECUTING ?? 0)
    + (bucketFromGroup(salesRows).EXECUTING ?? 0)
    + (bucketFromGroup(transferRows).EXECUTING ?? 0)
    + (bucketFromGroup(adjustRows).EXECUTING ?? 0)

  const releasedOrders =
    (bucketFromGroup(purchaseRows).RELEASED ?? 0)
    + (bucketFromGroup(salesRows).RELEASED ?? 0)
    + (bucketFromGroup(transferRows).RELEASED ?? 0)
    + (bucketFromGroup(adjustRows).RELEASED ?? 0)

  const pausedOrders =
    (bucketFromGroup(purchaseRows).PAUSED ?? 0)
    + (bucketFromGroup(salesRows).PAUSED ?? 0)
    + (bucketFromGroup(transferRows).PAUSED ?? 0)
    + (bucketFromGroup(adjustRows).PAUSED ?? 0)

  const exceptionOrders =
    (bucketFromGroup(purchaseRows).EXECUTED_WITH_PROBLEMS ?? 0)
    + (bucketFromGroup(salesRows).EXECUTED_WITH_PROBLEMS ?? 0)
    + (bucketFromGroup(transferRows).EXECUTED_WITH_PROBLEMS ?? 0)
    + (bucketFromGroup(adjustRows).EXECUTED_WITH_PROBLEMS ?? 0)

  const qtyAvailable = decimalToNum(stockSums._sum.quantityAvailable)
  const qtyReserved = decimalToNum(stockSums._sum.quantityReserved)
  const qtyBlocked = decimalToNum(stockSums._sum.quantityBlocked)
  const qtyOnHandTotal = qtyAvailable + qtyReserved + qtyBlocked

  const categoryLines = await prisma.binStockItem.findMany({
    where: { warehouseId },
    select: {
      quantityAvailable: true,
      quantityReserved: true,
      quantityBlocked: true,
      item: {
        select: {
          category: {
            select: {
              code: true,
              name: true,
              parentCode: true,
              parent: {
                select: {
                  code: true,
                  name: true
                }
              }
            }
          }
        }
      }
    }
  })

  type CatAgg = { label: string; available: Prisma.Decimal; reserved: Prisma.Decimal; blocked: Prisma.Decimal }
  const catMap = new Map<string, CatAgg>()

  for (const line of categoryLines) {
    const cat = line.item.category
    let code: string
    let label: string

    if (!cat) {
      code = 'UNCATEGORIZED'
      label = 'Uncategorized'
    } else if (stockCategoriesGranularity === 'leaf') {
      code = cat.code
      label = cat.name
    } else {
      const parent = cat.parent
      if (parent) {
        code = parent.code
        label = parent.name
      } else {
        code = cat.code
        label = cat.name
      }
    }
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

  const categoryRowsSorted = [...catMap.entries()].map(([, v]) => v).sort(
    (a, b) => {
      const totalA = a.available.plus(a.reserved).plus(a.blocked).toNumber()
      const totalB = b.available.plus(b.reserved).plus(b.blocked).toNumber()

      return totalB - totalA
    }
  )

  const TOP_CATEGORIES = 5
  const top = categoryRowsSorted.slice(0, TOP_CATEGORIES)
  const rest = categoryRowsSorted.slice(TOP_CATEGORIES)

  let otherAvailable = new Prisma.Decimal(0)
  let otherReserved = new Prisma.Decimal(0)
  let otherBlocked = new Prisma.Decimal(0)
  for (const row of rest) {
    otherAvailable = sumDecimal(otherAvailable, row.available)
    otherReserved = sumDecimal(otherReserved, row.reserved)
    otherBlocked = sumDecimal(otherBlocked, row.blocked)
  }

  const withOther: WarehouseStockCategoryRow[] = [...top.map((row, idx) => {
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
  })]

  if (
    rest.length > 0
    && (
      decimalToNum(otherAvailable)
      + decimalToNum(otherReserved)
      + decimalToNum(otherBlocked)
      > 0
    )
  ) {
    withOther.push({
      label: 'Other',
      totalOnHand:
        Math.round(
          decimalToNum(otherAvailable) + decimalToNum(otherReserved) + decimalToNum(otherBlocked)
        ),
      available: Math.round(decimalToNum(otherAvailable)),
      reserved: Math.round(decimalToNum(otherReserved)),
      blocked: Math.round(decimalToNum(otherBlocked)),
      color: DONUT_PALETTE[withOther.length % DONUT_PALETTE.length]
    })
  }

  const stockCategories: WarehouseStockCategoryRow[] = withOther.length > 0
    ? withOther
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

  const fillsForAvg = binLines.map((bin) => {
    const max = bin.maxCapacity?.toNumber() ?? null
    const cur = bin.currentCapacity?.toNumber() ?? null

    return max !== null && max > 0 && cur !== null
      ? Math.min(100, Math.round((cur / max) * 100))
      : 0
  })

  const warehouseFillPct =
    fillsForAvg.length > 0
      ? Math.round(fillsForAvg.reduce((acc, x) => acc + x, 0) / fillsForAvg.length)
      : 0

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

  const zonesDetailed: WarehouseZoneSummaryRow[] = zonesRaw.map((zone) => {
    const qty = zoneAgg.get(zone.id)
    const available = qty ? decimalToNum(qty.available) : 0
    const reserved = qty ? decimalToNum(qty.reserved) : 0
    const blocked = qty ? decimalToNum(qty.blocked) : 0
    const onHand = available + reserved + blocked

    const binFills = zone.bins.map((bin) => {
      const max = bin.maxCapacity?.toNumber() ?? null
      const cur = bin.currentCapacity?.toNumber() ?? null

      return max !== null && max > 0 && cur !== null
        ? Math.min(100, Math.round((cur / max) * 100))
        : 0
    })

    const fill =
      binFills.length > 0
        ? Math.round(binFills.reduce((a, b) => a + b, 0) / binFills.length)
        : 0

    return {
      id: zone.id,
      name: zone.name,
      type: String(zone.type),
      onHand,
      available,
      reserved,
      blocked,
      fill
    }
  }).sort((a, b) => b.onHand - a.onHand)

  const zones = zonesDetailed

  const activity: WarehouseActivityRow[] = uaeRecent.map((entry) => ({
    id: entry.id,
    time: format(entry.createdAt, 'HH:mm'),
    user: entry.user.fullName,
    action: humanizeAction(entry.actionType),
    entity: `${entry.entityType} ${entry.entityId}`,
    status: activityStatus(entry.actionType)
  }))

  const devicesPendingAuth = Math.max(0, devicesTotal - devicesAuthorizedActive)

  const kpis: WarehouseOverviewDashboardKpiRow[] = [
    {
      label: 'Devices',
      value: `${devicesAuthorizedActive} / ${devicesTotal}`,
      helper:
        `${devicesAuthorizedActive} authorized · ${devicesPendingAuth} pending authorization`,
      tone: devicesPendingAuth > 0 ? 'warning' : 'success'
    },
    {
      label: 'Users',
      value: `${assigneesLoggedIn} / ${assigneeCount}`,
      helper:
        assigneeCount === 0
          ? 'No users assigned to this warehouse'
          : `${assigneesLoggedIn} logged in · ${Math.max(
            assigneeCount - assigneesLoggedIn,
            0
          )} offline`,
      tone: 'success'
    },
    {
      label: 'Orders',
      value: String(orderCount),
      helper:
        `${activeOrders} active · ${releasedOrders} released · ${pausedOrders} paused`,
      tone: 'neutral'
    },
    {
      label: 'Stock on hand',
      value: qtyOnHandTotal.toLocaleString(),
      helper:
        `${Math.round(qtyAvailable).toLocaleString()} available · ${Math.round(
          qtyReserved
        ).toLocaleString()} reserved`,
      tone: 'success'
    },
    {
      label: 'Exceptions',
      value: String(exceptionOrders + receiptsProblem),
      helper:
        `${exceptionOrders} order problems · ${receiptsProblem} receipt completions with issues`,
      tone: exceptionOrders + receiptsProblem > 0 ? 'danger' : 'neutral'
    },
    {
      label: 'Warehouse fill',
      value: `${warehouseFillPct}%`,
      helper:
        totalBinsCounted === 0
          ? 'No bins configured'
          : `${occupiedBins} bins with utilization · ${totalBinsCounted} total bins`,
      tone: warehouseFillPct >= 85 ? 'warning' : warehouseFillPct >= 70 ? 'success' : 'neutral'
    }
  ]

  return {
    warehouse: {
      id: warehouse.id,
      name: warehouse.name,
      code: warehouseDisplayCode(warehouse.name),
      lastActivityRelative:
        latestUae === null ? null : formatDistanceToNow(latestUae.createdAt, { addSuffix: true })
    },
    kpis,
    orderTypes,
    stockCategories,
    zones,
    activity
  }
}

export { getWarehouseOverviewDashboardData }
