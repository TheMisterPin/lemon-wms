import type { PrismaClient } from '@/generated/prisma'

async function deleteUser(prisma: PrismaClient, id: string) {
  // Deactivate user, soft-delete, and revoke all refresh tokens
  const [user] = await prisma.$transaction([
    prisma.user.update({
      where: { id },
      data: { deletedAt: new Date(), isActive: false },
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
    }),
    prisma.refreshToken.updateMany({
      where: { userId: id, revokedAt: null },
      data: { revokedAt: new Date() }
    })
  ])

  return user
}

export { deleteUser }
