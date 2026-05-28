import type { WarehouseOrderRecord } from '@/components/warehouse/orders/types'

export function resolveLastUserOrder(
  orders: WarehouseOrderRecord[],
  userId: string | null
): WarehouseOrderRecord | null {
  if (!userId) {
    return null
  }

  const userOrders = orders.filter((order) => order.assignedUserId === userId)

  return [...userOrders].sort((a, b) => {
    const aTime = new Date(a.lastActiveAt ?? a.pausedAt ?? a.createdAt).getTime()
    const bTime = new Date(b.lastActiveAt ?? b.pausedAt ?? b.createdAt).getTime()

    return bTime - aTime
  })[0] ?? null
}

export function warehouseOrderDetailHref(order: WarehouseOrderRecord): string {
  if (order.type === 'PURCHASE') {
    return `/warehouse/orders/purchase/${encodeURIComponent(order.id)}`
  }
  if (order.type === 'SALES') {
    return `/warehouse/orders/sales`
  }

  return '/warehouse/orders/transfer'
}
