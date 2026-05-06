import type { WarehouseStockDashboardKpiRow } from '@/types/warehouse-stock-dashboard.types'

/** Shared dashboard header fragment used by scoped overview pages. */
export type DashboardHeader = {
  title: string
  subtitle: string
}

export type DashboardKpi = WarehouseStockDashboardKpiRow

export type BinFillOverTimePoint = {
  occurredAt: string
  unitsOnHand: number
  /** Present when `bin.maxCapacity` is set; otherwise `null`. */
  fillPercent: number | null
}

export type BinContentRow = {
  binStockItemId: string
  itemId: string
  sku: string
  name: string
  lotCode?: string
  serialNumber?: string
  uom: string
  available: number
  reserved: number
  blocked: number
  status: 'AVAILABLE' | 'RESERVED' | 'BLOCKED' | 'IN_TRANSIT'
  lastOperationLabel: string
  href: string
}

export type BinActivityRow = {
  id: string
  occurredAt: string
  action: 'PUTAWAY' | 'PICK' | 'MOVE_IN' | 'MOVE_OUT' | 'BLOCK' | 'UNBLOCK'
  userName: string
  orderLabel?: string
  quantity: number
  fromBinCode?: string
  toBinCode?: string
}

export type BinDetailDashboardDTO = {
  header: DashboardHeader & {
    binId: string
    binCode: string
    binType: string
    zoneId: string
    zoneName: string
    warehouseId: string
    warehouseName: string
    isBlocked: boolean
  }
  kpis: DashboardKpi[]
  fillOverTime: BinFillOverTimePoint[]
  contents: BinContentRow[]
  activity: BinActivityRow[]
}
