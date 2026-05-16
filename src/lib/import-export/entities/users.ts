import bcrypt from 'bcrypt'

import type { LoginType, PrismaClient, Prisma, Role } from '@/generated/prisma'
import { generateUserSerial } from '@/utils/serials'

type DbClient = PrismaClient | Prisma.TransactionClient

export type UserExportRecord = {
  firstName: string
  lastName: string
  email: string | null
  role: string
  loginType: string
  isActive: boolean
}

export type UserImportRecord = {
  firstName: string
  lastName: string
  email?: string | null
  role: string
  loginType: string
  isActive: boolean
}

export async function exportUsersForExport(db: DbClient): Promise<UserExportRecord[]> {
  return db.user.findMany({
    where: { deletedAt: null },
    select: {
      firstName: true,
      lastName: true,
      email: true,
      role: true,
      loginType: true,
      isActive: true,
    },
    orderBy: { createdAt: 'asc' },
  })
}

// Users require per-row creation (bcrypt + serial generation cannot use createMany).
// Imported users have no password/PIN; accounts are created as inactive placeholders
// that require a password reset before they can log in.
export async function insertUsersBatch(db: PrismaClient, records: UserImportRecord[]): Promise<number> {
  let inserted = 0
  for (const record of records) {
    const [badgeNumber, id] = await Promise.all([
      generateBadgeNumber(db),
      generateUserSerial(db),
    ])

    await db.user.create({
      data: {
        id,
        firstName: record.firstName,
        lastName: record.lastName,
        fullName: `${record.firstName} ${record.lastName}`,
        email: record.email ?? null,
        passwordHash: null,
        pinHash: null,
        badgeNumber,
        role: record.role as Role,
        loginType: record.loginType as LoginType,
        isActive: record.isActive,
      },
    })
    inserted++
  }
  return inserted
}

async function generateBadgeNumber(db: PrismaClient): Promise<string> {
  const count = await db.user.count()
  return `BADGE-${String(count + 1).padStart(5, '0')}`
}
