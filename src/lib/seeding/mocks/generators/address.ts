import { faker } from '@faker-js/faker'

export type FakeAddress = {
  streetLine1: string
  streetLine2?: string
  city: string
  state: string
  postalCode: string
  country: string
}

export const createFakeAddress = (): FakeAddress => ({
  streetLine1: faker.location.streetAddress(),
  streetLine2: faker.datatype.boolean(0.25)
    ? faker.location.secondaryAddress()
    : undefined,
  city: faker.location.city(),
  state: faker.location.state(),
  postalCode: faker.location.zipCode(),
  country: faker.location.country()
})
