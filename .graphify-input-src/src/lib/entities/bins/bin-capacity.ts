import { Prisma, type PrismaClient } from '@/generated/prisma'

type PrismaExecutor = PrismaClient | Prisma.TransactionClient
export type BinCapacitySnapshot = {
  binId: string
  total: Prisma.Decimal
  available: Prisma.Decimal
  reserved: Prisma.Decimal
  blocked: Prisma.Decimal
  maxCapacity: Prisma.Decimal
  fillPercentage: Prisma.Decimal
  hasCapacityAvailable: boolean
  isFull: boolean
}

export async function hasBinCapacityAvailable(
  prisma: PrismaExecutor,
  binId: string
): Promise<boolean> {
  try {
    const bin = await prisma.bin.findUnique({
      where: { id: binId },
      select: {
        currentCapacity: true,
        maxCapacity: true
      }
    })

    if (!bin) {
      throw new Error(`Bin "${binId}" not found`)
    }

    const maxCapacity = bin.maxCapacity?.toNumber() ?? 0
    const currentCapacity = bin.currentCapacity?.toNumber() ?? 0

    if (maxCapacity === 0) {
      throw new Error(`No max capacity set for bin "${binId}"`)
    }

    return currentCapacity < maxCapacity
  } catch (error) {
    throw new Error(
      `Failed to check capacity availability for bin "${binId}": ${
        error instanceof Error ? error.message : 'Unknown error'
      }`
    )
  }
}

export async function updateBinCapacity(
  prisma: PrismaExecutor,
  binId: string
): Promise<BinCapacitySnapshot> {
  try {
    const bin = await prisma.bin.findUnique({
      where: { id: binId },
      select: {
        id: true,
        maxCapacity: true
      }
    })

    if (!bin) {
      throw new Error(`Bin "${binId}" not found`)
    }

    if (!bin.maxCapacity || bin.maxCapacity.toNumber() === 0) {
      throw new Error(`No max capacity set for bin "${binId}"`)
    }

    const stock = await prisma.binStockItem.aggregate({
      where: { binId },
      _sum: {
        quantityAvailable: true,
        quantityReserved: true,
        quantityBlocked: true
      }
    })

    const available = new Prisma.Decimal(stock._sum.quantityAvailable ?? 0)
    const reserved = new Prisma.Decimal(stock._sum.quantityReserved ?? 0)
    const blocked = new Prisma.Decimal(stock._sum.quantityBlocked ?? 0)

    const total = available.plus(reserved).plus(blocked)
    const maxCapacity = new Prisma.Decimal(bin.maxCapacity)
    const isFull = total.greaterThanOrEqualTo(maxCapacity)
    const hasCapacityAvailable = total.lessThan(maxCapacity)

    const fillPercentage = total
      .div(maxCapacity)
      .mul(100)
      .toDecimalPlaces(2)

    await prisma.bin.update({
      where: { id: binId },
      data: {
        currentCapacity: total
      }
    })

    return {
      binId,
      total,
      available,
      reserved,
      blocked,
      maxCapacity,
      fillPercentage,
      hasCapacityAvailable,
      isFull
    }
  } catch (error) {
    throw new Error(
      `Failed to update capacity for bin "${binId}": ${
        error instanceof Error ? error.message : 'Unknown error'
      }`
    )
  }
}
