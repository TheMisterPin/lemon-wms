import type { PrismaClient } from '@/generated/prisma'

/**
 * deleteDevice.
 * @param prisma - Parameter for deleteDevice.
 * @param code - Parameter for deleteDevice.
 * @returns Result from deleteDevice.
 */
async function deleteDevice(prisma: PrismaClient, code : string) {
  return prisma.device.delete({
    where: { code }
  })
}

export { deleteDevice }
