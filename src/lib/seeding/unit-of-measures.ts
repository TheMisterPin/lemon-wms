import { type PrismaClient } from '@/generated/prisma'

import { unitsOfMeasure } from './mocks/unit-of-measures-mock'

export async function seedUnitsOfMeasure(prisma: PrismaClient) {
  await prisma.unitOfMeasure.createMany({
    data: unitsOfMeasure,
    skipDuplicates: true
  })

  return { count: unitsOfMeasure.length }
}
