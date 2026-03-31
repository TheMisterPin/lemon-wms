import type { PrismaClient } from '@/generated/prisma'

async function getBin(prisma: PrismaClient, id: string) {
  return prisma.bin.findFirst({ where: { id, deletedAt: null } })
}

export { getBin }
