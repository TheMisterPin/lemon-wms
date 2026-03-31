import type { ZoneType } from '@/types/models/enums'

export type Zone = {
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

export type ZoneFormValues = {
  warehouseId: string
  name: string
  type: ZoneType
  customPermissions: Record<string, unknown> | null
  isActive: boolean
  defaultReceivingBinId: string | null
  defaultQuarantineBinId: string | null
  defaultOutgoingBinId: string | null
}
