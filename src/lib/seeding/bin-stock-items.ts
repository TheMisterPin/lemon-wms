import { type Prisma, type PrismaClient } from '@/generated/prisma'

const STOCKED_BIN_LIMIT = 120
const ITEMS_PER_BIN = 4

function getUomByItemIndex(itemIndex: number): 'PZ' | 'KGS' | 'MT' {
  const cycle: Array<'PZ' | 'KGS' | 'MT'> = ['PZ', 'KGS', 'MT']

  return cycle[itemIndex % cycle.length]
}

export async function seedBinStockItems(prisma: PrismaClient) {
  const [bins, items] = await Promise.all([
    prisma.bin.findMany({
      where: { deletedAt: null },
      select: { id: true, warehouseId: true },
      orderBy: { id: 'asc' },
      take: STOCKED_BIN_LIMIT
    }),
    prisma.item.findMany({
      select: { id: true },
      orderBy: { id: 'asc' },
      take: STOCKED_BIN_LIMIT * ITEMS_PER_BIN
    })
  ])

  if (bins.length === 0 || items.length === 0) {
    return { count: 0 }
  }

  const stockItems: Prisma.BinStockItemCreateManyInput[] = []

  bins.forEach((bin, binIndex) => {
    for (let slot = 0; slot < ITEMS_PER_BIN; slot += 1) {
      const itemIndex = (binIndex * ITEMS_PER_BIN + slot) % items.length
      const availableQuantity = ((binIndex + 1) * (slot + 2)) % 40 + 1
      const reservedQuantity = slot % 2 === 0 ? slot + 1 : 0
      const blockedQuantity = slot === ITEMS_PER_BIN - 1 ? 1 : 0

      stockItems.push({
        id: `BSI-${String(binIndex + 1).padStart(4, '0')}-${String(slot + 1).padStart(2, '0')}`,
        warehouseId: bin.warehouseId,
        binId: bin.id,
        itemId: items[itemIndex].id,
        description: `Seeded stock for ${bin.id}`,
        quantityAvailable: availableQuantity,
        quantityReserved: reservedQuantity,
        quantityBlocked: blockedQuantity,
        uom: getUomByItemIndex(itemIndex)
      })
    }
  })

  await prisma.binStockItem.createMany({
    data: stockItems,
    skipDuplicates: true
  })

  return { count: stockItems.length }
}
