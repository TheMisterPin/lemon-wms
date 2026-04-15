import type { PrismaClient } from '@/generated/prisma'

interface AuthorizeDeviceParams {
  code: string
  warehouseId: string
  zoneId: string
  userId: string
}

/**
 * isAuthorizedDevice.
 * @param prisma - Parameter for isAuthorizedDevice.
 * @param code - Parameter for isAuthorizedDevice.
 * @returns Result from isAuthorizedDevice.
 */
async function isAuthorizedDevice(prisma: PrismaClient, code: string) {
  const device = await prisma.device.findUnique({
    where: { code }
  })

  return device?.authorized ?? false
}

/**
 * authorizeDevice.
 * @param prisma - Parameter for authorizeDevice.
 * @param params - Parameter for authorizeDevice.
 * @returns Result from authorizeDevice.
 */
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

/**
 * deauthorizeDevice.
 * @param prisma - Parameter for deauthorizeDevice.
 * @param code - Parameter for deauthorizeDevice.
 * @returns Result from deauthorizeDevice.
 */
async function deauthorizeDevice(prisma: PrismaClient, code: string) {
  await prisma.device.update({
    where: { code },
    data: { authorized: false, warehouseId: null, zoneId: null, lastUserId: null }
  })
}

/**
 * loginUserInDevice.
 * @param prisma - Parameter for loginUserInDevice.
 * @param code - Parameter for loginUserInDevice.
 * @param userId - Parameter for loginUserInDevice.
 * @returns Result from loginUserInDevice.
 */
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

/**
 * logoutUserFromDevice.
 * @param prisma - Parameter for logoutUserFromDevice.
 * @param code - Parameter for logoutUserFromDevice.
 * @param userId - Parameter for logoutUserFromDevice.
 * @returns Result from logoutUserFromDevice.
 */
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
