import type { PrismaClient } from '@/generated/prisma'

async function deleteZone(prisma: PrismaClient, id: string) {
  return prisma.zone.update({
    where: { id },
    data: { deletedAt: new Date(), isActive: false }
  })
}

export { deleteZone }
