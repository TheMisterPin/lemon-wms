/**
 * @generated-doc-link
 * @doc .docs/developer/refactors/components/misc/warehouse/home/types.md
 */

import type { BinDirectoryRow } from '@/components/configs/entities/bin/bin-directory-table'
import type { DashboardInfoCardItem } from '@/components/dashboard/primitives/dashboard-info-card'
import type { DashboardRecordListItem } from '@/components/dashboard/primitives/dashboard-record-list-section'

export type WarehouseOrderRecord = {
  id: string
  reference: string
  status: 'RELEASED' | 'EXECUTING' | 'PAUSED'
  type: 'PURCHASE' | 'SALES' | 'TRANSFER'
  infoLabel: string
  infoValue: string
  assignedTo: string
  assignedUserId: string | null
  lastActiveAt: string | null
  pausedAt: string | null
  progress: number
  createdAt: string
}

export type WarehouseHomeUser = {
  userId: string
  name: string
  role: string
}

export type WarehouseInfo = {
  warehouseId: string
  warehouseName: string
  zoneId: string
  zoneName: string
  deviceId: string
  deviceName: string
}

export type WarehouseHomeData = {
  user: WarehouseHomeUser
  warehouseInfo: WarehouseInfo
  orders: WarehouseOrderRecord[]
  activeExecutingOrder: WarehouseOrderRecord | null
  bins: BinDirectoryRow[]
}

export type WarehouseBinRecord = BinDirectoryRow

export type { DashboardInfoCardItem, DashboardRecordListItem }
