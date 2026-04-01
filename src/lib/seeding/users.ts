import bcrypt from 'bcrypt'

import { LoginType, Role } from '@/generated/prisma'
import type { PrismaClient } from '@/generated/prisma'
import { generateUserSerial } from '@/utils/serials'

const SALT_ROUNDS = 10

type SeedUser = {
  email?: string
  password?: string
  pin?: string
  badgeNumber: string
  role: Role
  loginType: LoginType
}

const users: SeedUser[] = [
  {
    email: 'owner@lemon-wms.local',
    password: 'owner1234',
    badgeNumber: 'USR-0001',
    role: Role.OWNER,
    loginType: LoginType.CREDENTIAL
  },
  {
    email: 'office.manager@lemon-wms.local',
    password: 'manager1234',
    badgeNumber: 'USR-0002',
    role: Role.OFFICE_MANAGER,
    loginType: LoginType.CREDENTIAL
  },
  {
    email: 'office.worker@lemon-wms.local',
    password: 'worker1234',
    badgeNumber: 'USR-0003',
    role: Role.OFFICE_WORKER,
    loginType: LoginType.CREDENTIAL
  },
  {
    pin: '1111',
    badgeNumber: 'USR-0004',
    role: Role.WAREHOUSE_MANAGER,
    loginType: LoginType.BADGE_PIN
  },
  {
    pin: '2222',
    badgeNumber: 'USR-0005',
    role: Role.WAREHOUSE_WORKER,
    loginType: LoginType.BADGE_PIN
  }
]

export async function seedUsers(prisma: PrismaClient) {
  for (const user of users) {
    const passwordHash = user.password ? await bcrypt.hash(user.password, SALT_ROUNDS) : null
    const pinHash = user.pin ? await bcrypt.hash(user.pin, SALT_ROUNDS) : null
    const newID = await generateUserSerial(prisma)
    await prisma.user.upsert({
      where: { badgeNumber: user.badgeNumber },
      update: {},
      create: {
        id: newID,
        email: user.email ?? null,
        passwordHash,
        badgeNumber: user.badgeNumber,
        pinHash,
        role: user.role,
        loginType: user.loginType,
        isActive: true
      }
    })
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

  return {
    usersSeeded: users.length
  }
}
