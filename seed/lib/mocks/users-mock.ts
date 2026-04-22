import { LoginType, Role } from '@/generated/prisma'

type SeedUser = {
  id: string
  firstName: string
  lastName: string
  fullName: string
  email?: string
  password?: string
  pin?: string
  badgeNumber: string
  role: Role
  loginType: LoginType
}

const rawUsers = [
  {
    id: 'USR-0001',
    firstName: 'Luca',
    lastName: 'Ferrari',
    pin: '0000',
    email: 'owner@lemon-wms.local',
    password: 'owner1234',
    badgeNumber: 'USR-0001',
    role: Role.OWNER,
    loginType: LoginType.CREDENTIAL
  },
  {
    id: 'USR-0002',
    firstName: 'Marta',
    lastName: 'Bianchi',
    email: 'office.manager@lemon-wms.local',
    password: 'manager1234',
    badgeNumber: 'USR-0002',
    role: Role.OFFICE_MANAGER,
    loginType: LoginType.CREDENTIAL
  },
  {
    id: 'USR-0003',
    firstName: 'Paolo',
    lastName: 'Ricci',
    email: 'office.worker@lemon-wms.local',
    password: 'worker1234',
    badgeNumber: 'USR-0003',
    role: Role.OFFICE_WORKER,
    loginType: LoginType.CREDENTIAL
  },
  {
    id: 'USR-0004',
    firstName: 'Giulia',
    lastName: 'Conti',
    pin: '1111',
    badgeNumber: 'USR-0004',
    role: Role.WAREHOUSE_MANAGER,
    loginType: LoginType.BADGE_PIN
  },
  {
    id: 'USR-0005',
    firstName: 'Marco',
    lastName: 'Romano',
    pin: '2222',
    badgeNumber: 'USR-0005',
    role: Role.WAREHOUSE_WORKER,
    loginType: LoginType.BADGE_PIN
  }
] as const

export const users: SeedUser[] = rawUsers.map((user) => ({
  ...user,
  fullName: `${user.firstName} ${user.lastName}`
}))
