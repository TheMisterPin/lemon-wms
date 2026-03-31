import { Prisma } from '@/generated/prisma'
import type { PrismaClient } from '@/generated/prisma'
import type { ZoneFormValues } from '@/lib/components/configs/entities/zone/types'

async function createZone(prisma: PrismaClient, data: ZoneFormValues) {
  const { customPermissions, ...rest } = data

  return prisma.zone.create({
    data: {
      ...rest,
      customPermissions: customPermissions != null
        ? (customPermissions as Prisma.InputJsonValue)
        : Prisma.JsonNull
    }
  })
}

export { createZone }
