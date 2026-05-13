
import { type PrismaClient } from '@/generated/prisma'
import { bins, zoneDefaultBinPointers } from './mocks/bins-mock'

/**
 * seedBins.
 * @param prisma - Parameter for seedBins.
 * @returns Result from seedBins.
 */
export async function seedBins(prisma: PrismaClient) {
  await prisma.bin.createMany({
    data: bins,
    skipDuplicates: true // optional but useful for seeding
  })

  await Promise.all(
    zoneDefaultBinPointers.map((z) =>
      prisma.zone.update({
        where: { id: z.zoneId },
        data: {
          defaultReceivingBinId: z.defaultReceivingBinId,
          defaultQuarantineBinId: z.defaultQuarantineBinId,
          defaultOutgoingBinId: z.defaultOutgoingBinId
        }
      })
    )
  )

  return { count: bins.length }
}
