import type { SerialEntityType, SerialMode } from './enums'

export interface ISerialNumberConfig {
  id: string
  entityType: SerialEntityType
  prefix: string | null
  format: string
  lastValue: string
  incrementBy: number
  mode: SerialMode
  warItemId: string | null
  warehouseId: string | null
  createdAt: Date
}
