import type { DashboardHeader, DashboardKpi } from '@/types/bin-detail-dashboard.types'

export type DeviceCurrentWorkRow = {
  orderId: string
  orderLabel: string
  orderType: string
  progressPercent: number
  userId?: string
  userName?: string
  startedAt?: string
  href: string
}

export type DeviceActivityRow = {
  id: string
  occurredAt: string
  userId: string
  userName: string
  action: string
  entityType: string
  entityId?: string
  warehouseName?: string
  notes?: string
}

export type DeviceDetailDashboardDTO = {
  header: DashboardHeader & {
    deviceId: string
    deviceCode: string
    deviceName: string
    authorizationStatus: 'AUTHORIZED' | 'PENDING' | 'REJECTED'
    onlineStatus: 'ACTIVE' | 'IDLE' | 'OFFLINE'
    warehouseId?: string
    warehouseName?: string
    currentUserName?: string
    lastSeenAt?: string
  }
  kpis: DashboardKpi[]
  currentWork: DeviceCurrentWorkRow[]
  activity: DeviceActivityRow[]
}
