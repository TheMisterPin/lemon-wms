import bcrypt from 'bcrypt'

import { LoginType, Role, type PrismaClient } from '@/generated/prisma'

import { generateFakeUsers } from './mocks/generators/users'

const SALT_ROUNDS = 10

export async function seedUsers(prisma: PrismaClient) {
  const users = generateFakeUsers()
  await prisma.user.create({
    data: {
      id: 'USR-0000',
      email: 'owner@lemon-wms.local',
      passwordHash: await bcrypt.hash('owner1234', SALT_ROUNDS),
      pinHash: await bcrypt.hash('1234', SALT_ROUNDS),
      badgeNumber: '0000',
      firstName: 'Owner',
      lastName: 'User',
      fullName: 'Owner User',
      role: Role.OWNER,
      loginType: LoginType.BOTH,
      isActive: true
    }
  })
  console.warn('Seeded owner user')
  const data = await Promise.all(
    users.map(async (user) => ({
      id: user.id,
      email: user.email,
      passwordHash: user.password
        ? await bcrypt.hash(user.password, SALT_ROUNDS)
        : null,
      pinHash: user.pin
        ? await bcrypt.hash(user.pin, SALT_ROUNDS)
        : null,
      badgeNumber: user.badgeNumber,
      firstName: user.firstName,
      lastName: user.lastName,
      fullName: user.fullName,
      role: user.role,
      loginType: user.loginType,
      isActive: true
    }))
  )

  await prisma.user.createMany({
    data,
    skipDuplicates: true
  })

  return { count: data.length }
}
