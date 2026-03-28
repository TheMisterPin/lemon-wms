import type { DeviceType } from './enums'

export interface IDevice {
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
