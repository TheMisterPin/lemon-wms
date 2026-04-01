import { ZoneType, Prisma } from '@/generated/prisma'

export const zones: Prisma.ZoneCreateManyInput[] = [
  // WH-0001
  {
    id: 'ZN-0001-0001',
    warehouseId: 'WH-0001',
    name: 'Receiving',
    type: ZoneType.RECEIVING,
    isActive: true
  },
  {
    id: 'ZN-0001-0002',
    warehouseId: 'WH-0001',
    name: 'Storage',
    type: ZoneType.STORAGE,
    isActive: true
  },
  {
    id: 'ZN-0001-0003',
    warehouseId: 'WH-0001',
    name: 'Picking',
    type: ZoneType.PICKING,
    isActive: true
  },
  {
    id: 'ZN-0001-0004',
    warehouseId: 'WH-0001',
    name: 'Quarantine',
    type: ZoneType.QUARANTINE,
    isActive: true
  },

  // WH-0002
  {
    id: 'ZN-0002-0001',
    warehouseId: 'WH-0002',
    name: 'Main Zone',
    type: ZoneType.STORAGE,
    isActive: true
  },

  // WH-0003
  {
    id: 'ZN-0003-0001',
    warehouseId: 'WH-0003',
    name: 'Overflow Zone',
    type: ZoneType.STORAGE,
    isActive: true
  }
]
