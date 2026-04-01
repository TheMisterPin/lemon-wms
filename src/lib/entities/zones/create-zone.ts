import { Prisma } from '@/generated/prisma'
import type { PrismaClient } from '@/generated/prisma'
import type { ZoneFormValues } from '@/lib/components/configs/entities/zone/types'
import { generateZoneSerial } from '@/utils/serials'

async function createZone(prisma: PrismaClient, data: ZoneFormValues) {
  const { customPermissions, ...rest } = data
  const newID = await generateZoneSerial(prisma, data.warehouseId)
  const zoneData = { ...rest, id: newID }

  return prisma.zone.create({
    data: {
      ...zoneData,
      customPermissions: customPermissions !== null
        ? (customPermissions as Prisma.InputJsonValue)
        : Prisma.JsonNull
    }
  })
}

export { createZone }
