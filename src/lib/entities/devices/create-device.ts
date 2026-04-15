import type { PrismaClient, DeviceType } from '@/generated/prisma'

interface DeviceFormValues {
  id?: string
  code: string
  name: string
  warehouseId: string | null
  zoneId: string | null
  authorized: boolean
  isActive: boolean
  type?: DeviceType
}

/**
 * upsertDevice.
 * @param prisma - Parameter for upsertDevice.
 * @param name - Parameter for upsertDevice.
 * @returns Result from upsertDevice.
 */
async function upsertDevice(prisma: PrismaClient, name: string) {
  await prisma.device.upsert({
    where: { name },
    update: {},
    create: {
      name,
      code: name,
      warehouseId: null,
      zoneId: null,
      authorized: false,
      isActive: true,
      type: 'FLOOR'
    }
  })

  return prisma.device.findUnique({ where: { name } })
}

/**
 * createDevice.
 * @param prisma - Parameter for createDevice.
 * @param data - Parameter for createDevice.
 * @returns Result from createDevice.
 */
async function createDevice(prisma: PrismaClient, data: DeviceFormValues) {
  return prisma.device.create({ data })
}

export { createDevice, upsertDevice }
