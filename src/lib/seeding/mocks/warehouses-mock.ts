import { WarehouseStatus } from '@/generated/prisma'

export const warehouses = [
  {
    id: 'WH-0001',
    name: 'Main Warehouse',
    address: '123 Warehouse St, City, Country',
    timezone: 'UTC',
    currency: 'USD',
    status: WarehouseStatus.ACTIVE
  },
  {
    id: 'WH-0002',
    name: 'Secondary Warehouse',
    address: '456 Storage Ave, City, Country',
    timezone: 'UTC',
    currency: 'USD',
    status: WarehouseStatus.ACTIVE
  },
  {
    id: 'WH-0003',
    name: 'Overflow Warehouse',
    address: '789 Logistics Rd, City, Country',
    timezone: 'UTC',
    currency: 'USD',
    status: WarehouseStatus.ACTIVE
  }
]
