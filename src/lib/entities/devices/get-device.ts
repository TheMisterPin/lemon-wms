import type { PrismaClient } from '@/generated/prisma'

async function getDeviceByCode(prisma: PrismaClient, code: string) {
  const device = await prisma.device.findFirst({ where: { code } })
  if (!device) {
    throw new Error(`Device with code ${code} not found`)
  }

  return device
}

async function getDeviceByName(prisma: PrismaClient, name: string) {
  const device = await prisma.device.findFirst({ where: { name } })
  if (!device) {
    throw new Error(`Device with name ${name} not found`)
  }

  return device
}

export { getDeviceByCode, getDeviceByName }
