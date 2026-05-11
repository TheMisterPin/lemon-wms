import type { DashboardHeader } from '@/types/bin-detail-dashboard.types'

export type CategoryStockCard = {
  categoryId: string
  name: string
  iconName?: string
  iconUrl: string | null
  totalOnHand: number
  available: number
  reserved: number
  blocked: number
  href: string
}

export type StockCategorySlice = {
  categoryId: string
  categoryName: string
  iconUrl: string | null
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
  parentIconUrl: string | null
  rows: {
    categoryId: string
    name: string
    iconUrl: string | null
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
  /** Present when the overview is scoped to a single parent category via `categoryId`. */
  selectedCategoryIconUrl: string | null
  categoryCards: CategoryStockCard[]
  categoryDistribution: StockCategorySlice[]
  statusBreakdown: StockBreakdownBar[]
  subcategoryGroups: SubcategoryStockGroup[]
  lowStockItems: LowStockItemRow[]
  items: StockItemSummaryRow[]
}
