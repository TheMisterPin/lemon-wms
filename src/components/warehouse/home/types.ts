import type { DashboardInfoCardItem } from '@/components/dashboard/dashboard-info-card'
import type { DashboardRecordListItem } from '@/components/dashboard/dashboard-record-list-section'
import type { BinDirectoryRow } from '@/components/configs/entities/bin/bin-directory-table'

export type WarehouseOrderRecord = {
  id: string
  status: string
  type: string
  assignedTo: string
  progress: number
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
  warehouseInfo: WarehouseInfo
  orders: WarehouseOrderRecord[]
  bins: BinDirectoryRow[]
}

export type WarehouseBinRecord = BinDirectoryRow

export type { DashboardInfoCardItem, DashboardRecordListItem }
