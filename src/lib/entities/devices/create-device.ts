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

async function createDevice(prisma: PrismaClient, data: DeviceFormValues) {
  return prisma.device.create({ data })
}

export { createDevice, upsertDevice }
