/** Mirrors `WarehouseActivityRow` for UAE rows scoped to zone bins. */
export type ZoneOverviewActivityRow = {
  id: string
  time: string
  user: string
  action: string
  entity: string
  status: 'SUCCESS' | 'WARNING' | 'FAILED'
}

export type ZoneOverviewFillBucketRow = {
  label: string
  count: number
}

export type ZoneOverviewStockCategoryRow = {
  label: string
  totalOnHand: number
  available: number
  reserved: number
  blocked: number
  color: string
}

export type ZoneOverviewBinRow = {
  binId: string
  code: string
  binType: string
  fillPercent: number
  distinctItems: number
  available: number
  reserved: number
  blocked: number
  rowStatus: 'EMPTY' | 'AVAILABLE' | 'FULL' | 'BLOCKED'
}

export type ZoneOverviewDashboardMetrics = {
  binsTotal: number
  binsOccupied: number
  binsBlocked: number
  binsEmpty: number
  qtyOnHandTotal: number
  qtyAvailable: number
  qtyReserved: number
  qtyBlocked: number
  fillPercent: number
}

export type ZoneOverviewDashboardData = {
  zone: {
    id: string
    name: string
    type: string
    isActive: boolean
    warehouseId: string
    warehouseName: string
  }
  headerSubtitle: string
  metrics: ZoneOverviewDashboardMetrics
  fillDistribution: ZoneOverviewFillBucketRow[]
  categoryMix: ZoneOverviewStockCategoryRow[]
  bins: ZoneOverviewBinRow[]
  activity: ZoneOverviewActivityRow[]
}
