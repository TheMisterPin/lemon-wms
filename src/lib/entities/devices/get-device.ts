import type { PrismaClient } from '@/generated/prisma'

/**
 * getDeviceByCode.
 * @param prisma - Parameter for getDeviceByCode.
 * @param code - Parameter for getDeviceByCode.
 * @returns Result from getDeviceByCode.
 */
async function getDeviceByCode(prisma: PrismaClient, code: string) {
  const device = await prisma.device.findFirst({ where: { code } })
  if (!device) {
    throw new Error(`Device with code ${code} not found`)
  }

  return device
}

/**
 * getDeviceByName.
 * @param prisma - Parameter for getDeviceByName.
 * @param name - Parameter for getDeviceByName.
 * @returns Result from getDeviceByName.
 */
async function getDeviceByName(prisma: PrismaClient, name: string) {
  const device = await prisma.device.findFirst({ where: { name } })
  if (!device) {
    throw new Error(`Device with name ${name} not found`)
  }

  return device
}

export { getDeviceByCode, getDeviceByName }
