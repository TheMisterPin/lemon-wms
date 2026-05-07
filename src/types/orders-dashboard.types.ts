import type { DashboardHeader, DashboardKpi } from '@/types/bin-detail-dashboard.types'

export type OrderTypeSlice = {
  type: 'SALES' | 'PURCHASE' | 'TRANSFER' | 'RETURN' | 'ADJUSTMENT'
  count: number
  href: string
}

export type OrderStatusBreakdown = {
  label: string
  released: number
  assigned: number
  active: number
  paused: number
  completed: number
  exception: number
}

export type WarehouseWorkloadRow = {
  warehouseId: string
  warehouseName: string
  active: number
  released: number
  completedToday: number
  exceptions: number
  href: string
}

export type OrderAttentionCard = {
  orderId: string
  orderLabel: string
  type: string
  reason: string
  tone: 'warning' | 'danger' | 'neutral'
  href: string
}

export type OrderSummaryRow = {
  orderId: string
  orderLabel: string
  type: 'SALES' | 'PURCHASE' | 'TRANSFER' | 'RETURN' | 'ADJUSTMENT'
  warehouseId: string
  warehouseName: string
  status: string
  progressPercent: number
  assignedUserName?: string
  startedAt?: string
  lastActivityAt?: string
  href: string
}

export type OrdersDashboardDTO = {
  header: DashboardHeader
  kpis: DashboardKpi[]
  orderTypeDistribution: OrderTypeSlice[]
  statusBreakdown: OrderStatusBreakdown[]
  warehouseWorkload: WarehouseWorkloadRow[]
  attention: OrderAttentionCard[]
  orders: OrderSummaryRow[]
}
