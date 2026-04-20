import type { PrismaClient } from '@/generated/prisma'
import type { WarehouseFormValues } from '@/lib/schemas/warehouse'

type CreateWarehouseInput = WarehouseFormValues & { createdById?: string, id: string }

/**
 * createWarehouse.
 * @param prisma - Parameter for createWarehouse.
 * @param data - Parameter for createWarehouse.
 * @returns Result from createWarehouse.
 */
async function createWarehouse(prisma: PrismaClient, data: CreateWarehouseInput) {
  return prisma.warehouse.create({ data })
}

export { createWarehouse }
