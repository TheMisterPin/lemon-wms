import type { PrismaClient } from '@/generated/prisma'

interface DeviceSearchFilters {
  code?: string
  name?: string
  warehouseId?: string
  zoneId?: string
  authorized?: boolean
  isActive?: boolean
}

async function getFilteredDevices(prisma: PrismaClient, filters?: DeviceSearchFilters) {
  const where = Object.fromEntries(
    Object.entries(filters ?? {}).filter(([, value]) => value !== undefined)
  )

  const devices = await prisma.device.findMany({
    where,
    select: {
      id: true,
      name: true,
      code: true,
      warehouseId: true,
      zoneId: true,
      authorized: true,
      isActive: true,
      type: true,
      registeredAt: true,
      warehouse: {
        select: {
          name: true
        }
      },
      zone: {
        select: {
          name: true
        }
      }
    },
    orderBy: {
      registeredAt: 'desc'
    }
  })

  return devices
}

async function getAllDevices(prisma: PrismaClient) {
  const devices = await prisma.device.findMany({
    orderBy: {
      registeredAt: 'desc'
    }
  })

  return devices
}

export { getAllDevices, getFilteredDevices }
