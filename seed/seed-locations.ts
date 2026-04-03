import { PrismaClient } from '../src/generated/prisma'
import { seedLocations } from '../src/lib/seeding/locations'

const prisma = new PrismaClient()

async function main() {
  console.log('Seeding warehouses, zones and bins...\n')
  const result = await seedLocations(prisma)
  console.log(`  ✓ ${result.warehousesCreated} warehouses`)
  console.log(`  ✓ ${result.zonesCreated} zones`)
  console.log(`  ✓ ${result.binsCreated} bins`)
  console.log('\nDone.')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
