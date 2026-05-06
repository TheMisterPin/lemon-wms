export type WarehouseStockDashboardKpiRow = {
  label: string
  value: string
  helper: string
  tone: 'success' | 'warning' | 'danger' | 'neutral'
}

export type WarehouseStockDashboardCategoryRow = {
  label: string
  totalOnHand: number
  available: number
  reserved: number
  blocked: number
  color: string
}

export type WarehouseStockDashboardZoneRow = {
  zoneId: string
  name: string
  code: string
  type: string
  totalOnHand: number
  available: number
  reserved: number
  blocked: number
  fillPercent: number
}

export type WarehouseStockDashboardItemRow = {
  itemId: string
  sku: string
  name: string
  categoryName: string
  uom: string
  totalOnHand: number
  available: number
  reserved: number
  blocked: number
  binsCount: number
}

export type WarehouseStockDashboardData = {
  warehouseId: string
  header: {
    title: string
    subtitle: string
  }
  kpis: WarehouseStockDashboardKpiRow[]
  categoryDistribution: WarehouseStockDashboardCategoryRow[]
  zones: WarehouseStockDashboardZoneRow[]
  items: WarehouseStockDashboardItemRow[]
}
