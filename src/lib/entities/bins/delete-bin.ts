import type { PrismaClient } from '@/generated/prisma'

async function deleteBin(prisma: PrismaClient, id: string) {
  return prisma.bin.update({
    where: { id },
    data: { deletedAt: new Date() }
  })
}

export { deleteBin }
