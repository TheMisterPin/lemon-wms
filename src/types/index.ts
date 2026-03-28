export * from './responses'

import type { Role, LoginType } from '@/generated/prisma'

// Re-export Prisma enums for convenience
export type { Role as UserRole, LoginType }

export type AuthUser = {
  id: string
  email?: string | null
  role: Role
  badgeNumber: string
}

export type JWTPayload = {
  userId: string
  role: Role
  deviceId?: string
  zoneId?: string
  warehouseId?: string
  iat?: number
  exp?: number
}

export type ApiResponse<T> = {
  data?: T
  error?: string
  success?: boolean
}
