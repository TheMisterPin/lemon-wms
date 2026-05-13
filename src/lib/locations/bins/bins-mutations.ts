import { Prisma, type PrismaClient } from '@/generated/prisma'
import type { BinType } from '@/generated/prisma'
import { DomainError } from '@/lib/errors'
import { generateBinSerial } from '@/utils/serials'

import type { BinFormValues, BinUpdateValues } from './bins-schemas'

type PrismaExecutor = PrismaClient | Prisma.TransactionClient

export type BinCapacitySnapshot = {
  binId: string
  total: Prisma.Decimal
  available: Prisma.Decimal
  reserved: Prisma.Decimal
  blocked: Prisma.Decimal
  maxCapacity: Prisma.Decimal
  fillPercentage: Prisma.Decimal
  hasCapacityAvailable: boolean
  isFull: boolean
}

async function createBin(prisma: PrismaClient, data: BinFormValues) {
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

async function updateBin(prisma: PrismaClient, id: string, data: BinUpdateValues) {
  let warehouseId: string | undefined
  if (data.zoneId !== undefined) {
    const zone = await prisma.zone.findUnique({
      where: { id: data.zoneId },
      select: { warehouseId: true, deletedAt: true, isActive: true }
    })

    if (!zone || zone.deletedAt) {
      throw new DomainError('Zone not found.', 'ZONE_NOT_FOUND', 404)
    }

    if (!zone.isActive) {
      throw new DomainError('Cannot assign bin to an inactive zone.', 'ZONE_INACTIVE', 409)
    }

    warehouseId = zone.warehouseId
  }

  const patch: Prisma.BinUncheckedUpdateInput = {}

  if (data.name !== undefined) {
    patch.name = data.name
  }

  if (data.type !== undefined) {
    patch.type = data.type as BinType
  }

  if (data.zoneId !== undefined && warehouseId !== undefined) {
    patch.zoneId = data.zoneId
    patch.warehouseId = warehouseId
  }

  if (data.isActive !== undefined) {
    patch.isActive = data.isActive
  }

  if (data.maxCapacity !== undefined) {
    patch.maxCapacity = data.maxCapacity === null ? null : new Prisma.Decimal(data.maxCapacity)
  }

  return prisma.bin.update({ where: { id }, data: patch })
}

async function deleteBin(prisma: PrismaClient, id: string) {
  return prisma.bin.update({
    where: { id },
    data: { deletedAt: new Date() }
  })
}

async function updateBinCapacity(
  prisma: PrismaExecutor,
  binId: string
): Promise<BinCapacitySnapshot> {
  try {
    const bin = await prisma.bin.findUnique({
      where: { id: binId },
      select: {
        id: true,
        maxCapacity: true
      }
    })

    if (!bin) {
      throw new Error(`Bin "${binId}" not found`)
    }

    if (!bin.maxCapacity || bin.maxCapacity.toNumber() === 0) {
      throw new Error(`No max capacity set for bin "${binId}"`)
    }

    const stock = await prisma.binStockItem.aggregate({
      where: { binId },
      _sum: {
        quantityAvailable: true,
        quantityReserved: true,
        quantityBlocked: true
      }
    })

    const available = new Prisma.Decimal(stock._sum.quantityAvailable ?? 0)
    const reserved = new Prisma.Decimal(stock._sum.quantityReserved ?? 0)
    const blocked = new Prisma.Decimal(stock._sum.quantityBlocked ?? 0)

    const total = available.plus(reserved).plus(blocked)
    const maxCapacity = new Prisma.Decimal(bin.maxCapacity)
    const isFull = total.greaterThanOrEqualTo(maxCapacity)
    const hasCapacityAvailable = total.lessThan(maxCapacity)

    const fillPercentage = total
      .div(maxCapacity)
      .mul(100)
      .toDecimalPlaces(2)

    await prisma.bin.update({
      where: { id: binId },
      data: {
        currentCapacity: total
      }
    })

    return {
      binId,
      total,
      available,
      reserved,
      blocked,
      maxCapacity,
      fillPercentage,
      hasCapacityAvailable,
      isFull
    }
  } catch (error) {
    throw new Error(
      `Failed to update capacity for bin "${binId}": ${
        error instanceof Error ? error.message : 'Unknown error'
      }`
    )
  }
}

export { createBin, updateBin, deleteBin, updateBinCapacity }
