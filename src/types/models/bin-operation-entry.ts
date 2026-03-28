import type { OrderType } from './enums'

export interface IBinOperationEntry {
  id: string
  userId: string
  fromBinId: string | null
  toBinId: string | null
  warItemId: string
  quantity: number
  lotId: string | null
  serialNumberId: string | null
  orderId: string | null
  orderType: OrderType | null
  uaeId: string
  createdAt: Date
}
