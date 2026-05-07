import type { DashboardHeader, DashboardKpi } from '@/types/bin-detail-dashboard.types'

export type WarehouseUserSummaryRow = {
  warehouseId: string
  warehouseName: string
  activeUsers: number
  idleUsers: number
  totalUsers: number
  activeOrders: number
  averageOrdersPerUser: number
  href: string
}

export type UserSummaryRow = {
  userId: string
  name: string
  role: string
  warehouseId?: string
  warehouseName?: string
  status: 'ACTIVE' | 'IDLE' | 'LOGGED_OUT' | 'IN_EXCEPTION'
  activeOrderLabel?: string
  deviceCode?: string
  lastActivityAt?: string
  href: string
}

export type UsersDashboardDTO = {
  header: DashboardHeader
  kpis: DashboardKpi[]
  warehouseSummaries: WarehouseUserSummaryRow[]
  users: UserSummaryRow[]
}
