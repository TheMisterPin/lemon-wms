import type { DashboardHeader, DashboardKpi } from '@/types/bin-detail-dashboard.types'

export type OrderExecutionLineRow = {
  lineId: string
  itemId: string
  sku: string
  name: string
  expectedQty: number
  processedQty: number
  remainingQty: number
  uom: string
  status: 'OPEN' | 'PARTIAL' | 'COMPLETED' | 'EXCEPTION'
  outcome?: 'ACCEPTED' | 'DAMAGED' | 'EXPIRED' | 'REJECTED' | 'QUARANTINED' | 'QUALITY_ISSUE'
  href: string
}

export type OrderAssignmentRow = {
  assignmentId: string
  userId: string
  userName: string
  status: 'ASSIGNED' | 'STARTED' | 'PAUSED' | 'RESUMED' | 'COMPLETED' | 'CANCELLED'
  startedAt?: string
  pausedAt?: string
  completedAt?: string
  durationLabel?: string
}

export type OrderActivityRow = {
  activityId: string
  occurredAt: string
  userName: string
  action: string
  lineLabel?: string
  quantity?: number
  outcome?: string
  details: string
}

export type OrderMovementRow = {
  movementId: string
  occurredAt: string
  sku: string
  fromBinCode?: string
  toBinCode?: string
  quantity: number
  boeId: string
  userName: string
}

export type OrderDetailDashboardDTO = {
  header: DashboardHeader & {
    orderId: string
    orderLabel: string
    orderType: string
    warehouseName: string
    progressPercent: number
  }
  kpis: DashboardKpi[]
  lines: OrderExecutionLineRow[]
  assignments: OrderAssignmentRow[]
  activity: OrderActivityRow[]
  movements: OrderMovementRow[]
}
