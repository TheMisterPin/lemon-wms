import { type PrismaClient } from '@/generated/prisma'
import { seedBins } from './bins'
import { seedUsers } from './users'
import { seedWarehouses } from './warehouses'
import { seedZones } from './zones'

export async function seedDB(prisma : PrismaClient) {
  console.warn('Clearing existing data...\n')
  await prisma.userActivityEntry.deleteMany()
  console.warn('Cleared activities.')
  await prisma.bin.deleteMany()
  console.warn('Cleared bins.')
  await prisma.zone.deleteMany()
  console.warn('Cleared zones.')
  await prisma.user.deleteMany()
  console.warn('Cleared users.')
  await prisma.warehouse.deleteMany()
  console.warn('Cleared warehouses.\n')
  console.warn('Existing data cleared.\n')
  console.warn('Seeding new data...\n')

  console.warn('Seeding warehouses...')
  const warehouses = await seedWarehouses(prisma)
  console.warn(`Seeded ${warehouses.count} warehouses.\n`)

  console.warn('Seeding zones...')
  const zones = await seedZones(prisma)
  console.warn(`Seeded ${zones.count} zones.\n`)

  console.warn('Seeding bins...')
  const bins = await seedBins(prisma)
  console.warn(`Seeded ${bins.count} bins.\n`)

  console.warn('Seeding users...')
  const users = await seedUsers(prisma)
  console.warn(`Seeded ${users.count} users.\n`)

  return { warehousesSeeded: warehouses.count, zonesSeeded: zones.count, binsSeeded: bins.count, usersSeeded: users.count }
}
