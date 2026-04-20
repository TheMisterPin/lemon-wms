import bcrypt from 'bcrypt'

import type { PrismaClient } from '@/generated/prisma'

type UpdateUserInput = {
  email?: string | null
  password?: string | null
  pin?: string | null
  role?: 'OWNER' | 'OFFICE_MANAGER' | 'OFFICE_WORKER' | 'WAREHOUSE_MANAGER' | 'WAREHOUSE_WORKER'
  loginType?: 'CREDENTIAL' | 'BADGE_PIN' | 'BOTH'
  isActive?: boolean
}

/**
 * updateUser.
 * @param prisma - Parameter for updateUser.
 * @param id - Parameter for updateUser.
 * @param data - Parameter for updateUser.
 * @returns Result from updateUser.
 */
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

export { updateUser }
