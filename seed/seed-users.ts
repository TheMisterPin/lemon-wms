import 'dotenv/config'
import { seedUsers } from './lib/users'
import prisma from '../src/lib/prisma'

async function runSeedUsers() {
  console.warn('Seeding users...\n')

  const result = await seedUsers(prisma)
  console.warn(`Seeded ${result.count} users.`)
  console.warn('Done.')
}

runSeedUsers()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
