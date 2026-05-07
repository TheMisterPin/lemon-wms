import type { DashboardHeader, DashboardKpi } from '@/types/bin-detail-dashboard.types'
import type { DeviceCurrentWorkRow } from '@/types/device-detail-dashboard.types'
import type { OrderSummaryRow } from '@/types/orders-dashboard.types'

export type UserActivityRow = {
  activityId: string
  occurredAt: string
  type: 'LOGIN' | 'LOGOUT' | 'ORDER' | 'MOVEMENT' | 'DEVICE' | 'EXCEPTION'
  action: string
  warehouseName?: string
  entityLabel?: string
  details: string
  metadata?: Record<string, unknown>
}

export type UserSessionRow = {
  sessionId: string
  loginAt: string
  logoutAt?: string
  durationLabel?: string
  deviceCode?: string
  warehouseName?: string
}

export type UserDetailDashboardDTO = {
  header: DashboardHeader & {
    userId: string
    name: string
    role: string
    currentWarehouseName?: string
    currentDeviceCode?: string
  }
  kpis: DashboardKpi[]
  currentWork: DeviceCurrentWorkRow[]
  activity: UserActivityRow[]
  orders: OrderSummaryRow[]
  sessions: UserSessionRow[]
}
