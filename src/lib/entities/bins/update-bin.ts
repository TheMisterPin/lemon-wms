import type { PrismaClient } from '@/generated/prisma'
import type { BinFormValues } from '@/lib/schemas/bin'

/**
 * updateBin.
 * @param prisma - Parameter for updateBin.
 * @param id - Parameter for updateBin.
 * @param data - Parameter for updateBin.
 * @returns Result from updateBin.
 */
async function updateBin(prisma: PrismaClient, id: string, data: Partial<BinFormValues>) {
  return prisma.bin.update({ where: { id }, data })
}

export { updateBin }
