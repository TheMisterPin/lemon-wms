import type { PrismaClient } from '@/generated/prisma'
import type { WarehouseFormValues } from '@/lib/schemas/warehouse'

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
