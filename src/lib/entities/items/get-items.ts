import type { PrismaClient } from '@/generated/prisma'

async function getItems(prisma: PrismaClient, filters?: { categoryId?: string; isActive?: boolean }) {
  return prisma.item.findMany({
    where: {
      deletedAt: null,
      ...(filters?.categoryId ? { categoryId: filters.categoryId } : {}),
      ...(filters?.isActive !== undefined ? { isActive: filters.isActive } : {})
    },
    orderBy: { createdAt: 'desc' }
  })
}

export { getItems }
