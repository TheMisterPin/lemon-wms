import { Prisma } from '@/generated/prisma'
import type { PrismaClient } from '@/generated/prisma'
import type { ZoneFormValues } from '@/lib/schemas/zone'

async function updateZone(
  prisma: PrismaClient,
  id: string,
  data: Partial<ZoneFormValues>
) {
  const { customPermissions, ...rest } = data

  return prisma.zone.update({
    where: { id },
    data: {
      ...rest,
      ...(customPermissions !== undefined
        ? {
          customPermissions: customPermissions !== null
            ? (customPermissions as Prisma.InputJsonValue)
            : Prisma.JsonNull
        }
        : {})
    }
  })
}

export { updateZone }
