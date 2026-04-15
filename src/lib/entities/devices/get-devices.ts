import type { PrismaClient } from '@/generated/prisma'

interface DeviceSearchFilters {
  code?: string
  name?: string
  warehouseId?: string
  zoneId?: string
  authorized?: boolean
  isActive?: boolean
}

/**
 * getFilteredDevices.
 * @param prisma - Parameter for getFilteredDevices.
 * @param filters? - Parameter for getFilteredDevices.
 * @returns Result from getFilteredDevices.
 */
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

/**
 * getAllDevices.
 * @param prisma - Parameter for getAllDevices.
 * @returns Result from getAllDevices.
 */
async function getAllDevices(prisma: PrismaClient) {
  const devices = await prisma.device.findMany({
    orderBy: {
      registeredAt: 'desc'
    }
  })

  return devices
}

export { getAllDevices, getFilteredDevices }
