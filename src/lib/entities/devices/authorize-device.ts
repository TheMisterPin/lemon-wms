import type { PrismaClient } from '@/generated/prisma'

interface AuthorizeDeviceParams {
  code: string
  warehouseId: string
  zoneId: string
  userId: string
}

async function isAuthorizedDevice(prisma: PrismaClient, code: string) {
  const device = await prisma.device.findUnique({
    where: { code }
  })

  return device?.authorized ?? false
}

async function authorizeDevice(prisma: PrismaClient, params : AuthorizeDeviceParams) {
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

async function  loginUserInDevice(prisma: PrismaClient, code: string, userId: string) {
  await prisma.device.update({
    where: { code },
    data: { lastUserId: userId }
  })
  await prisma.user.update({
    where: { id: userId },
    data: { lastLoginDeviceId: code }
  })
}

async function  logoutUserFromDevice(prisma: PrismaClient, code: string, userId: string) {
  await prisma.device.update({
    where: { code },
    data: { lastUserId: null }
  })
  await prisma.user.update({
    where: { id: userId },
    data: { lastLoginDeviceId: null }
  })
}

export { isAuthorizedDevice, authorizeDevice, deauthorizeDevice, loginUserInDevice, logoutUserFromDevice }
