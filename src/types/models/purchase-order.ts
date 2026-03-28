import type { OrderStatus, OrderPriority } from './enums'

export interface IPurchaseOrder {
  id: string
  reference: string
  status: OrderStatus
  priority: OrderPriority
  warehouseId: string
  notes: string | null
  supplier: string
  expectedDate: Date | null
  receivingSequence: number | null
  createdById: string
  confirmedById: string | null
  confirmedAt: Date | null
  assignedWMId: string | null
  deletedAt: Date | null
  createdAt: Date
}
