import type { OrderStatus } from '@/generated/prisma'

/** Shared list shape for operational orders on the warehouse floor (purchase, sales, transfer). */
export type WarehouseOperationalOrderListRow = {
  id: string
  reference: string
  status: OrderStatus
  supplier: string
  warehouseId: string
  createdAt: Date
  businessPartyId: string | null
  assignedUserId: string | null
  /** Set when there is an active floor assignment for this order. */
  activeOrderAssignmentId: string | null
  lastActiveAt: string | null
  pausedAt: string | null
}
