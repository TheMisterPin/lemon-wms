import type { PrismaClient } from '@/generated/prisma'

/**
 * deleteZone.
 * @param prisma - Parameter for deleteZone.
 * @param id - Parameter for deleteZone.
 * @returns Result from deleteZone.
 */
async function deleteZone(prisma: PrismaClient, id: string) {
  return prisma.zone.update({
    where: { id },
    data: { deletedAt: new Date(), isActive: false }
  })
}

export { deleteZone }
