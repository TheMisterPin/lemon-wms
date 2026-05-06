import 'dotenv/config'
import { seedWarehouses } from './lib/warehouses'
import prisma from '../src/lib/prisma'

async function runSeedWarehouses() {
  console.warn('Seeding warehouses...\n')

  const result = await seedWarehouses(prisma)

  console.warn(`Seeded ${result.count} warehouses.`)
  console.warn('Done.')
}

runSeedWarehouses()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
