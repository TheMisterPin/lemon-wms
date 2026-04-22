import 'dotenv/config'
import prisma from '../src/lib/prisma'
import { seedUsers } from './lib/users'

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
