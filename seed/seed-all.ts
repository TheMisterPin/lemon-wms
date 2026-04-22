import 'dotenv/config'
import { seedDB } from './lib/seed'
import prisma from '../src/lib/prisma'

async function runSeedDB() {
  console.warn('Seeding Database...\n')

  await seedDB(prisma)
  console.warn('Done.')
}

runSeedDB()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
