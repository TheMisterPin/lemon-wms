import type { WarehouseStatus } from './enums'

export interface IWarehouse {
  id: string
  name: string
  address: string
  timezone: string
  currency: string
  status: WarehouseStatus
  createdById: string | null
  deletedAt: Date | null
  createdAt: Date
}
