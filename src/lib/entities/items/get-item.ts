import type { PrismaClient } from '@/generated/prisma'

/**
 * getItem.
 * @param prisma - Parameter for getItem.
 * @param id - Parameter for getItem.
 * @returns Result from getItem.
 */
async function getItem(prisma: PrismaClient, id: string) {
  return prisma.item.findFirst({ where: { id, deletedAt: null } })
}

export { getItem }
