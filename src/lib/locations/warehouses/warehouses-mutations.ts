import type { PrismaClient } from '@/generated/prisma'

import type { WarehouseFormValues } from './warehouses-schemas'

type CreateWarehouseInput = WarehouseFormValues & { createdById?: string, id: string }

async function createWarehouse(prisma: PrismaClient, data: CreateWarehouseInput) {
  return prisma.warehouse.create({ data })
}

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

async function deleteWarehouse(prisma: PrismaClient, id: string) {
  return prisma.warehouse.update({
    where: { id },
    data: { deletedAt: new Date(), status: 'ARCHIVED' }
  })
}

export { createWarehouse, updateWarehouse, deleteWarehouse }
