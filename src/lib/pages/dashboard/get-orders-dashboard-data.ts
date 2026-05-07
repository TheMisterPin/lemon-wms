import type { PrismaClient } from '@/generated/prisma'

import {
  buildAttentionCards,
  buildOrderSummaryRows,
  buildWarehouseWorkload,
  getActiveAssignmentsByOrder,
  getAdjustmentOrderSummaries,
  getOrderStatusCounts,
  getPurchaseOrderSummaries,
  getReturnOrderSummaries,
  getSalesOrderSummaries,
  getTransferOrderSummaries
} from '@/lib/orders/orders-dashboard-queries'
import type { DashboardKpi } from '@/types/bin-detail-dashboard.types'
import type { OrdersDashboardDTO, OrderTypeSlice, OrderStatusBreakdown } from '@/types/orders-dashboard.types'

async function getOrdersDashboardData(prisma: PrismaClient): Promise<OrdersDashboardDTO> {
  const [pos, sos, tos, ros, aos, statusCounts] = await Promise.all([
    getPurchaseOrderSummaries(prisma),
    getSalesOrderSummaries(prisma),
    getTransferOrderSummaries(prisma),
    getReturnOrderSummaries(prisma),
    getAdjustmentOrderSummaries(prisma),
    getOrderStatusCounts(prisma)
  ])

  const allOrderIds = [
    ...pos.map((o) => o.id),
    ...sos.map((o) => o.id),
    ...tos.map((o) => o.id),
    ...ros.map((o) => o.id),
    ...aos.map((o) => o.id)
  ]

  const assignmentMap = await getActiveAssignmentsByOrder(prisma, allOrderIds)

  const orders = buildOrderSummaryRows(pos, sos, tos, ros, aos, assignmentMap)

  const get = (status: string) => statusCounts[status as keyof typeof statusCounts] ?? 0

  const released = get('RELEASED')
  const executing = get('EXECUTING')
  const paused = get('PAUSED')
  const completed = (get('EXECUTED') + get('SIGNED_OFF'))
  const exceptions = get('EXECUTED_WITH_PROBLEMS')
  const unassigned = orders.filter((o) => o.status === 'RELEASED' && !o.assignedUserName).length
  const assigned = orders.filter(
    (o) => o.status === 'RELEASED' && !!o.assignedUserName
  ).length

  const kpis: DashboardKpi[] = [
    { label: 'Released', value: String(released), tone: released > 0 ? 'yellow' : 'neutral' },
    { label: 'Unassigned', value: String(unassigned), tone: unassigned > 0 ? 'yellow' : 'neutral' },
    { label: 'Assigned', value: String(assigned), tone: assigned > 0 ? 'green' : 'neutral' },
    { label: 'Active', value: String(executing), tone: executing > 0 ? 'green' : 'neutral' },
    { label: 'Paused', value: String(paused), tone: paused > 0 ? 'yellow' : 'neutral' },
    { label: 'Completed', value: String(completed), tone: completed > 0 ? 'green' : 'neutral' },
    { label: 'Exceptions', value: String(exceptions), tone: exceptions > 0 ? 'red' : 'neutral' }
  ]

  const orderTypeDistribution: OrderTypeSlice[] = [
    { type: 'PURCHASE', count: pos.length, href: '/dashboard/orders/purchase' },
    { type: 'SALES', count: sos.length, href: '/dashboard/orders/sales' },
    { type: 'TRANSFER', count: tos.length, href: '/dashboard/orders/transfer' },
    { type: 'RETURN', count: ros.length, href: '/dashboard/orders/return' },
    { type: 'ADJUSTMENT', count: aos.length, href: '/dashboard/orders/adjustment' }
  ]

  const statusBreakdown: OrderStatusBreakdown[] = [
    {
      label: 'Overall',
      released,
      assigned,
      active: executing,
      paused,
      completed,
      exception: exceptions
    }
  ]

  const warehouseWorkload = buildWarehouseWorkload(orders)
  const attention = buildAttentionCards(orders)

  return {
    header: {
      title: 'Orders',
      subtitle: 'Cross-warehouse order status and workload overview'
    },
    kpis,
    orderTypeDistribution,
    statusBreakdown,
    warehouseWorkload,
    attention,
    orders
  }
}

export { getOrdersDashboardData }
