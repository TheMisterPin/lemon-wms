import { faker } from '@faker-js/faker'
import { createFakeAddress, FakeAddress } from './address'

export type SeedCustomer  = {
  id: string
  firstName: string
  lastName: string
  fullName: string
  email: string
  phone: string
  taxCode?: string
  address: FakeAddress
}

/**
 * createFakeCustomer.
 * @param counter - Parameter for createFakeCustomer.
 * @returns Result from createFakeCustomer.
 */
const createFakeCustomer = (counter: number): SeedCustomer => {
  const padded = counter.toString().padStart(4, '0')
  const firstName = faker.person.firstName()
  const lastName = faker.person.lastName()

  return {
    id: `CST-${padded}`,
    firstName,
    lastName,
    fullName: `${firstName} ${lastName}`,
    email: faker.internet.email({ firstName, lastName }).toLowerCase(),
    phone: faker.phone.number(),
    taxCode: faker.string.alphanumeric(16).toUpperCase(),
    address: createFakeAddress()
  }
}

/**
 * generateFakeCustomers.
 * @param count - Parameter for generateFakeCustomers.
 * @returns Result from generateFakeCustomers.
 */
export const generateFakeCustomers = (count: number): SeedCustomer[] => {
  let counter = 0

  return Array.from({ length: count }, () => {
    counter += 1

    return createFakeCustomer(counter)
  })
}
