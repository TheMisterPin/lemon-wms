import { Prisma } from '@/generated/prisma'
import type { PrismaClient } from '@/generated/prisma'
import type { ItemFormValues } from '@/lib/schemas/item'

import { validateItemRelations } from './validate-item-relations'

/**
 * updateItem.
 * @param prisma - Parameter for updateItem.
 * @param id - Parameter for updateItem.
 * @param data - Parameter for updateItem.
 * @returns Result from updateItem.
 */
async function updateItem(prisma: PrismaClient, id: string, data: Partial<ItemFormValues>) {
  const { dimensions, ...rest } = data

  await validateItemRelations(prisma, {
    uom: data.uom,
    categoryId: data.categoryId,
    supplierId: data.supplierId ?? undefined
  })

  return prisma.item.update({
    where: { id },
    data: {
      ...rest,
      ...(dimensions !== undefined
        ? {
          dimensions: dimensions !== null
            ? (dimensions as Prisma.InputJsonValue)
            : Prisma.JsonNull
        }
        : {})
    }
  })
}

export { updateItem }
