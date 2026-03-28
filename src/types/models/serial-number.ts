import type { SerialEntityType, SerialStatus } from './enums'

export interface ISerialNumber {
  id: string
  serial: string
  configId: string
  entityType: SerialEntityType
  baseValue: string
  partialCurrent: number | null
  partialTotal: number | null
  status: SerialStatus
  warItemId: string | null
  createdAt: Date
}
