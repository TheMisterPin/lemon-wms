import { type PrismaClient } from '@/generated/prisma'

const HISTORY_SPAN_DAYS = 60

/** Same count for every stocked bin (dashboard activity / demo trail). */
const OPS_PER_BIN = 20

function toPositiveNumber(value: unknown): number {
  if (typeof value === 'number') {
    return value > 0 ? value : 0
  }

  if (value && typeof value === 'object' && 'toNumber' in value) {
    const numberValue = (value as { toNumber: () => number }).toNumber()

    return numberValue > 0 ? numberValue : 0
  }

  return 0
}

/**
 * seedBinOperations.
 * Seeds alternating RECEIVE (into bin) / PICK (out of bin) `BinOperationEntry` rows per stocked bin.
 */
export async function seedBinOperations(prisma: PrismaClient) {
  const [users, bins, stockItems] = await Promise.all([
    prisma.user.findMany({
      where: { isActive: true },
      select: { id: true },
      orderBy: { createdAt: 'asc' }
    }),
    prisma.bin.findMany({
      where: { deletedAt: null },
      select: {
        id: true,
        warehouseId: true,
        zoneId: true
      },
      orderBy: { createdAt: 'asc' }
    }),
    prisma.binStockItem.findMany({
      where: {
        status: 'AVAILABLE',
        quantityAvailable: { gt: 0 }
      },
      select: {
        binId: true,
        itemId: true,
        uom: true,
        lotId: true,
        serialNumberId: true,
        quantityAvailable: true
      },
      orderBy: { createdAt: 'asc' }
    })
  ])

  if (users.length === 0 || bins.length === 0 || stockItems.length === 0) {
    return { count: 0 }
  }

  const binsById = new Map(bins.map((bin) => [bin.id, bin]))
  const stockByBin = new Map<string, typeof stockItems>()

  for (const stockItem of stockItems) {
    if (!binsById.has(stockItem.binId)) {
      continue
    }

    const current = stockByBin.get(stockItem.binId) ?? []
    current.push(stockItem)
    stockByBin.set(stockItem.binId, current)
  }

  const stockedBinIds = [...stockByBin.keys()].filter((id) => binsById.has(id))

  if (stockedBinIds.length === 0) {
    return { count: 0 }
  }

  const now = new Date()
  const startDate = new Date(now)
  startDate.setDate(startDate.getDate() - HISTORY_SPAN_DAYS)

  const rows: Array<{
    userId: string
    warehouseId: string
    zoneId: string
    type: 'RECEIVE' | 'PICK'
    fromBinId: string | null
    toBinId: string | null
    warItemId: string
    quantity: string
    uom: string
    lotId: string | null
    serialNumberId: string | null
    notes: string
    createdAt: Date
  }> = []

  let seq = 0

  stockedBinIds.forEach((binId, binIdx) => {
    const binMeta = binsById.get(binId)

    if (binMeta === undefined) {
      return
    }

    const items = stockByBin.get(binId)

    if (items === undefined || items.length === 0) {
      return
    }

    for (let i = 0; i < OPS_PER_BIN; i += 1) {
      const sourceItem = items[i % items.length]
      const user = users[i % users.length]
      const cap = Math.max(1, Math.floor(toPositiveNumber(sourceItem.quantityAvailable)))
      const qty = Math.max(1, Math.min(10, cap, (i % 8) + 1))

      const dayOffset = Math.min(
        HISTORY_SPAN_DAYS - 1,
        Math.floor((i * HISTORY_SPAN_DAYS) / OPS_PER_BIN) + ((binIdx + i) % 4)
      )

      const baseMs =
        startDate.getTime()
        + dayOffset * 86_400_000
        + (i % 24) * 3_600_000
        + binIdx * 79_993
        + seq * 1_739

      const createdAt = new Date(baseMs)
      seq += 1

      const rowBase = {
        userId: user.id,
        warehouseId: binMeta.warehouseId,
        zoneId: binMeta.zoneId,
        warItemId: sourceItem.itemId,
        quantity: String(qty),
        uom: sourceItem.uom,
        lotId: sourceItem.lotId,
        serialNumberId: sourceItem.serialNumberId
      }

      if (i % 2 === 0) {
        rows.push({
          ...rowBase,
          type: 'RECEIVE',
          fromBinId: null,
          toBinId: binId,
          notes: 'Seeded RECEIVE',
          createdAt
        })
      } else {
        rows.push({
          ...rowBase,
          type: 'PICK',
          fromBinId: binId,
          toBinId: null,
          notes: 'Seeded PICK',
          createdAt
        })
      }
    }
  })

  if (rows.length === 0) {
    return { count: 0 }
  }

  await prisma.binOperationEntry.createMany({ data: rows })

  return { count: rows.length }
}
