import type { PrismaClient } from '@/generated/prisma'

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
