
import { type PrismaClient } from '@/generated/prisma'
import { zones } from './mocks/zones-mock'

export async function seedZones(prisma: PrismaClient) {
  await prisma.zone.createMany({
    data: zones,
    skipDuplicates: true
  })

  return { count: zones.length }
}
