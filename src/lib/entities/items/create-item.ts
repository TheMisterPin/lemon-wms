import { Prisma } from '@/generated/prisma'
import type { PrismaClient } from '@/generated/prisma'
import type { ItemFormValues } from '@/lib/components/configs/entities/item/types'

async function createItem(prisma: PrismaClient, data: ItemFormValues) {
  const { dimensions, ...rest } = data

  return prisma.wARItem.create({
    data: {
      ...rest,
      dimensions: dimensions != null
        ? (dimensions as Prisma.InputJsonValue)
        : Prisma.JsonNull
    }
  })
}

export { createItem }
