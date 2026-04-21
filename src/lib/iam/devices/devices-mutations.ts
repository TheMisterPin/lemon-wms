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

interface AuthorizeDeviceParams {
  code: string
  warehouseId: string
  zoneId: string
  userId: string
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

async function authorizeDevice(prisma: PrismaClient, params: AuthorizeDeviceParams) {
  const { warehouseId, zoneId, code, userId } = params

  if (!warehouseId || !zoneId || !code || !userId) {
    throw new Error('Missing required parameters to authorize device.')
  }

  await prisma.device.update({
    where: { code },
    data: { authorized: true, warehouseId, zoneId, lastUserId: userId }
  })
}

async function deauthorizeDevice(prisma: PrismaClient, code: string) {
  await prisma.device.update({
    where: { code },
    data: { authorized: false, warehouseId: null, zoneId: null, lastUserId: null }
  })
}

async function deleteDevice(prisma: PrismaClient, code: string) {
  return prisma.device.delete({
    where: { code }
  })
}

export { upsertDevice, createDevice, authorizeDevice, deauthorizeDevice, deleteDevice }
