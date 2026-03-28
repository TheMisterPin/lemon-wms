import type { BoxStatus } from './enums'

export interface IBox {
  id: string
  code: string
  status: BoxStatus
  binId: string | null
  warehouseId: string
  weightKg: number | null
  notes: string | null
  createdAt: Date
}
