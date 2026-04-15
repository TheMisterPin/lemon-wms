import type { PrismaClient } from '@/generated/prisma'

/**
 * getUsers.
 * @param prisma - Parameter for getUsers.
 * @returns Result from getUsers.
 */
async function getUsers(prisma: PrismaClient) {
  return prisma.user.findMany({
    where: { deletedAt: null },
    select: {
      id: true,
      email: true,
      badgeNumber: true,
      role: true,
      loginType: true,
      isActive: true,
      deletedAt: true,
      createdAt: true
    },
    orderBy: { createdAt: 'desc' }
  })
}

export { getUsers }
