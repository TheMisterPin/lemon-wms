import bcrypt from 'bcrypt'

import { LoginType, Role } from '@/generated/prisma'
import type { PrismaClient } from '@/generated/prisma'

const SALT_ROUNDS = 10

type SeedUser = {
  id: string
  email?: string
  password?: string
  pin?: string
  badgeNumber: string
  role: Role
  loginType: LoginType
}

// ---------------------------------------------------------------------------
// Office / credential users  (badge USR-0001 → USR-0005)
// ---------------------------------------------------------------------------
const OFFICE_USERS: SeedUser[] = [
  {
    id: 'user-owner-001',
    email: 'owner@lemon-wms.local',
    password: 'owner1234',
    badgeNumber: 'USR-0001',
    role: Role.OWNER,
    loginType: LoginType.CREDENTIAL,
  },
  {
    id: 'user-om-001',
    email: 'office.manager@lemon-wms.local',
    password: 'manager1234',
    badgeNumber: 'USR-0002',
    role: Role.OFFICE_MANAGER,
    loginType: LoginType.CREDENTIAL,
  },
  {
    id: 'user-ow-001',
    email: 'office.worker@lemon-wms.local',
    password: 'worker1234',
    badgeNumber: 'USR-0003',
    role: Role.OFFICE_WORKER,
    loginType: LoginType.CREDENTIAL,
  },
]

// ---------------------------------------------------------------------------
// Floor users — 1 WM + 2 WW per warehouse (W01–W10)
// badge numbers USR-0004 → USR-0033
// PIN pattern: WM → 11XX, WW-A → 22XX, WW-B → 33XX  (XX = warehouse index)
// ---------------------------------------------------------------------------
const WAREHOUSE_CODES = ['W01','W02','W03','W04','W05','W06','W07','W08','W09','W10']

function floorUsers(): SeedUser[] {
  const users: SeedUser[] = []
  let badgeSeq = 4 // starts at USR-0004

  for (let wi = 0; wi < WAREHOUSE_CODES.length; wi++) {
    const wCode = WAREHOUSE_CODES[wi]
    const idx   = String(wi + 1).padStart(2, '0')

    users.push({
      id:          `user-wm-${wCode.toLowerCase()}`,
      badgeNumber: `USR-${String(badgeSeq++).padStart(4, '0')}`,
      pin:         `11${idx}`,
      role:        Role.WAREHOUSE_MANAGER,
      loginType:   LoginType.BADGE_PIN,
    })

    users.push({
      id:          `user-ww-${wCode.toLowerCase()}-a`,
      badgeNumber: `USR-${String(badgeSeq++).padStart(4, '0')}`,
      pin:         `22${idx}`,
      role:        Role.WAREHOUSE_WORKER,
      loginType:   LoginType.BADGE_PIN,
    })

    users.push({
      id:          `user-ww-${wCode.toLowerCase()}-b`,
      badgeNumber: `USR-${String(badgeSeq++).padStart(4, '0')}`,
      pin:         `33${idx}`,
      role:        Role.WAREHOUSE_WORKER,
      loginType:   LoginType.BADGE_PIN,
    })
  }

  return users
}

const ALL_USERS: SeedUser[] = [...OFFICE_USERS, ...floorUsers()]
// Final badge sequence value so the serial config stays accurate
const LAST_BADGE_SEQ = ALL_USERS.length

export async function seedUsers(prisma: PrismaClient) {
  for (const user of ALL_USERS) {
    const passwordHash = user.password ? await bcrypt.hash(user.password, SALT_ROUNDS) : null
    const pinHash      = user.pin      ? await bcrypt.hash(user.pin,      SALT_ROUNDS) : null

    await prisma.user.upsert({
      where:  { badgeNumber: user.badgeNumber },
      update: {},
      create: {
        id:           user.id,
        email:        user.email ?? null,
        passwordHash,
        badgeNumber:  user.badgeNumber,
        pinHash,
        role:         user.role,
        loginType:    user.loginType,
        isActive:     true,
      },
    })
  }

  await prisma.serialNumberConfig.upsert({
    where:  { id: 'seed-user-serial-config' },
    update: { lastValue: LAST_BADGE_SEQ },
    create: {
      id:          'seed-user-serial-config',
      entityType:  'USER',
      prefix:      'USR',
      format:      'USR-{####}',
      lastValue:   LAST_BADGE_SEQ,
      incrementBy: 1,
    },
  })

  return { usersSeeded: ALL_USERS.length }
}
