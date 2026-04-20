import type { PrismaClient } from '@/generated/prisma'

/**
 * getBinList.
 * @param prisma - Parameter for getBinList.
 * @param zoneId - Parameter for getBinList.
 * @returns Result from getBinList.
 */
async function getBinList(prisma: PrismaClient, zoneId: string) {
  const binList =  prisma.bin.findMany({
    where: { deletedAt: null, zoneId },
    select: {
      id: true,
      name: true,
      code: true,
      maxCapacity: true,
      currentCapacity: true
    },
    orderBy: { createdAt: 'desc' }
  })

  return binList
}

export { getBinList }
