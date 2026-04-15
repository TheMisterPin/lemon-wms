import type { PrismaClient } from '@/generated/prisma'

/**
 * getWarehouse.
 * @param prisma - Parameter for getWarehouse.
 * @param id - Parameter for getWarehouse.
 * @returns Result from getWarehouse.
 */
async function getWarehouse(prisma: PrismaClient, id: string) {
  return prisma.warehouse.findFirst({
    where: { id, deletedAt: null }
  })
}

export { getWarehouse }
