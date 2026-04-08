import type { PrismaClient } from '@/generated/prisma'
import { BusinessPartyType } from '@/generated/prisma'

async function getItemsForVendor(prisma: PrismaClient, businessPartyId: string) {
  const supplier = await prisma.businessParty.findFirst({
    where: {
      id: businessPartyId,
      type: BusinessPartyType.SUPPLIER,
      isActive: true
    },
    select: { id: true }
  })

  if (!supplier) {
    return null
  }

  const items = await prisma.item.findMany({
    where: {
      supplierId: businessPartyId,
      isActive: true,
      deletedAt: null
    },
    select: {
      sku: true,
      name: true,
      uom: true
    },
    orderBy: { name: 'asc' }
  })

  return items
}

export { getItemsForVendor }
