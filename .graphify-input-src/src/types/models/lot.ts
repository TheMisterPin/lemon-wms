import type { LotStatus } from './enums'

export interface ILot {
  id: string
  lotNumber: string
  warItemId: string
  purchaseOrderId: string | null
  receivedDate: Date
  expiryDate: Date | null
  status: LotStatus
  createdAt: Date
}
