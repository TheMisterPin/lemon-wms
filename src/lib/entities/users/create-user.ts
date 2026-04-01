import bcrypt from 'bcrypt'

import type { PrismaClient } from '@/generated/prisma'

type CreateUserInput = {
  email?: string | null
  password?: string | null
  pin?: string | null
  role: 'OWNER' | 'OFFICE_MANAGER' | 'OFFICE_WORKER' | 'WAREHOUSE_MANAGER' | 'WAREHOUSE_WORKER'
  loginType: 'CREDENTIAL' | 'BADGE_PIN' | 'BOTH'
  isActive?: boolean
}

async function createUser(prisma: PrismaClient, data: CreateUserInput) {
  const [passwordHash, pinHash, badgeNumber] = await Promise.all([
    data.password ? bcrypt.hash(data.password, 10) : Promise.resolve(null),
    data.pin ? bcrypt.hash(data.pin, 10) : Promise.resolve(null),
    generateBadgeNumber(prisma)
  ])

  return prisma.user.create({
    data: {
      email: data.email ?? null,
      passwordHash,
      pinHash,
      badgeNumber,
      role: data.role,
      loginType: data.loginType,
      isActive: data.isActive ?? true
    }
  })
}

async function generateBadgeNumber(prisma: PrismaClient): Promise<string> {
  const last = await prisma.user.findFirst({
    orderBy: { createdAt: 'desc' },
    select: { badgeNumber: true }
  })

  if (!last) {
    return 'USR-0001'
  }

  const match = last.badgeNumber.match(/USR-(\d+)/)
  const next = match ? parseInt(match[1], 10) + 1 : 1

  return `USR-${String(next).padStart(4, '0')}`
}

export { createUser }
