import { type PrismaClient } from '@/generated/prisma'

import { seedItemsAndUOMs } from './items'
import { customers, suppliers } from './mocks/business-parties-mock'
import { seedBins } from './bins'
import { seedUsers } from './users'
import { seedWarehouses } from './warehouses'
import { seedZones } from './zones'

export async function seedDB(prisma: PrismaClient) {
  // -------------------------------------------------------------------------
  // 1. UOMs + item categories + 1,000 items
  // -------------------------------------------------------------------------
  console.warn('Seeding UOMs, categories and items...')
  const itemResult = await seedItemsAndUOMs(prisma, 1000)
  console.warn(`  ✓ ${itemResult.uomsSeeded} UOMs`)
  console.warn(`  ✓ ${itemResult.categoriesSeeded} categories`)
  console.warn(`  ✓ ${itemResult.itemsCreated} items\n`)

  // -------------------------------------------------------------------------
  // 2. Business parties (suppliers + customers)
  // -------------------------------------------------------------------------
  console.warn('Seeding business parties...')
  for (const row of [...suppliers, ...customers]) {
    await prisma.businessParty.upsert({
      where:  { id: row.party.id },
      update: {},
      create: row.party,
    })
    await prisma.contactPerson.upsert({
      where:  { id: row.contact.id },
      update: {},
      create: row.contact,
    })
    await prisma.address.upsert({
      where:  { id: row.address.id },
      update: {},
      create: row.address,
    })
  }
  console.warn(`  ✓ ${suppliers.length} suppliers, ${customers.length} customers\n`)

  // -------------------------------------------------------------------------
  // 3. Warehouses → zones → bins
  // -------------------------------------------------------------------------
  console.warn('Seeding warehouses...')
  const warehouses = await seedWarehouses(prisma)
  console.warn(`  ✓ ${warehouses.count} warehouses\n`)

  console.warn('Seeding zones...')
  const zones = await seedZones(prisma)
  console.warn(`  ✓ ${zones.count} zones\n`)

  console.warn('Seeding bins...')
  const bins = await seedBins(prisma)
  console.warn(`  ✓ ${bins.count} bins\n`)

  // -------------------------------------------------------------------------
  // 4. Users
  // -------------------------------------------------------------------------
  console.warn('Seeding users...')
  const users = await seedUsers(prisma)
  console.warn(`  ✓ ${users.count} users\n`)

  return {
    uomsSeeded:       itemResult.uomsSeeded,
    categoriesSeeded: itemResult.categoriesSeeded,
    itemsSeeded:      itemResult.itemsCreated,
    suppliersSeeded:  suppliers.length,
    customersSeeded:  customers.length,
    warehousesSeeded: warehouses.count,
    zonesSeeded:      zones.count,
    binsSeeded:       bins.count,
    usersSeeded:      users.count,
  }
}
