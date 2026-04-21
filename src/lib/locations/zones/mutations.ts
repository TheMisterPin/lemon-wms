import { Prisma } from '@/generated/prisma'
import type { PrismaClient } from '@/generated/prisma'
import { DomainError } from '@/lib/errors'
import { generateZoneSerial } from '@/utils/serials'

import type { ZoneFormValues } from './schemas'

async function createZone(prisma: PrismaClient, data: ZoneFormValues) {
  const warehouse = await prisma.warehouse.findUnique({
    where: { id: data.warehouseId },
    select: { id: true, status: true, deletedAt: true }
  })

  if (!warehouse) {
    throw new DomainError(
      `Warehouse "${data.warehouseId}" does not exist.`,
      'WAREHOUSE_NOT_FOUND',
      404
    )
  }

  if (warehouse.deletedAt) {
    throw new DomainError(
      'Cannot create a zone in a deleted warehouse.',
      'WAREHOUSE_DELETED',
      409
    )
  }

  if (warehouse.status !== 'ACTIVE') {
    throw new DomainError(
      `Warehouse is ${warehouse.status}. Only ACTIVE warehouses can receive new zones.`,
      'WAREHOUSE_INACTIVE',
      409
    )
  }

  const duplicate = await prisma.zone.findUnique({
    where: {
      warehouseId_name: {
        warehouseId: data.warehouseId,
        name: data.name
      }
    },
    select: { id: true }
  })

  if (duplicate) {
    throw new DomainError(
      `A zone named "${data.name}" already exists in this warehouse.`,
      'ZONE_DUPLICATE_NAME',
      409
    )
  }

  const { customPermissions, ...rest } = data
  const newID = await generateZoneSerial(prisma, data.warehouseId)

  return prisma.zone.create({
    data: {
      ...rest,
      id: newID,
      customPermissions: customPermissions !== null
        ? (customPermissions as Prisma.InputJsonValue)
        : Prisma.JsonNull
    }
  })
}

async function updateZone(
  prisma: PrismaClient,
  id: string,
  data: Partial<ZoneFormValues>
) {
  const { customPermissions, ...rest } = data

  return prisma.zone.update({
    where: { id },
    data: {
      ...rest,
      ...(customPermissions !== undefined
        ? {
          customPermissions: customPermissions !== null
            ? (customPermissions as Prisma.InputJsonValue)
            : Prisma.JsonNull
        }
        : {})
    }
  })
}

async function deleteZone(prisma: PrismaClient, id: string) {
  return prisma.zone.update({
    where: { id },
    data: { deletedAt: new Date(), isActive: false }
  })
}

export { createZone, updateZone, deleteZone }
