import type { PrismaClient } from '@/generated/prisma'

/**
 * deleteItem.
 * @param prisma - Parameter for deleteItem.
 * @param id - Parameter for deleteItem.
 * @returns Result from deleteItem.
 */
async function deleteItem(prisma: PrismaClient, id: string) {
  return prisma.item.update({
    where: { id },
    data: { deletedAt: new Date(), isActive: false }
  })
}

export { deleteItem }
