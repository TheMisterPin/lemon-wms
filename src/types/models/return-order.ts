import type { OrderStatus, OrderPriority } from './enums'

export interface IReturnOrder {
  id: string
  reference: string
  status: OrderStatus
  priority: OrderPriority
  warehouseId: string
  notes: string | null
  originSalesOrderId: string | null
  returnDisposition: string | null
  createdById: string
  confirmedById: string | null
  confirmedAt: Date | null
  assignedWMId: string | null
  deletedAt: Date | null
  createdAt: Date
}
