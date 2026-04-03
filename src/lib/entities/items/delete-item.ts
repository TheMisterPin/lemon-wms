import type { PrismaClient } from '@/generated/prisma'

async function deleteItem(prisma: PrismaClient, id: string) {
  return prisma.item.update({
    where: { id },
    data: { deletedAt: new Date(), isActive: false }
  })
}

export { deleteItem }
