import type { DashboardHeader } from '@/types/bin-detail-dashboard.types'

export type CategoryStockCard = {
  categoryId: string
  name: string
  iconName?: string
  totalOnHand: number
  available: number
  reserved: number
  blocked: number
  href: string
}

export type StockCategorySlice = {
  categoryId: string
  categoryName: string
  totalOnHand: number
  href: string
}

export type StockBreakdownBar = {
  label: string
  available: number
  reserved: number
  blocked: number
}

export type SubcategoryStockGroup = {
  parentCategoryId: string
  parentCategoryName: string
  rows: {
    categoryId: string
    name: string
    onHand: number
    available: number
    reserved: number
    blocked: number
    href: string
  }[]
}

export type LowStockItemRow = {
  itemId: string
  sku: string
  name: string
  available: number
  minimumExpected: number
  shortage: number
  warehouseName?: string
  href: string
}

export type StockItemSummaryRow = {
  itemId: string
  sku: string
  name: string
  categoryName: string
  quantity: number
  available: number
  reserved: number
  blocked: number
  href: string
}

export type CategoryStockDashboardDTO = {
  header: DashboardHeader
  categoryCards: CategoryStockCard[]
  categoryDistribution: StockCategorySlice[]
  statusBreakdown: StockBreakdownBar[]
  subcategoryGroups: SubcategoryStockGroup[]
  lowStockItems: LowStockItemRow[]
  items: StockItemSummaryRow[]
}
