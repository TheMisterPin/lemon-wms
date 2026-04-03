import { faker } from '@faker-js/faker'
import { createFakeAddress, FakeAddress } from './address'

export type SeedCompany = {
  id: string
  name: string
  email: string
  phone: string
  vatNumber?: string
  taxId?: string
  website?: string
  address: FakeAddress
}

const createFakeCompany = (counter: number): SeedCompany => {
  const padded = counter.toString().padStart(4, '0')
  const companyName = faker.company.name()

  return {
    id: `CMP-${padded}`,
    name: companyName,
    email: faker.internet
      .email({
        firstName: companyName.replace(/[^a-zA-Z0-9]/g, '').slice(0, 20),
        provider: faker.internet.domainName()
      })
      .toLowerCase(),
    phone: faker.phone.number(),
    vatNumber: `VAT-${faker.string.alphanumeric(11).toUpperCase()}`,
    taxId: `TAX-${faker.string.alphanumeric(10).toUpperCase()}`,
    website: faker.internet.url(),
    address: createFakeAddress()
  }
}

export const generateFakeCompanies = (count: number): SeedCompany[] => {
  let counter = 0

  return Array.from({ length: count }, () => {
    counter += 1

    return createFakeCompany(counter)
  })
}
