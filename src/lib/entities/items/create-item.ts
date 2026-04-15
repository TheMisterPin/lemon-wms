import { Prisma } from '@/generated/prisma'
import type { PrismaClient } from '@/generated/prisma'
import type { ItemFormValues } from '@/lib/schemas/item'

import { validateItemRelations } from './validate-item-relations'

/**
 * createItem.
 * @param prisma - Parameter for createItem.
 * @param data - Parameter for createItem.
 * @returns Result from createItem.
 */
async function createItem(prisma: PrismaClient, data: ItemFormValues) {
  const { dimensions, ...rest } = data

  await validateItemRelations(prisma, {
    uom: data.uom,
    categoryId: data.categoryId,
    supplierId: data.supplierId ?? undefined
  })

  return prisma.item.create({
    data: {
      ...rest,
      dimensions: dimensions !== null
        ? (dimensions as Prisma.InputJsonValue)
        : Prisma.JsonNull
    }
  })
}

export { createItem }
