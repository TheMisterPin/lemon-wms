
import { type PrismaClient } from '@/generated/prisma'
import { zones } from './mocks/zones-mock'

/**
 * seedZones.
 * @param prisma - Parameter for seedZones.
 * @returns Result from seedZones.
 */
export async function seedZones(prisma: PrismaClient) {
  await prisma.zone.createMany({
    data: zones,
    skipDuplicates: true
  })

  return { count: zones.length }
}
