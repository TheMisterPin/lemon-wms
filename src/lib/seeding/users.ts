import bcrypt from 'bcrypt'

import type { PrismaClient } from '@/generated/prisma'

import { users } from './mocks/users-mock'

const SALT_ROUNDS = 10

export async function seedUsers(prisma: PrismaClient) {
  const data = await Promise.all(
    users.map(async (user) => ({
      id:           user.id,
      email:        user.email ?? null,
      passwordHash: user.password ? await bcrypt.hash(user.password, SALT_ROUNDS) : null,
      pinHash:      user.pin      ? await bcrypt.hash(user.pin,      SALT_ROUNDS) : null,
      badgeNumber:  user.badgeNumber,
      firstName:    user.firstName,
      lastName:     user.lastName,
      fullName:     user.fullName,
      role:         user.role,
      loginType:    user.loginType,
      isActive:     true,
    }))
  )

  await prisma.user.createMany({
    data,
    skipDuplicates: true,
  })

  return { count: data.length }
}
