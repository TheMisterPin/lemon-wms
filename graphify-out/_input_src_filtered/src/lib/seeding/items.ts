import { type PrismaClient } from '@/generated/prisma'

import { suppliers } from './mocks/business-parties'
import { items } from './mocks/items-mock'

/**
 * seedItems.
 * @param prisma - Parameter for seedItems.
 * @returns Result from seedItems.
 */
export async function seedItems(prisma: PrismaClient) {
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
  const itemsWithSuppliers = items.map((item, index) => ({
    ...item,
    supplierId: suppliers[index % suppliers.length].party.id
  }))

  await prisma.item.createMany({
    data: itemsWithSuppliers,
    skipDuplicates: true
  })

  return { itemsCount: itemsWithSuppliers.length }

}
