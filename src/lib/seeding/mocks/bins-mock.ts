import { BinType, Prisma } from '@/generated/prisma'

export const bins: Prisma.BinCreateManyInput[] = [
  // =========================
  // WH-0001 - RECEIVING
  // =========================
  {
    id: 'BIN-0001-0001-0001',
    code: 'BIN-0001-0001-0001',
    warehouseId: 'WH-0001',
    zoneId: 'ZN-0001-0001',
    name: 'Receiving Dock 1',
    type: BinType.RECEIVING
  },
  {
    id: 'BIN-0001-0001-0002',
    code: 'BIN-0001-0001-0002',

    warehouseId: 'WH-0001',
    zoneId: 'ZN-0001-0001',
    name: 'Receiving Dock 2',
    type: BinType.RECEIVING
  },

  // =========================
  // STORAGE (racks)
  // =========================
  {
    id: 'BIN-0001-0002-0001',
    code: 'BIN-0001-0002-0001',
    warehouseId: 'WH-0001',
    zoneId: 'ZN-0001-0002',
    name: 'Rack A1',
    type: BinType.STORAGE
  },
  {
    id: 'BIN-0001-0002-0002',
    code: 'BIN-0001-0002-0002',
    warehouseId: 'WH-0001',
    zoneId: 'ZN-0001-0002',
    name: 'Rack A2',
    type: BinType.STORAGE
  },
  {
    id: 'BIN-0001-0002-0003',
    code: 'BIN-0001-0002-0003',
    warehouseId: 'WH-0001',
    zoneId: 'ZN-0001-0002',
    name: 'Rack B1',
    type: BinType.STORAGE
  },

  // =========================
  // PICKING
  // =========================
  {
    id: 'BIN-0001-0003-0001',
    code: 'BIN-0001-0003-0001',
    warehouseId: 'WH-0001',
    zoneId: 'ZN-0001-0003',
    name: 'Pick Face 1',
    type: BinType.PICKING
  },
  {
    id: 'BIN-0001-0003-0002',
    code: 'BIN-0001-0003-0002',
    warehouseId: 'WH-0001',
    zoneId: 'ZN-0001-0003',
    name: 'Pick Face 2',
    type: BinType.PICKING
  },

  // =========================
  // QUARANTINE
  // =========================
  {
    id: 'BIN-0001-0004-0001',
    code: 'BIN-0001-0004-0001',
    warehouseId: 'WH-0001',
    zoneId: 'ZN-0001-0004',
    name: 'Quarantine 1',
    type: BinType.QUARANTINE,
    isBlocked: true,
    blockReason: 'Quality hold'
  },

  // =========================
  // WH-0002
  // =========================
  {
    id: 'BIN-0002-0001-0001',
    code: 'BIN-0002-0001-0001',
    warehouseId: 'WH-0002',
    zoneId: 'ZN-0002-0001',
    name: 'Main Rack 1',
    type: BinType.STORAGE
  },

  // =========================
  // WH-0003
  // =========================
  {
    id: 'BIN-0003-0001-0001',
    code: 'BIN-0003-0001-0001',
    warehouseId: 'WH-0003',
    zoneId: 'ZN-0003-0001',
    name: 'Overflow Rack 1',
    type: BinType.STORAGE
  }
]
