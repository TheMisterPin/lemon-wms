import bcrypt from 'bcrypt'
import { PrismaClient, Role, LoginType } from '../src/generated/prisma'

const prisma = new PrismaClient()

const SALT_ROUNDS = 10

const users: {
  email?: string
  password?: string
  pin?: string
  badgeNumber: string
  role: Role
  loginType: LoginType
  name: string
}[] = [
  {
    name: 'Owner',
    email: 'owner@lemon-wms.local',
    password: 'owner1234',
    badgeNumber: 'USR-0001',
    role: Role.OWNER,
    loginType: LoginType.CREDENTIAL
  },
  {
    name: 'Office Manager',
    email: 'office.manager@lemon-wms.local',
    password: 'manager1234',
    badgeNumber: 'USR-0002',
    role: Role.OFFICE_MANAGER,
    loginType: LoginType.CREDENTIAL
  },
  {
    name: 'Office Worker',
    email: 'office.worker@lemon-wms.local',
    password: 'worker1234',
    badgeNumber: 'USR-0003',
    role: Role.OFFICE_WORKER,
    loginType: LoginType.CREDENTIAL
  },
  {
    name: 'Warehouse Manager',
    pin: '1111',
    badgeNumber: 'USR-0004',
    role: Role.WAREHOUSE_MANAGER,
    loginType: LoginType.BADGE_PIN
  },
  {
    name: 'Warehouse Worker',
    pin: '2222',
    badgeNumber: 'USR-0005',
    role: Role.WAREHOUSE_WORKER,
    loginType: LoginType.BADGE_PIN
  }
]

async function seedUsers() {
  console.warn('Seeding users...\n')

  for (const u of users) {
    const passwordHash = u.password ? await bcrypt.hash(u.password, SALT_ROUNDS) : null
    const pinHash = u.pin ? await bcrypt.hash(u.pin, SALT_ROUNDS) : null

    const user = await prisma.user.upsert({
      where: { badgeNumber: u.badgeNumber },
      update: {},
      create: {
        email: u.email ?? null,
        passwordHash,
        badgeNumber: u.badgeNumber,
        pinHash,
        role: u.role,
        loginType: u.loginType,
        isActive: true
      }
    })

    const details =
      u.loginType === LoginType.CREDENTIAL
        ? `email: ${u.email}  password: ${u.password}`
        : `badge: ${u.badgeNumber}  pin: ${u.pin}`

    console.warn(`  [${u.role}] ${u.name}`)
    console.warn(`    id: ${user.id}`)
    console.warn(`    ${details}\n`)
  }

  await prisma.serialNumberConfig.upsert({
    where: { id: 'seed-user-serial-config' },
    update: { lastValue: users.length },
    create: {
      id: 'seed-user-serial-config',
      entityType: 'USER',
      prefix: 'USR',
      format: 'USR-{####}',
      lastValue: users.length,
      incrementBy: 1
    }
  })

  console.warn('Done.')
}

seedUsers()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
