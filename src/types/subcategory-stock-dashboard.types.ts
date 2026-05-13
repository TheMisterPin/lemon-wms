import type { BinFillOverTimePoint } from '@/types/bin-detail-dashboard.types'

export type SubcategoryStockBreadcrumb = {
  label: string
  href: string
}

export type SubcategoryStockKpis = {
  totalOnHand: number
  totalAvailable: number
  totalReserved: number
  totalBlocked: number
  occupiedBins: number
  ordersUsingItems: number
  lowStockItemsCount: number
}

export type SubcategoryAvailabilityDonutSlice = {
  bucket: 'AVAILABLE' | 'RESERVED' | 'BLOCKED'
  quantity: number
}

export type SubcategoryStockItemRow = {
  itemId: string
  sku: string
  name: string
  uom: string
  minQuantity: number
  available: number
  reserved: number
  blocked: number
  onHand: number
  isLowStock: boolean
  href: string
}

export type SubcategoryBinActivityRow = {
  id: string
  createdAt: string
  operationType: string
  quantity: number
  itemSku: string
  userName: string
  warehouseName: string
}

export type SubcategoryStockDashboardDTO = {
  header: {
    title: string
    subtitle: string
  }
  breadcrumbs: SubcategoryStockBreadcrumb[]
  parent: {
    code: string
    name: string
    href: string
    iconUrl: string | null
  }
  subcategory: {
    code: string
    name: string
    iconUrl: string | null
  }
  kpis: SubcategoryStockKpis
  availabilityDonut: SubcategoryAvailabilityDonutSlice[]
  /** Daily BinHistory snapshots summed across bins that currently hold stock for this subcategory (same shape as bin overview). */
  fillOverTime: BinFillOverTimePoint[]
  items: SubcategoryStockItemRow[]
  activities: SubcategoryBinActivityRow[]
}
