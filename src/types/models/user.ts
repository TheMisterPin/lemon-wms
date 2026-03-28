import type { Role, LoginType } from './enums'

export interface IUser {
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
