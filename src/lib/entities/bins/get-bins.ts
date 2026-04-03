import type { PrismaClient } from '@/generated/prisma'

async function getBins(prisma: PrismaClient, filters?: { zoneId?: string; warehouseId?: string }) {
  return prisma.bin.findMany({
    where: {
      deletedAt: null,
      ...(filters?.zoneId ? { zoneId: filters.zoneId } : {}),
      ...(filters?.warehouseId ? { warehouseId: filters.warehouseId } : {})
    },
    orderBy: { createdAt: 'desc' }
  })
}

export { getBins }
