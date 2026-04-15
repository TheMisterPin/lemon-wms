import { BinItemStatus, type Prisma, type PrismaClient } from '@/generated/prisma'

const TOTAL_BIN_STOCK_RECORDS = 10_000
const MAX_ITEMS_PER_BIN = 100

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

export async function seedBinStockItems(prisma: PrismaClient) {
  const [bins, items] = await Promise.all([
    prisma.bin.findMany({
      where: { deletedAt: null },
      select: { id: true, warehouseId: true },
      orderBy: { id: 'asc' }
    }),
    prisma.item.findMany({
      select: { id: true, uom: true, name: true, sku: true },
      orderBy: { id: 'asc' }
    })
  ])

  if (bins.length === 0 || items.length === 0) {
    return { count: 0 }
  }

  const maxPossibleRecords = bins.length * MAX_ITEMS_PER_BIN
  const totalRecordsToGenerate = Math.min(TOTAL_BIN_STOCK_RECORDS, maxPossibleRecords)
  const maxUniqueItemsPerBin = Math.min(MAX_ITEMS_PER_BIN, items.length)

  const basePerBin = Math.floor(totalRecordsToGenerate / bins.length)
  const remainder = totalRecordsToGenerate % bins.length

  const stockItems: Prisma.BinStockItemCreateManyInput[] = []
  let globalRecordIndex = 1

  bins.forEach((bin, binIndex) => {
    const desiredRecordsForBin = basePerBin + (binIndex < remainder ? 1 : 0)
    const recordsForBin = Math.min(desiredRecordsForBin, maxUniqueItemsPerBin)

    const usedItemIndexes = new Set<number>()
    let itemCursor = (binIndex * 37) % items.length

    for (let slot = 0; slot < recordsForBin && usedItemIndexes.size < items.length; slot += 1) {
      while (usedItemIndexes.has(itemCursor)) {
        itemCursor = (itemCursor + 1) % items.length
      }

      usedItemIndexes.add(itemCursor)
      const item = items[itemCursor]
      itemCursor = (itemCursor + 17) % items.length

      const quantityType = randomInt(0, 2)
      const quantity = randomInt(1, 15)

      const quantityAvailable = quantityType === 0 ? quantity : 0
      const quantityReserved = quantityType === 1 ? quantity : 0
      const quantityBlocked = quantityType === 2 ? quantity : 0

      const status =
        quantityType === 0
          ? BinItemStatus.AVAILABLE
          : quantityType === 1
            ? BinItemStatus.RESERVED
            : BinItemStatus.BLOCKED

      stockItems.push({
        id: `BSI-${String(globalRecordIndex).padStart(6, '0')}`,
        warehouseId: bin.warehouseId,
        binId: bin.id,
        itemId: item.id,
        uom: item.uom,
        name: item.name,
        sku: item.sku,
        quantityAvailable,
        quantityReserved,
        quantityBlocked,
        status
      })

      globalRecordIndex += 1
    }
  })

  await prisma.binStockItem.createMany({
    data: stockItems,
    skipDuplicates: true
  })

  return {
    count: stockItems.length,
    requested: TOTAL_BIN_STOCK_RECORDS,
    generated: stockItems.length,
    cappedByMaxPerBin: MAX_ITEMS_PER_BIN
  }
}
