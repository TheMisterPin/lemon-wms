import type { Prisma, PrismaClient } from '@/generated/prisma'
import { DomainError } from '@/lib/errors'

type LocationsDbClient = PrismaClient | Prisma.TransactionClient

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

async function getZoneFromBin(prisma: LocationsDbClient, binId: string) {
  const result = await prisma.zone.findFirst({
    where: { bins: { some: { id: binId } }, deletedAt: null },
    select: { id: true, name: true }
  })

  if (!result) {
    throw new DomainError(`Bin "${binId}" is not assigned to a zone.`, 'BIN_NOT_ASSIGNED_TO_ZONE', 404)
  }

  return result
}

export { getZone, getZones, getZoneFromBin }
