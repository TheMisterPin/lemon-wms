import type { PrismaClient } from '@/generated/prisma'

interface AuthorizeDeviceParams {
  code: string
  warehouseId: string
  zoneId: string
}

async function isAuthorizedDevice(prisma: PrismaClient, code: string) {
  const device = await prisma.device.findUnique({
    where: { code }
  })

  return device?.authorized ?? false
}

async function authorizeDevice(prisma: PrismaClient, params : AuthorizeDeviceParams) {
  await prisma.device.update({
    where: { code: params.code },
    data: { authorized: true, warehouseId: params.warehouseId, zoneId: params.zoneId }
  })
}

async function deauthorizeDevice(prisma: PrismaClient, code: string) {
  await prisma.device.update({
    where: { code },
    data: { authorized: false, warehouseId: '', zoneId: '' }
  })
}

async function  loginUserInDevice(prisma: PrismaClient, code: string, userId: string) {
  await prisma.device.update({
    where: { code },
    data: { lastUser: { connect: { id: userId } } }
  })
  await prisma.user.update({
    where: { id: userId },
    data: { lastLoginDevice: { connect: { code } } }
  })
}

async function  logoutUserFromDevice(prisma: PrismaClient, code: string, userId: string) {
  await prisma.device.update({
    where: { code },
    data: { lastUser: { disconnect: true } }
  })
  await prisma.user.update({
    where: { id: userId },
    data: { lastLoginDevice: { disconnect: true } }
  })
}

export { isAuthorizedDevice, authorizeDevice, deauthorizeDevice, loginUserInDevice, logoutUserFromDevice }
