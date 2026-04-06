import type { PrismaClient } from '@/generated/prisma'

async function getItemsInBin(
  prisma: PrismaClient,
  binId: string,
  onlyAvailable: boolean = false
) {
  const baseSelect = {
    id: true,
    description: true,
    itemId: true,
    lotId: true,
    boxId: true,
    serialNumberId: true,
    uom: true,
    quantityAvailable: true,
    quantityReserved: true,
    quantityBlocked: true
  } as const

  const itemsInBin = await prisma.binStockItem.findMany({
    where: {
      binId,
      ...(onlyAvailable && { quantityAvailable: { gt: 0 } })
    },
    select: onlyAvailable
      ? baseSelect
      : { ...baseSelect, quantityBlocked: true, quantityReserved: true },
    orderBy: { createdAt: 'desc' }
  })

  return itemsInBin
}

export { getItemsInBin }
