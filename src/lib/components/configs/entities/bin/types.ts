import type { BinType } from '@/types/models/enums'

export type Bin = {
  id: string
  zoneId: string
  warehouseId: string
  name: string
  code: string
  type: BinType
  isBlocked: boolean
  blockReason: string | null
  maxWeightKg: number | null
  maxVolumeM3: number | null
  deletedAt: Date | null
  createdAt: Date
}

export type BinFormValues = {
  zoneId: string
  warehouseId: string
  name: string
  code: string
  type: BinType
  isBlocked: boolean
  blockReason: string | null
  maxWeightKg: number | null
  maxVolumeM3: number | null
}

// Backward-compatible aliases used by the current config scaffold.
export type Warehouse = {
  id: string
  name: string
  address: string
  timezone: string
  currency: string
  status: 'ACTIVE' | 'INACTIVE' | 'ARCHIVED'
  createdById: string | null
  deletedAt: Date | null
  createdAt: Date
}

export type WarehouseFormValues = Pick<Warehouse, 'name' | 'address' | 'timezone' | 'currency' | 'status'>
