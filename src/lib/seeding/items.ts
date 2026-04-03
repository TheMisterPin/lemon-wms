import { type PrismaClient } from '@/generated/prisma'

import { itemCategories, items } from './mocks/items-mock'

export async function seedItems(prisma: PrismaClient) {
  await prisma.itemCategory.createMany({
    data: itemCategories,
    skipDuplicates: true
  })

  await prisma.item.createMany({
    data: items,
    skipDuplicates: true
  })

  return { categoriesCount: itemCategories.length, itemsCount: items.length }
}
