import type { PrismaClient } from '@/generated/prisma'
import type { BinFormValues } from '@/lib/schemas/bin'

async function updateBin(prisma: PrismaClient, id: string, data: Partial<BinFormValues>) {
  return prisma.bin.update({ where: { id }, data })
}

export { updateBin }
