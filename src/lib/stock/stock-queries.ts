import type { PrismaClient } from '@/generated/prisma'

async function getItemsInBin(
  prisma: PrismaClient,
  binId: string,
  onlyAvailable: boolean = false
) {
  const baseSelect = {
    id: true,
    name: true,
    sku: true,
    lotId: true,
    boxId: true,
    serialNumberId: true,
    uom: true,
    quantityAvailable: true,
    quantityReserved: true,
    quantityBlocked: true
  } as const

  return prisma.binStockItem.findMany({
    where: {
      binId,
      ...(onlyAvailable && { quantityAvailable: { gt: 0 } })
    },
    select: onlyAvailable
      ? baseSelect
      : { ...baseSelect, quantityBlocked: true, quantityReserved: true },
    orderBy: { createdAt: 'desc' }
  })
}

export { getItemsInBin }
