import type { PrismaClient } from '@/generated/prisma'
import { BusinessPartyType } from '@/generated/prisma'

/**
 * getAllVendors.
 * @param prisma - Parameter for getAllVendors.
 * @returns Result from getAllVendors.
 */
async function getAllVendors(prisma: PrismaClient) {
  const vendors = await prisma.businessParty.findMany({
    where: {
      type: BusinessPartyType.SUPPLIER,
      isActive: true
    },
    select: {
      id: true,
      name: true
    },
    orderBy: { name: 'asc' }
  })

  return vendors
}

export { getAllVendors }
