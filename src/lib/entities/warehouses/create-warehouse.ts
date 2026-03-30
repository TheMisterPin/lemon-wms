import type { PrismaClient } from '@/generated/prisma'
import { WarehouseFormValues } from '@/lib/components/configs/entities/warehouse/types'

async function createWarehouse(prisma: PrismaClient, data: WarehouseFormValues) {
  const warehouse = await prisma.warehouse.create({
    data
  })

  return warehouse
}

export { createWarehouse }
