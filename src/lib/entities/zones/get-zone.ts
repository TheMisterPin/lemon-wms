import type { PrismaClient } from '@/generated/prisma'

async function getZone(prisma: PrismaClient, id: string) {
  return prisma.zone.findFirst({ where: { id, deletedAt: null } })
}

export { getZone }
