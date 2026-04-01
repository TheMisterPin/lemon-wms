
import { type PrismaClient } from '@/generated/prisma'
import { warehouses } from './mocks/warehouses-mock'

export async function seedWarehouses(prisma: PrismaClient) {
  await prisma.warehouse.createMany({
    data: warehouses,
    skipDuplicates: true // optional but useful for seeding
  })

  return { count: warehouses.length }
}
