import type { PrismaClient } from '@/generated/prisma'
import type { WarehouseFormValues } from '@/lib/components/configs/entities/warehouse/types'

type CreateWarehouseInput = WarehouseFormValues & { createdById?: string }

async function createWarehouse(prisma: PrismaClient, data: CreateWarehouseInput) {
  return prisma.warehouse.create({ data })
}

export { createWarehouse }
