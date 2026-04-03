import type { PrismaClient } from '@/generated/prisma'

async function getItem(prisma: PrismaClient, id: string) {
  return prisma.item.findFirst({ where: { id, deletedAt: null } })
}

export { getItem }
