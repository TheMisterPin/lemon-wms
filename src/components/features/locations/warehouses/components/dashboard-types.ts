
export type DashboardOverviewCard = {
  label: 'Warehouses' | 'Zones' | 'Bins'
  value: number
}

export type DashboardWarehouseDisplayRecord = {
  id: string
  name: string
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

export type BinRecord = DashboardBinDisplayRecord
