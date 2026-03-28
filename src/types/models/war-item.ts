import type { ItemTrackingMode } from './enums'

export interface IWARItem {
  id: string
  sku: string
  name: string
  description: string | null
  barcode: string | null
  categoryId: string
  trackingMode: ItemTrackingMode
  uom: string
  weightKg: number | null
  dimensions: Record<string, unknown> | null
  minQuantity: number
  isActive: boolean
  supplierId: string | null
  deletedAt: Date | null
  createdAt: Date
}
