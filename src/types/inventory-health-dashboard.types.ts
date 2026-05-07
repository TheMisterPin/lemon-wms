import type { DashboardHeader, DashboardKpi } from '@/types/bin-detail-dashboard.types'

export type InventoryHealthIssueSlice = {
  type: 'LOW_STOCK' | 'OVERSTOCK' | 'BLOCKED' | 'QUARANTINE' | 'EXPIRING' | 'INVALID_STATE'
  count: number
}

export type CategoryHealthRow = {
  categoryId: string
  categoryName: string
  lowStock: number
  blocked: number
  expiring: number
  quarantine: number
  href: string
}

export type WarehouseHealthRow = {
  warehouseId: string
  warehouseName: string
  issueCount: number
  criticalCount: number
  warningCount: number
  href: string
}

export type InventoryHealthAlert = {
  id: string
  title: string
  entityLabel: string
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW'
  reason: string
  href: string
}

export type InventoryHealthIssueRow = {
  issueId: string
  type: string
  entityLabel: string
  warehouseName: string
  severity: string
  quantity?: number
  detectedAt: string
  href: string
}

export type InventoryHealthDashboardDTO = {
  header: DashboardHeader
  kpis: DashboardKpi[]
  issueDistribution: InventoryHealthIssueSlice[]
  categoryHealth: CategoryHealthRow[]
  warehouseHealth: WarehouseHealthRow[]
  alerts: InventoryHealthAlert[]
  issues: InventoryHealthIssueRow[]
}
