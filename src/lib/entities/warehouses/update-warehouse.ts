import type { PrismaClient } from '@/generated/prisma'
import type { WarehouseFormValues } from '@/lib/components/configs/entities/warehouse/types'

async function updateWarehouse(
  prisma: PrismaClient,
  id: string,
  data: Partial<WarehouseFormValues>
) {
  return prisma.warehouse.update({
    where: { id },
    data
  })
}

export { updateWarehouse }
