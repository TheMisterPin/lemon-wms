import type { DashboardHeader, DashboardKpi } from '@/types/bin-detail-dashboard.types'
import type { OrderMovementRow } from '@/types/order-detail-dashboard.types'

export type ItemWarehouseStockRow = {
  warehouseId: string
  warehouseName: string
  totalOnHand: number
  available: number
  reserved: number
  blocked: number
  binsCount: number
  href: string
}

export type ItemBinStockRow = {
  binStockItemId: string
  warehouseName: string
  zoneName: string
  binCode: string
  lotCode?: string
  serialNumber?: string
  available: number
  reserved: number
  blocked: number
  status: string
  href: string
}

export type ItemOrderRow = {
  orderId: string
  orderLabel: string
  type: string
  warehouseName: string
  requiredQty: number
  processedQty: number
  status: string
  href: string
}

export type ItemDetailDashboardDTO = {
  header: DashboardHeader & {
    itemId: string
    sku: string
    categoryName: string
    uom: string
    handlingFlags: string[]
  }
  kpis: DashboardKpi[]
  stockByWarehouse: ItemWarehouseStockRow[]
  stockByBin: ItemBinStockRow[]
  orders: ItemOrderRow[]
  movements: OrderMovementRow[]
}
