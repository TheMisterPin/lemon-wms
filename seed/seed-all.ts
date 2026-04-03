import { PrismaClient } from '../src/generated/prisma'
import { seedItemsAndUOMs } from '../src/lib/seeding/items'
import { seedLocations } from '../src/lib/seeding/locations'
import { seedUsers } from '../src/lib/seeding/users'

const prisma = new PrismaClient()

async function main() {
  console.log('=== Lemon WMS — Full Database Seed ===\n')

  // 1. Units of measure + categories + 1000 items
  console.log('Step 1/3 — UOMs, categories and items...')
  const items = await seedItemsAndUOMs(prisma, 1000)
  console.log(`  ✓ ${items.uomsSeeded} units of measure`)
  console.log(`  ✓ ${items.categoriesSeeded} categories`)
  console.log(`  ✓ ${items.itemsCreated} items created, ${items.itemsSkipped} skipped`)

  // 2. Warehouses → zones → bins
  console.log('\nStep 2/3 — Warehouses, zones and bins...')
  const locations = await seedLocations(prisma)
  console.log(`  ✓ ${locations.warehousesCreated} warehouses`)
  console.log(`  ✓ ${locations.zonesCreated} zones`)
  console.log(`  ✓ ${locations.binsCreated} bins`)

  // 3. Users (office + floor staff for every warehouse)
  console.log('\nStep 3/3 — Users...')
  const users = await seedUsers(prisma)
  console.log(`  ✓ ${users.usersSeeded} users`)

  console.log('\n=== Seed complete ===')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
