import {
  BinItemStatus,
  BinType,
  Prisma,
  ZoneType,
  type PrismaClient
} from '@/generated/prisma'

const MAX_UNIQUE_ITEMS_PER_BIN = 12
const CATEGORY_SEED_DISTINCT_ITEMS_MIN = 3
const CATEGORY_SEED_DISTINCT_ITEMS_MAX = 7

/**
 * randomInt.
 * @param min - Parameter for randomInt.
 * @param max - Parameter for randomInt.
 * @returns Result from randomInt.
 */
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

/**
 * Stock seed keeps all quantity in available or blocked buckets only.
 * Reservations are created later by order pick seeds (sales / transfer).
 */
function getStatusForBinType(binType: BinType): BinItemStatus {
  switch (binType) {
  case BinType.GENERAL:
    return pickWeighted([
      { value: BinItemStatus.AVAILABLE, weight: 90 },
      { value: BinItemStatus.BLOCKED, weight: 10 }
    ])

  case BinType.RECEIVING:
    return pickWeighted([
      { value: BinItemStatus.AVAILABLE, weight: 65 },
      { value: BinItemStatus.BLOCKED, weight: 35 }
    ])

  case BinType.OUTGOING:
    return pickWeighted([
      { value: BinItemStatus.AVAILABLE, weight: 90 },
      { value: BinItemStatus.BLOCKED, weight: 10 }
    ])

  case BinType.QUARANTINE:
    return pickWeighted([
      { value: BinItemStatus.AVAILABLE, weight: 10 },
      { value: BinItemStatus.BLOCKED, weight: 90 }
    ])

  case BinType.STAGING:
    return pickWeighted([
      { value: BinItemStatus.AVAILABLE, weight: 85 },
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

type ItemSeed = {
  id: string
  uom: string
  name: string
  sku: string
  minQuantity: number
  categoryId: string | null
  categoryRootCode: string | null
  isFood: boolean
  isFrozen: boolean
}

function seededIntFromString(seed: string, span: number): number {
  let h = 0

  for (let i = 0; i < seed.length; i += 1) {
    h = Math.imul(31, h) + seed.charCodeAt(i) | 0
  }

  return Math.abs(h) % span
}

/** Smallest usable integer stocked quantity strictly above item minQuantity. */
function minimalIntegerQtyAboveMin(minQuantity: Prisma.Decimal): number {
  const m = minQuantity.toNumber()

  return Math.floor(m) + 1
}

function seededDistinctTargetsForCategory(categoryCode: string, itemSlotCount: number): number {
  const span =
    CATEGORY_SEED_DISTINCT_ITEMS_MAX - CATEGORY_SEED_DISTINCT_ITEMS_MIN + 1

  const wanted =
    CATEGORY_SEED_DISTINCT_ITEMS_MIN + seededIntFromString(`cat-distinct:${categoryCode}`, span)

  return Math.min(itemSlotCount, wanted)
}

function sortItemsDeterministic(items: ItemSeed[], categoryCode: string): ItemSeed[] {
  return [...items].sort((a, b) => {
    const sa = seededIntFromString(`${categoryCode}|score|${a.id}`, 2147483629)
    const sb = seededIntFromString(`${categoryCode}|score|${b.id}`, 2147483629)

    if (sa !== sb) {
      return sa - sb
    }

    return a.id.localeCompare(b.id)
  })
}

function binItemPairKey(binId: string, itemId: string): string {
  return `${binId}\t${itemId}`
}

function isFoodRoot(code: string | null): boolean {
  return code === 'FDBV' || code === 'BVCL' || code === 'FRZN'
}

function isFrozenCategoryCode(code: string | null): boolean {
  if (code === null) {
    return false
  }

  return ['MEAT', 'VGTB', 'RDML', 'ICRM', 'SFOD'].includes(code)
}

function isItemAllowedInZone(item: ItemSeed, zoneType: ZoneType): boolean {
  if (item.isFrozen) {
    return zoneType === ZoneType.COLD
  }

  if (item.isFood) {
    return zoneType === ZoneType.COLD
  }

  return zoneType !== ZoneType.COLD
}

export async function seedBinStockItems(prisma: PrismaClient) {
  const [bins, items] = await Promise.all([
    prisma.bin.findMany({
      where: { deletedAt: null },
      select: {
        id: true,
        warehouseId: true,
        maxCapacity: true,
        type: true,
        zone: {
          select: {
            type: true
          }
        }
      },
      orderBy: { id: 'asc' }
    }),
    prisma.item.findMany({
      select: {
        id: true,
        uom: true,
        name: true,
        sku: true,
        categoryId: true,
        minQuantity: true,
        category: {
          select: {
            code: true,
            parentCode: true
          }
        }
      },
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

  const mappedItems: ItemSeed[] = items.map((item) => {
    const categoryRootCode = item.category?.parentCode ?? item.category?.code ?? null

    return {
      id: item.id,
      uom: item.uom,
      name: item.name,
      sku: item.sku,
      minQuantity: item.minQuantity.toNumber(),
      categoryId: item.categoryId,
      categoryRootCode,
      isFood: isFoodRoot(categoryRootCode),
      isFrozen: categoryRootCode === 'FRZN' || isFrozenCategoryCode(item.categoryId)
    }
  })

  const placedBinItemPairKeys = new Set<string>()
  const itemsByCategory = new Map<string, ItemSeed[]>()

  for (const mapped of mappedItems) {
    if (mapped.categoryId === null) {
      continue
    }

    const bucket = itemsByCategory.get(mapped.categoryId) ?? []

    bucket.push(mapped)
    itemsByCategory.set(mapped.categoryId, bucket)
  }

  const categoryCodesSorted = [...itemsByCategory.keys()].sort((a, b) => a.localeCompare(b))

  for (const categoryCode of categoryCodesSorted) {
    const inCategory = itemsByCategory.get(categoryCode) ?? []

    if (inCategory.length === 0) {
      continue
    }

    const targetDistinct =
      seededDistinctTargetsForCategory(categoryCode, inCategory.length)
    const chosenItems =
      sortItemsDeterministic(inCategory, categoryCode).slice(0, targetDistinct)

    for (const item of chosenItems) {
      const minStockUnits = minimalIntegerQtyAboveMin(
        new Prisma.Decimal(item.minQuantity)
      )
      const extraUnits =
        1 +
        seededIntFromString(`${categoryCode}|extra|${item.id}`, 39)
      const quantityWanted = Math.min(
        minStockUnits + extraUnits,
        minStockUnits + 60
      )

      const viableBins = bins
        .filter((bin) => (bin.maxCapacity?.toNumber() ?? 0) > 0)
        .filter((bin) =>
          isItemAllowedInZone(item, bin.zone?.type ?? ZoneType.GENERAL)
        )
        .sort((binA, binB) => binA.id.localeCompare(binB.id))

      if (viableBins.length === 0) {
        continue
      }

      const startOffset =
        seededIntFromString(`${categoryCode}|bin|${item.id}`, viableBins.length)
      let placed = false

      for (let probe = 0; probe < viableBins.length && !placed; probe += 1) {
        const bin = viableBins[(startOffset + probe) % viableBins.length]

        if (placedBinItemPairKeys.has(binItemPairKey(bin.id, item.id))) {
          continue
        }

        const maxCapacity = bin.maxCapacity?.toNumber() ?? 0
        const usedAlready = capacityByBinId.get(bin.id)?.total ?? 0
        const slackWhole = Math.max(0, Math.floor(maxCapacity - usedAlready))

        if (slackWhole < minStockUnits) {
          continue
        }

        const quantity = Math.min(quantityWanted, slackWhole)

        if (quantity < minStockUnits) {
          continue
        }

        const status = BinItemStatus.AVAILABLE
        const quantityAvailable = quantity
        const quantityReserved = 0
        const quantityBlocked = 0

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

        placedBinItemPairKeys.add(binItemPairKey(bin.id, item.id))
        globalRecordIndex += 1
        placed = true
      }
    }
  }

  for (const [binIndex, bin] of bins.entries()) {
    const maxCapacity = bin.maxCapacity?.toNumber() ?? 0

    if (maxCapacity <= 0) {
      continue
    }

    const fillRatio = getFillRatioForBinType(bin.type)
    const targetQuantityWhole = Math.floor(maxCapacity * fillRatio)
    const alreadyUsedWhole = capacityByBinId.get(bin.id)?.total ?? 0
    const remainingBudget = Math.max(0, targetQuantityWhole - alreadyUsedWhole)

    if (remainingBudget === 0) {
      continue
    }

    const zoneType = bin.zone?.type ?? ZoneType.GENERAL
    const zoneEligibleItems = mappedItems.filter((item) => isItemAllowedInZone(item, zoneType))

    if (zoneEligibleItems.length === 0) {
      continue
    }

    const eligibleItems = (() => {
      if (bin.type === BinType.STAGING) {
        return zoneEligibleItems
      }

      const roots = [...new Set(zoneEligibleItems.map((item) => item.categoryRootCode).filter((code) => code !== null))]
      if (roots.length === 0) {
        return zoneEligibleItems
      }

      const selectedRoot = roots[binIndex % roots.length]

      return zoneEligibleItems.filter((item) => item.categoryRootCode === selectedRoot)
    })()

    const eligibleFiltered = eligibleItems.filter(
      (candidate) =>
        !placedBinItemPairKeys.has(binItemPairKey(bin.id, candidate.id))
    )

    if (eligibleFiltered.length === 0) {
      continue
    }

    const desiredRowCount = getDesiredRowCount(bin.type, eligibleFiltered.length)
    const usedItemIndexes = new Set<number>()
    let itemCursor = (binIndex * 37) % eligibleFiltered.length
    let remainingCapacity = remainingBudget

    for (
      let slot = 0;
      slot < desiredRowCount && remainingCapacity > 0 && usedItemIndexes.size < eligibleFiltered.length;
      slot += 1
    ) {
      while (usedItemIndexes.has(itemCursor)) {
        itemCursor = (itemCursor + 1) % eligibleFiltered.length
      }

      usedItemIndexes.add(itemCursor)
      const item = eligibleFiltered[itemCursor]
      itemCursor = (itemCursor + 17) % eligibleFiltered.length

      const status = getStatusForBinType(bin.type)

      const remainingSlots = desiredRowCount - slot
      const minReservedForFutureSlots = remainingSlots > 1 ? remainingSlots - 1 : 0
      const maxQuantityForThisRow = Math.max(1, remainingCapacity - minReservedForFutureSlots)

      const quantity =
        remainingSlots === 1
          ? remainingCapacity
          : randomInt(1, Math.min(15, maxQuantityForThisRow))

      const quantityAvailable = status === BinItemStatus.AVAILABLE ? quantity : 0
      const quantityReserved = 0
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

      await tx.binStockItem.updateMany({
        where: { status: BinItemStatus.BLOCKED },
        data: {
          blockedReason: 'Seeded quantity on hold (blocked)',
          blockedAt: new Date()
        }
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
