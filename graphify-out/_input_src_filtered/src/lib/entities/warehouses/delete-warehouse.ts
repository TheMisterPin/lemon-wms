import type { PrismaClient } from '@/generated/prisma'

/**
 * deleteWarehouse.
 * @param prisma - Parameter for deleteWarehouse.
 * @param id - Parameter for deleteWarehouse.
 * @returns Result from deleteWarehouse.
 */
async function deleteWarehouse(prisma: PrismaClient, id: string) {
  return prisma.warehouse.update({
    where: { id },
    data: { deletedAt: new Date(), status: 'ARCHIVED' }
  })
}

export { deleteWarehouse }
