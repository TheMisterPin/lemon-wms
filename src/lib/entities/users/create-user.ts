import bcrypt from 'bcrypt'

import type { LoginType, PrismaClient, Role } from '@/generated/prisma'
import { generateUserSerial } from '@/utils/serials'

type CreateUserInput = {
  email?: string | null
  password?: string | null
  pin?: string | null
  firstName: string
  lastName: string
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
  const newID = await generateUserSerial(prisma)

  return prisma.user.create({
    data: {
      id: newID,
      firstName: data.firstName,
      lastName: data.lastName,
      email: data.email ?? null,
      passwordHash,
      pinHash,
      badgeNumber,
      role: data.role as Role,
      loginType: data.loginType as LoginType,
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
