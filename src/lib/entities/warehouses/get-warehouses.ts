import type { PrismaClient } from '@/generated/prisma'

async function getWarehouses(prisma: PrismaClient) {
  const warehouses = await prisma.warehouse.findMany()

  return warehouses
}

export { getWarehouses }
