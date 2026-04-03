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

  const devices = await prisma.device.findMany({ where })
  if (!devices || devices.length === 0) {
    throw new Error('No devices found with the provided filters')
  }

  return devices
}

async function getAllDevices(prisma: PrismaClient) {
  const devices = await prisma.device.findMany()
  if (!devices || devices.length === 0) {
    throw new Error('No devices found with the provided filters')
  }

  return devices
}

export { getAllDevices, getFilteredDevices }
