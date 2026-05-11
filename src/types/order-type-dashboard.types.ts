export type OrderTypeOverviewOrderCard = {
  orderId: string
  orderLabel: string
  status: string
  warehouseId: string
  warehouseName: string
  progressPercent: number
  href: string
  createdAt: string
}

export type OrderTypeOverviewStatusSlice = {
  status: string
  count: number
}

export type OrderTypeOverviewWarehouseBarRow = {
  warehouseId: string
  warehouseName: string
  href: string
  /** Counts per `OrderStatus` string for stacked bars */
  byStatus: Record<string, number>
}

export type OrderTypeOverviewActivityItem = {
  id: string
  createdAt: string
  /** Assignment lifecycle status for this `OrderAssignment` row (humanized in UI). */
  activityType: string
  userName: string
  orderId: string
  orderLabel: string
  href: string
}

export type OrderTypeDashboardDTO = {
  title: string
  orderTypeRouteKey: 'purchase' | 'sales' | 'transfer'
  kpis: {
    totalOrders: number
    warehousesWithOrders: number
    aggregateProgressPercent: number
  }
  statusDonut: OrderTypeOverviewStatusSlice[]
  warehouseBars: OrderTypeOverviewWarehouseBarRow[]
  orders: OrderTypeOverviewOrderCard[]
  activities: OrderTypeOverviewActivityItem[]
}
