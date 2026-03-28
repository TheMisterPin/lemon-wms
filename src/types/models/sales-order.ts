import type { OrderStatus, OrderPriority } from './enums'

export interface ISalesOrder {
  id: string
  reference: string
  status: OrderStatus
  priority: OrderPriority
  warehouseId: string
  notes: string | null
  customerName: string
  deliveryAddress: string | null
  carrierId: string | null
  createdById: string
  confirmedById: string | null
  confirmedAt: Date | null
  assignedWMId: string | null
  deletedAt: Date | null
  createdAt: Date
}
