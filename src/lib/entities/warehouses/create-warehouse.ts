import type { PrismaClient } from '@/generated/prisma'
import type { WarehouseFormValues } from '@/lib/schemas/warehouse'

type CreateWarehouseInput = WarehouseFormValues & { createdById?: string, id: string }

async function createWarehouse(prisma: PrismaClient, data: CreateWarehouseInput) {
  return prisma.warehouse.create({ data })
}

export { createWarehouse }
