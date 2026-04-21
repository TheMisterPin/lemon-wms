import type { PrismaClient } from '@/generated/prisma'

export interface DeviceSearchFilters {
  code?: string
  name?: string
  warehouseId?: string
  zoneId?: string
  authorized?: boolean
  isActive?: boolean
}

async function isAuthorizedDevice(prisma: PrismaClient, code: string) {
  const device = await prisma.device.findUnique({
    where: { code }
  })

  return device?.authorized ?? false
}

async function getDeviceByCode(prisma: PrismaClient, code: string) {
  const device = await prisma.device.findFirst({ where: { code } })
  if (!device) {
    throw new Error(`Device with code ${code} not found`)
  }

  return device
}

async function getDeviceByName(prisma: PrismaClient, name: string) {
  const device = await prisma.device.findFirst({ where: { name } })
  if (!device) {
    throw new Error(`Device with name ${name} not found`)
  }

  return device
}

async function getFilteredDevices(prisma: PrismaClient, filters?: DeviceSearchFilters) {
  const where = Object.fromEntries(
    Object.entries(filters ?? {}).filter(([, value]) => value !== undefined)
  )

  return prisma.device.findMany({
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
}

async function getAllDevices(prisma: PrismaClient) {
  return prisma.device.findMany({
    orderBy: {
      registeredAt: 'desc'
    }
  })
}

export { isAuthorizedDevice, getDeviceByCode, getDeviceByName, getFilteredDevices, getAllDevices }
