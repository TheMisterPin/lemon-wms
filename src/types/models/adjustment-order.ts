import type { OrderStatus, OrderPriority } from './enums'

export interface IAdjustmentOrder {
  id: string
  reference: string
  status: OrderStatus
  priority: OrderPriority
  warehouseId: string
  notes: string | null
  reasonCode: string
  createdById: string
  confirmedById: string | null
  confirmedAt: Date | null
  assignedWMId: string | null
  deletedAt: Date | null
  createdAt: Date
}
