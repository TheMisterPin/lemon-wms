import type { PrismaClient } from '@/generated/prisma'

/**
 * getZones.
 * @param prisma - Parameter for getZones.
 * @param filters? - Parameter for getZones.
 * @returns Result from getZones.
 */
async function getZones(prisma: PrismaClient, filters?: { warehouseId?: string }) {
  const zones = await prisma.zone.findMany({
    where: {
      ...(filters?.warehouseId ? { warehouseId: filters.warehouseId } : {})
    },
    select: {
      id: true,
      warehouseId: true,
      name: true,
      type: true,
      isActive: true,
      defaultReceivingBinId: true,
      defaultQuarantineBinId: true,
      defaultOutgoingBinId: true,
      createdAt: true,
      deletedAt: true,
      warehouse: {
        select: {
          name: true
        }
      }
    },
    orderBy: { createdAt: 'desc' }
  })

  return zones
}

export { getZones }
