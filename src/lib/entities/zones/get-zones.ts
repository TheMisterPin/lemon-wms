import type { PrismaClient } from '@/generated/prisma'

async function getZones(prisma: PrismaClient) {
  const zones = await prisma.zone.findMany()

  return zones
}

export { getZones }
