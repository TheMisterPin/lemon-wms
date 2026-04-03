import type { PrismaClient } from '@/generated/prisma'

async function getUser(prisma: PrismaClient, id: string) {
  return prisma.user.findFirst({
    where: { id, deletedAt: null },
    select: {
      id: true,
      email: true,
      badgeNumber: true,
      role: true,
      loginType: true,
      isActive: true,
      deletedAt: true,
      createdAt: true
    }
  })
}

export { getUser }
