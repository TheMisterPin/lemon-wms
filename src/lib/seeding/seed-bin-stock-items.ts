import { BinItemStatus, type Prisma, type PrismaClient } from '@/generated/prisma'

const TOTAL_BIN_STOCK_RECORDS = 10_000

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

  const targetPerBin = Math.floor(TOTAL_BIN_STOCK_RECORDS / bins.length)
  const targetRemainder = TOTAL_BIN_STOCK_RECORDS % bins.length

  if (items.length < targetPerBin + (targetRemainder > 0 ? 1 : 0)) {
    throw new Error(
      `Not enough unique items (${items.length}) to seed ${TOTAL_BIN_STOCK_RECORDS} records across ${bins.length} bins.`
    )
  }

  const stockItems: Prisma.BinStockItemCreateManyInput[] = []
  let globalRecordIndex = 1

  bins.forEach((bin, binIndex) => {
    const recordsForBin = targetPerBin + (binIndex < targetRemainder ? 1 : 0)
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

  if (stockItems.length !== TOTAL_BIN_STOCK_RECORDS) {
    throw new Error(
      `Expected ${TOTAL_BIN_STOCK_RECORDS} bin stock records, generated ${stockItems.length}.`
    )
  }

  await prisma.binStockItem.createMany({
    data: stockItems,
    skipDuplicates: true
  })

  return { count: stockItems.length }
}
