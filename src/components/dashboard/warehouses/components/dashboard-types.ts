export type DashboardOverviewCard = {
  label: 'Warehouses' | 'Zones' | 'Bins'
  value: number
}

export type DashboardWarehouseDisplayRecord = {
  id: string
  name: string
  /** For {@link import('@/components/dashboard/dashboard-record-list-section').DashboardRecordListItem} */
  title: string
  subtitle: string
  metric: string
}

export type DashboardZoneDisplayRecord = {
  id: string
  name: string
  title: string
  subtitle: string
  metric: string
}

export type DashboardBinDisplayRecord = {
  id: string
  name: string
  type: string
  itemsInBin: number
  filledPercentage: number
  active: boolean
  isBlocked: boolean
}

/** Bins in overview grid (e.g. {@link BinGrid}) */
export type BinRecord = DashboardBinDisplayRecord
