import type { PrismaClient } from '@/generated/prisma'

/**
 * getZone.
 * @param prisma - Parameter for getZone.
 * @param id - Parameter for getZone.
 * @returns Result from getZone.
 */
async function getZone(prisma: PrismaClient, id: string) {
  return prisma.zone.findFirst({ where: { id, deletedAt: null } })
}

export { getZone }
