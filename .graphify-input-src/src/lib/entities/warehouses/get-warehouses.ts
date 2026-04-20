import type { PrismaClient } from '@/generated/prisma'

/**
 * getWarehouses.
 * @param prisma - Parameter for getWarehouses.
 * @returns Result from getWarehouses.
 */
async function getWarehouses(prisma: PrismaClient) {
  const warehouses = await prisma.warehouse.findMany({
    select: {
      id: true,
      name: true,
      address: true,
      timezone: true,
      currency: true,
      status: true,
      createdById: true,
      createdAt: true,
      deletedAt: true
    },
    orderBy: { createdAt: 'desc' }
  })

  return warehouses
}

export { getWarehouses }
