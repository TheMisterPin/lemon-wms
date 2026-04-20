import type { OrderStatus, OrderPriority } from './enums'

export interface ITransferOrder {
  id: string
  reference: string
  status: OrderStatus
  priority: OrderPriority
  warehouseId: string
  notes: string | null
  fromBinId: string | null
  toBinId: string | null
  isCrossWarehouse: boolean
  createdById: string
  confirmedById: string | null
  confirmedAt: Date | null
  assignedWMId: string | null
  deletedAt: Date | null
  createdAt: Date
}
