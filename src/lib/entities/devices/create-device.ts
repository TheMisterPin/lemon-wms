import type { PrismaClient } from '@/generated/prisma'

interface DeviceFormValues {
  id?: string
  code: string
  name: string
  warehouseId: string
  zoneId: string
  authorized: boolean
  isActive: boolean
}

async function upsertDevice(prisma: PrismaClient, name: string) {
  await prisma.device.upsert({
    where: { name },
    update: {},
    create: {
      name,
      code: name,
      warehouseId: '',
      zoneId: '',
      authorized: false,
      isActive: true,
      type: 'FLOOR'
    }
  })
}

async function createDevice(prisma: PrismaClient, data: DeviceFormValues) {
  return prisma.device.create({ data })
}

export { createDevice, upsertDevice }
