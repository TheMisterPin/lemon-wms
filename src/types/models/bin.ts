import type { IBinItem } from './bin-item'
import type { BinType } from './enums'

export interface IBin {
  id: string
  zoneId: string
  warehouseId: string
  name: string
  code: string
  type: BinType
  isActive: boolean
  maxCapacity: number | null
  currentCapacity: number | null
  filledPercentage: number | null
  maxWeightKg: number | null
  maxVolumeM3: number | null
  isBlocked: boolean
  blockReason: string | null
  deletedAt: Date | null
  createdAt: Date
  updatedAt: Date
  content: IBinItem[]
}
