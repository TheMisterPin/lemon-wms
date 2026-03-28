import type { BinType } from './enums'

export interface IBin {
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
