import { PrismaClient } from '../src/generated/prisma'
import { seedItemsAndUOMs } from '../src/lib/seeding/items'

const prisma = new PrismaClient()

async function main() {
  console.log('Seeding UOMs, categories and items...\n')
  const result = await seedItemsAndUOMs(prisma, 1000)
  console.log(`  ✓ ${result.uomsSeeded} units of measure`)
  console.log(`  ✓ ${result.categoriesSeeded} categories`)
  console.log(`  ✓ ${result.itemsCreated} items created, ${result.itemsSkipped} skipped`)
  console.log('\nDone.')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
