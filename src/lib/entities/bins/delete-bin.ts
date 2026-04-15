import type { PrismaClient } from '@/generated/prisma'

/**
 * deleteBin.
 * @param prisma - Parameter for deleteBin.
 * @param id - Parameter for deleteBin.
 * @returns Result from deleteBin.
 */
async function deleteBin(prisma: PrismaClient, id: string) {
  return prisma.bin.update({
    where: { id },
    data: { deletedAt: new Date() }
  })
}

export { deleteBin }
