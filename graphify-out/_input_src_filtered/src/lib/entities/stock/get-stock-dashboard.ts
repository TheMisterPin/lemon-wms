import type { PrismaClient } from '@/generated/prisma'

type StockItemSummaryDTO = {
  itemId: string
  sku: string
  name: string
  uom: string
  binsCount: number
  totalAvailable: number
  totalReserved: number
  totalBlocked: number
  totalOnHand: number
}

type GetStockDashboardResponse = {
  distinctSkus: number
  occupiedBins: number
  totalOnHand: number
  totalAvailable: number
  totalReserved: number
  totalBlocked: number
  items: StockItemSummaryDTO[]
}

async function getStockDashboard(
  prisma: PrismaClient,
  warehouseId: string
): Promise<GetStockDashboardResponse> {
  const rows = await prisma.binStockItem.findMany({
    where: {
      bin: {
        warehouseId
      }
    },
    select: {
      itemId: true,
      uom: true,
      lotId: true,
      serialNumberId: true,
      quantityAvailable: true,
      quantityReserved: true,
      quantityBlocked: true,
      bin: {
        select: {
          id: true,
          name: true
        }
      },
      item: {
        select: {
          id: true,
          sku: true,
          name: true
        }
      }
    }
  })

  const normalized = rows.map(row => {
    const available = row.quantityAvailable.toNumber()
    const reserved = row.quantityReserved.toNumber()
    const blocked = row.quantityBlocked.toNumber()

    return {
      itemId: row.item.id,
      sku: row.item.sku,
      name: row.item.name,
      uom: row.uom,
      binId: row.bin.id,
      binName: row.bin.name,
      lotId: row.lotId,
      serialNumberId: row.serialNumberId,
      available,
      reserved,
      blocked,
      onHand: available + reserved + blocked
    }
  })

  const itemMap = new Map<string, {
    itemId: string
    sku: string
    name: string
    uom: string
    binIds: Set<string>
    totalAvailable: number
    totalReserved: number
    totalBlocked: number
    totalOnHand: number
  }>()

  const occupiedBinIds = new Set<string>()

  let totalAvailable = 0
  let totalReserved = 0
  let totalBlocked = 0
  let totalOnHand = 0

  for (const row of normalized) {
    if (row.onHand > 0) {
      occupiedBinIds.add(row.binId)
    }

    totalAvailable += row.available
    totalReserved += row.reserved
    totalBlocked += row.blocked
    totalOnHand += row.onHand

    if (!itemMap.has(row.itemId)) {
      itemMap.set(row.itemId, {
        itemId: row.itemId,
        sku: row.sku,
        name: row.name,
        uom: row.uom,
        binIds: new Set<string>(),
        totalAvailable: 0,
        totalReserved: 0,
        totalBlocked: 0,
        totalOnHand: 0
      })
    }

    const item = itemMap.get(row.itemId)!
    item.binIds.add(row.binId)
    item.totalAvailable += row.available
    item.totalReserved += row.reserved
    item.totalBlocked += row.blocked
    item.totalOnHand += row.onHand
  }

  const items: StockItemSummaryDTO[] = Array.from(itemMap.values()).map(item => ({
    itemId: item.itemId,
    sku: item.sku,
    name: item.name,
    uom: item.uom,
    binsCount: item.binIds.size,
    totalAvailable: item.totalAvailable,
    totalReserved: item.totalReserved,
    totalBlocked: item.totalBlocked,
    totalOnHand: item.totalOnHand
  }))

  return {
    distinctSkus: items.length,
    occupiedBins: occupiedBinIds.size,
    totalOnHand,
    totalAvailable,
    totalReserved,
    totalBlocked,
    items
  }
}

export { getStockDashboard }
