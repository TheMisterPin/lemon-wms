export * from './responses'
export * from './dashboard'
export * from './warehouse'
export * from './errors'

import type { Role } from '@/generated/prisma'

export type AuthUser = {
  id: string
  email?: string | null
  fullName: string
  role: Role
  badgeNumber: string
}

export type AuthLocation = {
  warehouseId?: string
  zoneId?: string
}

export type AuthDevice = {
  id: string
  name: string
  code: string
  warehouseId?: string
  zoneId?: string
}

export type AuthContext = {
  location?: AuthLocation
  device?: AuthDevice
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
