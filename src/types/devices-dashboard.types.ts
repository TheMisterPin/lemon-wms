import type { DashboardHeader, DashboardKpi } from '@/types/bin-detail-dashboard.types'

export type DeviceStatusTab = {
  key: 'ACTIVE' | 'AUTHORIZED' | 'PENDING' | 'OFFLINE'
  label: string
  count: number
}

export type DeviceRow = {
  deviceId: string
  code: string
  label: string
  warehouseId?: string
  warehouseName?: string
  userId?: string
  userName?: string
  onlineStatus: 'ACTIVE' | 'OFFLINE' | 'IDLE'
  authorizationStatus: 'AUTHORIZED' | 'PENDING' | 'REJECTED'
  lastSeenAt?: string
  currentOrderLabel?: string
  href: string
}

export type TrolleySummaryRow = {
  trolleyId: string
  code: string
  deviceCode?: string
  userName?: string
  warehouseName: string
  itemCount: number
  linkedOrdersCount: number
  href: string
}

export type DevicesDashboardDTO = {
  header: DashboardHeader
  kpis: DashboardKpi[]
  tabs: DeviceStatusTab[]
  devices: DeviceRow[]
  trolleys: TrolleySummaryRow[]
}
