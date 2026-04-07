import type { BinType, PrismaClient } from '@/generated/prisma'
import { DomainError } from '@/lib/errors'
import type { BinFormValues } from '@/lib/schemas/bin'
import { generateBinSerial } from '@/utils/serials'

async function createBin(prisma: PrismaClient, data: BinFormValues) {
  // 1. Verify the zone exists and is not soft-deleted
  const zone = await prisma.zone.findUnique({
    where: { id: data.zoneId },
    select: { id: true, warehouseId: true, isActive: true, deletedAt: true }
  })

  if (!zone) {
    throw new DomainError(
      `Zone "${data.zoneId}" does not exist.`,
      'ZONE_NOT_FOUND',
      404
    )
  }

  if (zone.deletedAt) {
    throw new DomainError(
      'Cannot create a bin in a deleted zone.',
      'ZONE_DELETED',
      409
    )
  }

  if (!zone.isActive) {
    throw new DomainError(
      'Cannot create a bin in an inactive zone.',
      'ZONE_INACTIVE',
      409
    )
  }

  // 2. Verify the warehouse is active
  const warehouse = await prisma.warehouse.findUnique({
    where: { id: zone.warehouseId },
    select: { id: true, status: true, deletedAt: true }
  })

  if (!warehouse || warehouse.deletedAt) {
    throw new DomainError(
      'Cannot create a bin in a deleted warehouse.',
      'WAREHOUSE_DELETED',
      409
    )
  }

  if (warehouse.status !== 'ACTIVE') {
    throw new DomainError(
      `Warehouse is ${warehouse.status}. Only ACTIVE warehouses can receive new bins.`,
      'WAREHOUSE_INACTIVE',
      409
    )
  }

  // 3. Create — derive warehouseId and code from serial
  const newID = await generateBinSerial(prisma, data.zoneId)

  return prisma.bin.create({
    data: {
      id: newID,
      name: data.name,
      type: data.type as BinType,
      zoneId: data.zoneId,
      warehouseId: zone.warehouseId,
      code: newID
    }
  })
}

export { createBin }
