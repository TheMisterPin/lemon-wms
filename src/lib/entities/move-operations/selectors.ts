import type { Prisma } from '@/generated/prisma'

export async function resolveTransitBinId(tx: Prisma.TransactionClient, warehouseId: string): Promise<string> {
  const transitBin = await tx.bin.findFirst({
    where: {
      warehouseId,
      deletedAt: null,
      isBlocked: false,
      type: 'STAGING'
    },
    select: { id: true },
    orderBy: { createdAt: 'asc' }
  })

  if (!transitBin) {
    throw new Error('No available staging bin found for transit operations')
  }

  return transitBin.id
}
