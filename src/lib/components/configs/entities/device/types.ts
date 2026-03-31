import type { DeviceType } from '@/types/models/enums'

export type Device = {
  id: string
  name: string
  code: string
  warehouseId: string
  zoneId: string
  isActive: boolean
  type: DeviceType
  registeredAt: Date
  lastSeenAt: Date | null
}

export type DeviceFormValues = {
  name: string
  code: string
  warehouseId: string
  zoneId: string
  isActive: boolean
  type: DeviceType
}
