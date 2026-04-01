import { Prisma } from '@/generated/prisma'
import type { PrismaClient } from '@/generated/prisma'
import type { ZoneFormValues } from '@/lib/components/configs/entities/zone/types'
import { DomainError } from '@/lib/errors'
import { generateZoneSerial } from '@/utils/serials'

async function createZone(prisma: PrismaClient, data: ZoneFormValues) {
  // 1. Verify the warehouse exists and is not soft-deleted
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

  // 2. Check for duplicate zone name within the same warehouse
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

  // 3. Create
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

export { createZone }
