import type { PrismaClient } from '@/generated/prisma'

async function loginUserInDevice(prisma: PrismaClient, code: string, userId: string) {
  await prisma.device.update({
    where: { code },
    data: { lastUserId: userId }
  })
  await prisma.user.update({
    where: { id: userId },
    data: { lastLoginDeviceId: code }
  })
}

async function logoutUserFromDevice(prisma: PrismaClient, code: string, userId: string) {
  await prisma.device.update({
    where: { code },
    data: { lastUserId: null }
  })
  await prisma.user.update({
    where: { id: userId },
    data: { lastLoginDeviceId: null }
  })
}

export { loginUserInDevice, logoutUserFromDevice }
