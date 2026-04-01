
import { type PrismaClient } from '@/generated/prisma'
import { bins } from './mocks/bins-mock'

export async function seedBins(prisma: PrismaClient) {
  await prisma.bin.createMany({
    data: bins,
    skipDuplicates: true // optional but useful for seeding
  })

  return { count: bins.length }
}
