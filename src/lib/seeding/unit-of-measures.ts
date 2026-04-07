import { type PrismaClient } from '@/generated/prisma'

export async function seedUnitsOfMeasure(prisma: PrismaClient) {
  await prisma.unitOfMeasure.upsert(
    { where: { id: 'PC' }, update: {
      id: 'PC',
      description: 'Pieces',
      decimalRound: 0
    }, create: {
      id: 'PC',
      description: 'Pieces',
      decimalRound: 0
    } }
  )
  await prisma.unitOfMeasure.upsert(
    { where: { id: 'PCS' }, update: {
      id: 'PCS',
      description: 'Pieces',
      decimalRound: 0
    }, create: {
      id: 'PCS',
      description: 'Pieces',
      decimalRound: 0
    } }
  )
  await prisma.unitOfMeasure.upsert(
    { where: { id: 'KGS' }, update: {
      id: 'KGS',
      description: 'Kilograms',
      decimalRound: 3
    }, create: {
      id: 'KGS',
      description: 'Kilograms',
      decimalRound: 0
    } }
  )
  await prisma.unitOfMeasure.upsert(
    { where: { id: 'MT' }, update: {
      id: 'MT',
      description: 'Meters',
      decimalRound: 3
    }, create: {
      id: 'MT',
      description: 'Meters',
      decimalRound: 3
    } }
  )

  return { count: 4 }

}
