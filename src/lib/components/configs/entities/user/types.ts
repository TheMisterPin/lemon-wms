import type { LoginType, Role } from '@/types/models/enums'

export type User = {
  id: string
  email: string | null
  passwordHash: string | null
  badgeNumber: string
  pinHash: string | null
  role: Role
  loginType: LoginType
  isActive: boolean
  deletedAt: Date | null
  createdAt: Date
}

export type UserFormValues = {
  email: string | null
  passwordHash: string | null
  badgeNumber: string
  pinHash: string | null
  role: Role
  loginType: LoginType
  isActive: boolean
}

// Backward-compatible aliases used by the current config scaffold.
export type Warehouse = {
  id: string
  name: string
  address: string
  timezone: string
  currency: string
  status: 'ACTIVE' | 'INACTIVE' | 'ARCHIVED'
  createdById: string | null
  deletedAt: Date | null
  createdAt: Date
}

export type WarehouseFormValues = Pick<Warehouse, 'name' | 'address' | 'timezone' | 'currency' | 'status'>
