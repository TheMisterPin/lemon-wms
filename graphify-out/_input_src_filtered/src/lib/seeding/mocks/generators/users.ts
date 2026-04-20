import { faker } from '@faker-js/faker'
import { LoginType, Role } from '@/generated/prisma'

type BasicUser = {
  id: string
  firstName: string
  lastName: string
  fullName: string
  email?: string
  password?: string
  pin?: string
  badgeNumber: string
}

type SeedUser = BasicUser & {
  role: Role
  loginType: LoginType
}

const createFakeWorker = (
  counter: number,
  role: Role,
  loginType: LoginType
): SeedUser => {
  const firstName = faker.person.firstName()
  const lastName = faker.person.lastName()
  const padded = counter.toString().padStart(4, '0')

  return {
    id: `USR-${padded}`,
    firstName,
    lastName,
    fullName: `${firstName} ${lastName}`,
    email: faker.internet.email({ firstName, lastName }).toLowerCase(),
    password: `password${padded}`,
    pin: padded,
    badgeNumber: `USR-${padded}`,
    role,
    loginType
  }
}

/**
 * generateFakeUsers.
 * @returns Result from generateFakeUsers.
 */
export const generateFakeUsers = (): SeedUser[] => {
  let counter = 0

  /**
   * nextCounter.
   * @returns Result from nextCounter.
   */
  const nextCounter = () => {
    counter += 1

    return counter
  }

  const groups = [
    {
      role: Role.WAREHOUSE_MANAGER,
      loginType: LoginType.BADGE_PIN,
      min: 2,
      max: 4
    },
    {
      role: Role.OFFICE_MANAGER,
      loginType: LoginType.CREDENTIAL,
      min: 2,
      max: 4
    },
    {
      role: Role.WAREHOUSE_WORKER,
      loginType: LoginType.BADGE_PIN,
      min: 10,
      max: 20
    },
    {
      role: Role.OFFICE_WORKER,
      loginType: LoginType.CREDENTIAL,
      min: 10,
      max: 20
    }
  ]

  return groups.flatMap((group) => {
    const count = faker.number.int({ min: group.min, max: group.max })

    return Array.from({ length: count }, () =>
      createFakeWorker(nextCounter(), group.role, group.loginType)
    )
  })
}
