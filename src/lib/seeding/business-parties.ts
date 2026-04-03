import { type PrismaClient } from '@/generated/prisma'

import { customers, suppliers } from './mocks/business-parties'

const allParties = [...suppliers, ...customers]

export async function seedBusinessParties(prisma: PrismaClient) {
  await prisma.businessParty.createMany({
    data: allParties.map((entry) => entry.party),
    skipDuplicates: true
  })

  await prisma.contactPerson.createMany({
    data: allParties.map((entry) => entry.contact),
    skipDuplicates: true
  })

  await prisma.address.createMany({
    data: allParties.map((entry) => entry.address),
    skipDuplicates: true
  })

  return {
    partiesCount: allParties.length,
    suppliersCount: suppliers.length,
    customersCount: customers.length,
    contactsCount: allParties.length,
    addressesCount: allParties.length
  }
}
