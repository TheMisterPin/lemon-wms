import type { PrismaClient } from '@/generated/prisma'

async function getBins(prisma: PrismaClient, filters?: { zoneId?: string; warehouseId?: string }) {
  const bins = await prisma.bin.findMany({
    where: {
      deletedAt: null,
      ...(filters?.zoneId ? { zoneId: filters.zoneId } : {}),
      ...(filters?.warehouseId ? { warehouseId: filters.warehouseId } : {})
    },
    orderBy: { createdAt: 'desc' }
  })

  return bins
}

export { getBins }
