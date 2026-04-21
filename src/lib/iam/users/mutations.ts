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

type UpdateUserInput = {
  email?: string | null
  password?: string | null
  pin?: string | null
  role?: 'OWNER' | 'OFFICE_MANAGER' | 'OFFICE_WORKER' | 'WAREHOUSE_MANAGER' | 'WAREHOUSE_WORKER'
  loginType?: 'CREDENTIAL' | 'BADGE_PIN' | 'BOTH'
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
      fullName: `${data.firstName} ${data.lastName}`,
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

async function updateUser(prisma: PrismaClient, id: string, data: UpdateUserInput) {
  const [passwordHash, pinHash] = await Promise.all([
    data.password ? bcrypt.hash(data.password, 10) : Promise.resolve(undefined),
    data.pin ? bcrypt.hash(data.pin, 10) : Promise.resolve(undefined)
  ])

  return prisma.user.update({
    where: { id },
    data: {
      ...(data.email !== undefined ? { email: data.email } : {}),
      ...(passwordHash !== undefined ? { passwordHash } : {}),
      ...(pinHash !== undefined ? { pinHash } : {}),
      ...(data.role !== undefined ? { role: data.role } : {}),
      ...(data.loginType !== undefined ? { loginType: data.loginType } : {}),
      ...(data.isActive !== undefined ? { isActive: data.isActive } : {})
    },
    select: {
      id: true,
      email: true,
      badgeNumber: true,
      role: true,
      loginType: true,
      isActive: true,
      deletedAt: true,
      createdAt: true
    }
  })
}

async function deleteUser(prisma: PrismaClient, id: string) {
  const [user] = await prisma.$transaction([
    prisma.user.update({
      where: { id },
      data: { deletedAt: new Date(), isActive: false },
      select: {
        id: true,
        email: true,
        badgeNumber: true,
        role: true,
        loginType: true,
        isActive: true,
        deletedAt: true,
        createdAt: true
      }
    }),
    prisma.refreshToken.updateMany({
      where: { userId: id, revokedAt: null },
      data: { revokedAt: new Date() }
    })
  ])

  return user
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

export { createUser, updateUser, deleteUser }
