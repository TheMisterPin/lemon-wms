
import { type PrismaClient } from '@/generated/prisma'

type SeedWarehouse = {
 name: string
}

const warehouses: SeedWarehouse[] = [
  {
    name: 'Main Warehouse'
  }
]

export async function seedWarehouses(prisma: PrismaClient) {
  for (const warehouse of warehouses) {
    await prisma.warehouse.upsert({
      where: { name: warehouse.name },
      update: {},
      create: {
        id: `WH-${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
        name: warehouse.name,
        address: '123 Warehouse St, City, Country',
        timezone: 'UTC',
        currency: 'USD',
        status: 'ACTIVE'
      }
    })
  }

  return {
    warehousesSeeded: warehouses.length
  }
}
