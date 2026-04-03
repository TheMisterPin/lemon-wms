import { faker } from '@faker-js/faker'
import { AddressType, BusinessPartyType } from '@/generated/prisma'
import { createFakeAddress } from './generators/address'

faker.seed(42) // deterministic output

// ---------------------------------------------------------------------------
// Suppliers (30)
// ---------------------------------------------------------------------------
function buildSuppliers(count = 30) {
  return Array.from({ length: count }, (_, i) => {
    const n   = i + 1
    const id  = `SUP-${String(n).padStart(4, '0')}`
    const companyName = faker.company.name()

    return {
      party: {
        id,
        code:      id,
        type:      BusinessPartyType.SUPPLIER,
        name:      companyName,
        legalName: `${companyName} Ltd.`,
        email:     faker.internet.email({ firstName: companyName.replace(/[^a-zA-Z]/g, '').slice(0, 15), provider: faker.internet.domainName() }).toLowerCase(),
        phone:     faker.phone.number(),
        vatNumber: `VAT-${faker.string.alphanumeric(11).toUpperCase()}`,
        taxId:     `TAX-${faker.string.alphanumeric(10).toUpperCase()}`,
        website:   faker.internet.url(),
        isActive:  true,
      },
      contact: {
        id:             `${id}-CON-1`,
        businessPartyId: id,
        firstName:      faker.person.firstName(),
        lastName:       faker.person.lastName(),
        fullName:       '',   // filled below
        roleTitle:      faker.person.jobTitle(),
        email:          faker.internet.email().toLowerCase(),
        phone:          faker.phone.number(),
        isPrimary:      true,
      },
      address: {
        id:             `${id}-ADDR-1`,
        businessPartyId: id,
        type:           AddressType.PRIMARY,
        isPrimary:      true,
        ...createFakeAddress(),
      },
    }
  }).map((row) => ({
    ...row,
    contact: {
      ...row.contact,
      fullName: `${row.contact.firstName} ${row.contact.lastName}`,
    },
  }))
}

// ---------------------------------------------------------------------------
// Customers (50)
// ---------------------------------------------------------------------------
function buildCustomers(count = 50) {
  return Array.from({ length: count }, (_, i) => {
    const n   = i + 1
    const id  = `CST-${String(n).padStart(4, '0')}`
    const firstName = faker.person.firstName()
    const lastName  = faker.person.lastName()
    const companyName = faker.datatype.boolean(0.6) ? faker.company.name() : null

    return {
      party: {
        id,
        code:      id,
        type:      BusinessPartyType.CUSTOMER,
        name:      companyName ?? `${firstName} ${lastName}`,
        legalName: companyName ? `${companyName} Inc.` : null,
        email:     faker.internet.email({ firstName, lastName }).toLowerCase(),
        phone:     faker.phone.number(),
        isActive:  true,
      },
      contact: {
        id:             `${id}-CON-1`,
        businessPartyId: id,
        firstName,
        lastName,
        fullName:       `${firstName} ${lastName}`,
        roleTitle:      companyName ? faker.person.jobTitle() : null,
        email:          faker.internet.email({ firstName, lastName }).toLowerCase(),
        phone:          faker.phone.number(),
        isPrimary:      true,
      },
      address: {
        id:             `${id}-ADDR-1`,
        businessPartyId: id,
        type:           AddressType.SHIPPING,
        isPrimary:      true,
        ...createFakeAddress(),
      },
    }
  })
}

export const suppliers = buildSuppliers()
export const customers = buildCustomers()
