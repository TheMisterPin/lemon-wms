import 'dotenv/config'
import { seedBinStockItems } from '@/lib/seeding/seed-bin-stock-items'
import prisma from '../src/lib/prisma'

async function runSeedStock() {
  console.warn('Seeding stock...\n')

  const result = await seedBinStockItems(prisma)
  console.warn(`Seeded ${result.count} bin stock items.`)
  console.warn(`Seeded ${result.seededByBin?.length} bins.`)
  console.warn('Done.')
}

runSeedStock()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
