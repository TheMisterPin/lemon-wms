
import { type PrismaClient } from '@/generated/prisma'
import { warehouses } from './mocks/warehouses-mock'

/**
 * seedWarehouses.
 * @param prisma - Parameter for seedWarehouses.
 * @returns Result from seedWarehouses.
 */
export async function seedWarehouses(prisma: PrismaClient) {
  await prisma.warehouse.createMany({
    data: warehouses,
    skipDuplicates: true // optional but useful for seeding
  })

  return { count: warehouses.length }
}
