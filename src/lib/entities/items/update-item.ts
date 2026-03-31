import { Prisma } from '@/generated/prisma'
import type { PrismaClient } from '@/generated/prisma'
import type { ItemFormValues } from '@/lib/components/configs/entities/item/types'

async function updateItem(prisma: PrismaClient, id: string, data: Partial<ItemFormValues>) {
  const { dimensions, ...rest } = data

  return prisma.wARItem.update({
    where: { id },
    data: {
      ...rest,
      ...(dimensions !== undefined
        ? {
            dimensions: dimensions != null
              ? (dimensions as Prisma.InputJsonValue)
              : Prisma.JsonNull
          }
        : {})
    }
  })
}

export { updateItem }
