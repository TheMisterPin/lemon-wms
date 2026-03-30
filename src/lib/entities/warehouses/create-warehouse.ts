import type { PrismaClient } from '@/generated/prisma'
import { WarehouseFormValues } from '@/lib/components/configs/entities/warehouse/types'

type CreateWarehouseValues = Pick<WarehouseFormValues, 'name'>

async function createWarehouse(prisma: PrismaClient, data: CreateWarehouseValues) {
  const warehouse = await prisma.warehouse.create({
    data
  })

  return warehouse
}

export { createWarehouse }
