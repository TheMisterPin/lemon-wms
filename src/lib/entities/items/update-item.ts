import { Prisma } from '@/generated/prisma'
import type { PrismaClient } from '@/generated/prisma'
import type { ItemFormValues } from '@/lib/components/configs/entities/item/types'

import { validateItemRelations } from './validate-item-relations'

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
