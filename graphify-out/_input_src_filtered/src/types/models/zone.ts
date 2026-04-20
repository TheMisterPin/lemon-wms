import type { ZoneType } from './enums'

export interface IZone {
  id: string
  warehouseId: string
  name: string
  type: ZoneType
  customPermissions: Record<string, unknown> | null
  isActive: boolean
  defaultReceivingBinId: string | null
  defaultQuarantineBinId: string | null
  defaultOutgoingBinId: string | null
  deletedAt: Date | null
  createdAt: Date
}
