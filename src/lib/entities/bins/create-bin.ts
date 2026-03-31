import type { PrismaClient } from '@/generated/prisma'
import type { BinFormValues } from '@/lib/components/configs/entities/bin/types'

async function createBin(prisma: PrismaClient, data: BinFormValues) {
  return prisma.bin.create({ data })
}

export { createBin }
