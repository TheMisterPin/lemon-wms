import 'dotenv/config'
import prisma from '../src/lib/prisma'
import { seedDB } from '../src/lib/seeding/seed'

async function main() {
  console.warn('=== Lemon WMS — Full Database Seed ===\n')
  const result = await seedDB(prisma)
  console.warn('=== Seed complete ===')
  console.warn(JSON.stringify(result, null, 2))
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
