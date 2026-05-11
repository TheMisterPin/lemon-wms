import type {
  WarehouseActivityRow,
  WarehouseOrderTypeRow,
  WarehouseStockCategoryRow,
  WarehouseZoneSummaryRow
} from '@/components/features/locations/warehouses/components/warehouse-overview-types'

/** KPI descriptors without icon — merged client-side via label → icon map. */
export type WarehouseOverviewDashboardKpiRow = {
  label: string
  value: string
  helper: string
  tone: 'success' | 'warning' | 'danger' | 'neutral'
}

export type WarehouseOverviewDashboardData = {
  warehouse: {
    id: string
    name: string
    code: string
    lastActivityRelative: string | null
  }
  kpis: WarehouseOverviewDashboardKpiRow[]
  orderTypes: WarehouseOrderTypeRow[]
  stockCategories: WarehouseStockCategoryRow[]
  zones: WarehouseZoneSummaryRow[]
  activity: WarehouseActivityRow[]
}
