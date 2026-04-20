import type { PrismaClient } from '@/generated/prisma'

export async function seedDemoDevice(prisma: PrismaClient) {

  await prisma.device.upsert({
    where: { name: 'DEMO' },
    create: {
      name: 'DEMO',
      code: 'DEMO',
      warehouseId: 'WH-0002',
      zoneId: 'ZN-0001-0002',
      authorized: true,
      isActive: true,
      type: 'FLOOR',
      registeredAt: new Date(),
      lastSeenAt: new Date(),
      loginMode: 'PIN',
      lastUserId: 'USR-0000'
    },
    update: {}
  })
}
