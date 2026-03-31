import type { PrismaClient } from '@/generated/prisma'

async function deleteWarehouse(prisma: PrismaClient, id: string) {
  return prisma.warehouse.update({
    where: { id },
    data: { deletedAt: new Date(), status: 'ARCHIVED' }
  })
}

export { deleteWarehouse }
