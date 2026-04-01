import type { PrismaClient } from '@/generated/prisma'

async function getZones(prisma: PrismaClient, filters?: { warehouseId?: string }) {
  const zones = await prisma.zone.findMany({
    where: {
      ...(filters?.warehouseId ? { warehouseId: filters.warehouseId } : {})
    },
    orderBy: { createdAt: 'desc' }
  })

  return zones
}

export { getZones }
