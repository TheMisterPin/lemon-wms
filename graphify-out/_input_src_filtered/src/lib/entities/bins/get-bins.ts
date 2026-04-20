import type { PrismaClient } from '@/generated/prisma'

/**
 * getBins.
 * @param prisma - Parameter for getBins.
 * @param filters? - Parameter for getBins.
 * @returns Result from getBins.
 */
async function getBins(prisma: PrismaClient, filters?: { zoneId?: string; warehouseId?: string }) {
  const bins = await prisma.bin.findMany({
    where: {
      deletedAt: null,
      ...(filters?.zoneId ? { zoneId: filters.zoneId } : {}),
      ...(filters?.warehouseId ? { warehouseId: filters.warehouseId } : {})
    },
    select: {
      id: true,
      zoneId: true,
      warehouseId: true,
      name: true,
      code: true,
      type: true,
      isBlocked: true,
      blockReason: true,
      maxWeightKg: true,
      maxVolumeM3: true,
      maxCapacity: true,
      currentCapacity: true,
      createdAt: true,
      deletedAt: true,
      zone: {
        select: {
          name: true
        }
      },
      warehouse: {
        select: {
          name: true
        }
      },
      _count: {
        select: { binStockItems: true }
      }
    },
    orderBy: { createdAt: 'desc' }
  })

  return bins
}

export { getBins }
