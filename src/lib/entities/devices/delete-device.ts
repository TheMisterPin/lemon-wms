import type { PrismaClient } from '@/generated/prisma'

async function deleteDevice(prisma: PrismaClient, code : string) {
  return prisma.device.delete({
    where: { code }
  })
}

export { deleteDevice }
