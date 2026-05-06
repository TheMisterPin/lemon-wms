export type StockDashboardItemRow = {
  itemId: string
  sku: string
  name: string
  uom: string
  binsCount: number
  totalAvailable: number
  totalReserved: number
  totalBlocked: number
  totalOnHand: number
}

export type StockDashboardCategoryRow = {
  /** Stable key for React + chart identity (parent category code or synthetic). */
  key: string
  label: string
  totalAvailable: number
  totalReserved: number
  totalBlocked: number
  totalOnHand: number
}

export type StockDashboardSubcategoryRow = {
  name: string
  onHand: number
  available: number
  reserved: number
  blocked: number
}

export type StockDashboardSubcategoryGroup = {
  parentKey: string
  parentLabel: string
  rows: StockDashboardSubcategoryRow[]
}

export type StockDashboardData = {
  /** Echo: `null` when aggregating all warehouses. */
  warehouseId: string | null
  distinctSkus: number
  occupiedBins: number
  totalOnHand: number
  totalAvailable: number
  totalReserved: number
  totalBlocked: number
  categories: StockDashboardCategoryRow[]
  subcategoryGroups: StockDashboardSubcategoryGroup[]
  items: StockDashboardItemRow[]
}
