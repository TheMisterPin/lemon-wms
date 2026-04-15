import { BinItemStatus, BinType, Prisma, type PrismaClient } from '@/generated/prisma'

const MAX_UNIQUE_ITEMS_PER_BIN = 12

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

function pickWeighted<T>(options: Array<{ value: T; weight: number }>): T {
  const totalWeight = options.reduce((sum, option) => sum + option.weight, 0)
  let roll = Math.random() * totalWeight

  for (const option of options) {
    roll -= option.weight
    if (roll <= 0) {
      return option.value
    }
  }

  return options[options.length - 1].value
}

function getFillRatioForBinType(binType: BinType): number {
  switch (binType) {
  case BinType.GENERAL:
    return pickWeighted([
      { value: 0, weight: 8 },
      { value: 1, weight: 12 },
      { value: randomInt(35, 85) / 100, weight: 80 }
    ])

  case BinType.RECEIVING:
    return pickWeighted([
      { value: 0, weight: 20 },
      { value: 1, weight: 5 },
      { value: randomInt(10, 45) / 100, weight: 60 },
      { value: randomInt(50, 80) / 100, weight: 15 }
    ])

  case BinType.OUTGOING:
    return pickWeighted([
      { value: 0, weight: 18 },
      { value: 1, weight: 8 },
      { value: randomInt(15, 55) / 100, weight: 54 },
      { value: randomInt(60, 90) / 100, weight: 20 }
    ])

  case BinType.QUARANTINE:
    return pickWeighted([
      { value: 0, weight: 30 },
      { value: 1, weight: 5 },
      { value: randomInt(10, 40) / 100, weight: 50 },
      { value: randomInt(45, 70) / 100, weight: 15 }
    ])

  case BinType.STAGING:
    return pickWeighted([
      { value: 0, weight: 15 },
      { value: 1, weight: 10 },
      { value: randomInt(30, 65) / 100, weight: 45 },
      { value: randomInt(70, 95) / 100, weight: 30 }
    ])

  default:
    return randomInt(20, 70) / 100
  }
}

function getStatusForBinType(binType: BinType): BinItemStatus {
  switch (binType) {
  case BinType.GENERAL:
    return pickWeighted([
      { value: BinItemStatus.AVAILABLE, weight: 75 },
      { value: BinItemStatus.RESERVED, weight: 15 },
      { value: BinItemStatus.BLOCKED, weight: 10 }
    ])

  case BinType.RECEIVING:
    return pickWeighted([
      { value: BinItemStatus.AVAILABLE, weight: 60 },
      { value: BinItemStatus.RESERVED, weight: 5 },
      { value: BinItemStatus.BLOCKED, weight: 35 }
    ])

  case BinType.OUTGOING:
    return pickWeighted([
      { value: BinItemStatus.AVAILABLE, weight: 25 },
      { value: BinItemStatus.RESERVED, weight: 65 },
      { value: BinItemStatus.BLOCKED, weight: 10 }
    ])

  case BinType.QUARANTINE:
    return pickWeighted([
      { value: BinItemStatus.AVAILABLE, weight: 5 },
      { value: BinItemStatus.RESERVED, weight: 5 },
      { value: BinItemStatus.BLOCKED, weight: 90 }
    ])

  case BinType.STAGING:
    return pickWeighted([
      { value: BinItemStatus.AVAILABLE, weight: 50 },
      { value: BinItemStatus.RESERVED, weight: 35 },
      { value: BinItemStatus.BLOCKED, weight: 15 }
    ])

  default:
    return BinItemStatus.AVAILABLE
  }
}

function getDesiredRowCount(binType: BinType, itemsCount: number): number {
  const maxRows = Math.min(MAX_UNIQUE_ITEMS_PER_BIN, itemsCount)

  switch (binType) {
  case BinType.GENERAL:
    return randomInt(4, Math.min(10, maxRows))

  case BinType.RECEIVING:
    return randomInt(2, Math.min(6, maxRows))

  case BinType.OUTGOING:
    return randomInt(2, Math.min(6, maxRows))

  case BinType.QUARANTINE:
    return randomInt(1, Math.min(5, maxRows))

  case BinType.STAGING:
    return randomInt(3, Math.min(8, maxRows))

  default:
    return randomInt(2, Math.min(6, maxRows))
  }
}
export async function seedBinStockItems(prisma: PrismaClient) {
  const [bins, items] = await Promise.all([
    prisma.bin.findMany({
      where: { deletedAt: null },
      select: {
        id: true,
        warehouseId: true,
        maxCapacity: true,
        type: true
      },
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

  const stockItems: Prisma.BinStockItemCreateManyInput[] = []
  const capacityByBinId = new Map<
    string,
    { available: number; reserved: number; blocked: number; total: number }
  >()
  let globalRecordIndex = 1

  for (const [binIndex, bin] of bins.entries()) {
    const maxCapacity = bin.maxCapacity?.toNumber() ?? 0

    if (maxCapacity <= 0) {
      continue
    }

    const fillRatio = getFillRatioForBinType(bin.type)
    const targetQuantity = Math.floor(maxCapacity * fillRatio)

    if (targetQuantity === 0) {
      continue
    }

    const desiredRowCount = getDesiredRowCount(bin.type, items.length)
    const usedItemIndexes = new Set<number>()
    let itemCursor = (binIndex * 37) % items.length
    let remainingCapacity = targetQuantity

    for (
      let slot = 0;
      slot < desiredRowCount && remainingCapacity > 0 && usedItemIndexes.size < items.length;
      slot += 1
    ) {
      while (usedItemIndexes.has(itemCursor)) {
        itemCursor = (itemCursor + 1) % items.length
      }

      usedItemIndexes.add(itemCursor)
      const item = items[itemCursor]
      itemCursor = (itemCursor + 17) % items.length

      const status = getStatusForBinType(bin.type)

      const remainingSlots = desiredRowCount - slot
      const minReservedForFutureSlots = remainingSlots > 1 ? remainingSlots - 1 : 0
      const maxQuantityForThisRow = Math.max(1, remainingCapacity - minReservedForFutureSlots)

      const quantity =
        remainingSlots === 1
          ? remainingCapacity
          : randomInt(1, Math.min(15, maxQuantityForThisRow))

      const quantityAvailable = status === BinItemStatus.AVAILABLE ? quantity : 0
      const quantityReserved = status === BinItemStatus.RESERVED ? quantity : 0
      const quantityBlocked = status === BinItemStatus.BLOCKED ? quantity : 0

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

      const currentCapacity = capacityByBinId.get(bin.id) ?? {
        available: 0,
        reserved: 0,
        blocked: 0,
        total: 0
      }
      currentCapacity.available += quantityAvailable
      currentCapacity.reserved += quantityReserved
      currentCapacity.blocked += quantityBlocked
      currentCapacity.total += quantity
      capacityByBinId.set(bin.id, currentCapacity)

      globalRecordIndex += 1
      remainingCapacity -= quantity
    }
  }

  await prisma.$transaction(
    async (tx) => {
      await tx.binStockItem.deleteMany()

      await tx.bin.updateMany({
        where: { id: { in: bins.map((bin) => bin.id) } },
        data: {
          currentCapacity: new Prisma.Decimal(0)
        }
      })

      await tx.binStockItem.createMany({
        data: stockItems,
        skipDuplicates: true
      })

      for (const [binId, capacity] of capacityByBinId.entries()) {
        await tx.bin.update({
          where: { id: binId },
          data: { currentCapacity: new Prisma.Decimal(capacity.total) }
        })
      }
    },
    {
      maxWait: 10_000,
      timeout: 60_000
    }
  )

  const seededByBin = bins.map((bin) => {
    const capacity = capacityByBinId.get(bin.id)
    const maxCapacity = bin.maxCapacity?.toNumber() ?? 0
    const total = capacity?.total ?? 0
    const fillPercentage = maxCapacity > 0 ? Number(((total / maxCapacity) * 100).toFixed(2)) : 0

    return {
      binId: bin.id,
      type: bin.type,
      maxCapacity,
      quantitySeeded: total,
      available: capacity?.available ?? 0,
      reserved: capacity?.reserved ?? 0,
      blocked: capacity?.blocked ?? 0,
      fillPercentage,
      isFull: maxCapacity > 0 && total >= maxCapacity
    }
  })

  return {
    count: stockItems.length,
    generated: stockItems.length,
    seededByBin
  }
}
