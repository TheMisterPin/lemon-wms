import type { Device, PrismaClient, DeviceType } from '@/generated/prisma'

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

/**
 * Floor login sends deviceCode — schema treats `code` as the typed/scanned identifier.
 * Resolve by code or display name so login works when the two differ.
 */
async function upsertDevice(prisma: PrismaClient, identifier: string): Promise<Device | null> {
  const trimmed = identifier.trim()
  if (!trimmed) {
    return null
  }

  const exactMatch = await prisma.device.findFirst({
    where: {
      OR: [{ code: trimmed }, { name: trimmed }]
    }
  })

  if (exactMatch) {
    return exactMatch
  }

  const existing = await prisma.device.findFirst({
    where: {
      OR: [
        { code: { equals: trimmed, mode: 'insensitive' as const } },
        { name: { equals: trimmed, mode: 'insensitive' as const } }
      ]
    },
    orderBy: [{ authorized: 'desc' }, { code: 'asc' }]
  })

  if (existing) {
    return existing
  }

  await prisma.device.create({
    data: {
      name: trimmed,
      code: trimmed,
      warehouseId: null,
      zoneId: null,
      authorized: false,
      isActive: true,
      type: 'FLOOR'
    }
  })

  return prisma.device.findUnique({ where: { code: trimmed } })
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
