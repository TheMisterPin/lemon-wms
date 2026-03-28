import type { OrderType } from './enums'

export interface IUserActivityEntry {
  id: string
  userId: string
  actionType: string
  entityType: string
  entityId: string
  metadata: Record<string, unknown> | null
  warehouseId: string | null
  orderId: string | null
  orderType: OrderType | null
  ipAddress: string | null
  notes: string | null
  createdAt: Date
}
