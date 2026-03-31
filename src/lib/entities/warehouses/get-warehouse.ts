import type { PrismaClient } from '@/generated/prisma'

async function getWarehouse(prisma: PrismaClient, id: string) {
  return prisma.warehouse.findFirst({
    where: { id, deletedAt: null }
  })
}

export { getWarehouse }
