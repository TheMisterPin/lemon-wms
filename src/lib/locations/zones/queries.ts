import type { PrismaClient } from '@/generated/prisma'

async function getZone(prisma: PrismaClient, id: string) {
  return prisma.zone.findFirst({ where: { id, deletedAt: null } })
}

async function getZones(prisma: PrismaClient, filters?: { warehouseId?: string }) {
  return prisma.zone.findMany({
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
}

export { getZone, getZones }
