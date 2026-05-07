import type { OrderType, PrismaClient } from '@/generated/prisma'

import { DomainError } from '@/lib/errors'
import { getOrderDetailByType } from '@/lib/orders/order-detail-dashboard-queries'
import type { DashboardKpi } from '@/types/bin-detail-dashboard.types'
import type {
  OrderActivityRow,
  OrderAssignmentRow,
  OrderDetailDashboardDTO,
  OrderMovementRow
} from '@/types/order-detail-dashboard.types'

function mapOrderTypeSlug(orderType: string): OrderType {
  const normalized = orderType.trim().toUpperCase()
  if (normalized === 'PURCHASE') {
    return 'PURCHASE'
  }
  if (normalized === 'SALES') {
    return 'SALES'
  }
  if (normalized === 'TRANSFER') {
    return 'TRANSFER'
  }
  if (normalized === 'RETURN') {
    return 'RETURN'
  }
  if (normalized === 'ADJUSTMENT') {
    return 'ADJUSTMENT'
  }

  throw new DomainError('Unsupported order type.', 'VALIDATION_ERROR', 400)
}

function durationLabel(startedAt?: Date | null, endedAt?: Date | null): string | undefined {
  if (!startedAt || !endedAt) {
    return undefined
  }

  const minutes = Math.max(0, Math.round((endedAt.getTime() - startedAt.getTime()) / 60000))
  if (minutes < 60) {
    return `${minutes}m`
  }

  const hours = Math.floor(minutes / 60)
  const remainder = minutes % 60

  return `${hours}h ${remainder}m`
}

export async function getOrderDetailDashboardData(
  prisma: PrismaClient,
  orderTypeParam: string,
  orderId: string
): Promise<OrderDetailDashboardDTO> {
  const orderType = mapOrderTypeSlug(orderTypeParam)
  const detail = await getOrderDetailByType(prisma, orderType, orderId)

  const [assignments, activities, movements] = await Promise.all([
    prisma.orderAssignment.findMany({
      where: { orderType, orderId },
      orderBy: { assignedAt: 'desc' },
      select: {
        id: true,
        userId: true,
        status: true,
        assignedAt: true,
        startedAt: true,
        pausedAt: true,
        completedAt: true,
        user: { select: { fullName: true } }
      }
    }),
    prisma.orderExecutionActivity.findMany({
      where: { orderType, orderId },
      orderBy: { createdAt: 'desc' },
      take: 100,
      select: {
        id: true,
        createdAt: true,
        activityType: true,
        notes: true,
        orderLineRefId: true,
        user: { select: { fullName: true } }
      }
    }),
    prisma.binOperationEntry.findMany({
      where: { orderType, orderId },
      orderBy: { createdAt: 'desc' },
      take: 100,
      select: {
        id: true,
        createdAt: true,
        quantity: true,
        warItemId: true,
        fromBinId: true,
        toBinId: true,
        user: { select: { fullName: true } }
      }
    })
  ])

  const itemIds = Array.from(new Set(movements.map((entry) => entry.warItemId)))
  const binIds = Array.from(
    new Set(
      movements.flatMap((entry) => [entry.fromBinId, entry.toBinId]).filter((id): id is string => Boolean(id))
    )
  )

  const [items, bins] = await Promise.all([
    itemIds.length > 0
      ? prisma.item.findMany({ where: { id: { in: itemIds } }, select: { id: true, sku: true } })
      : Promise.resolve([]),
    binIds.length > 0
      ? prisma.bin.findMany({ where: { id: { in: binIds } }, select: { id: true, code: true } })
      : Promise.resolve([])
  ])

  const itemSkuMap = new Map(items.map((item) => [item.id, item.sku]))
  const binCodeMap = new Map(bins.map((bin) => [bin.id, bin.code]))

  const assignmentRows: OrderAssignmentRow[] = assignments.map((assignment) => ({
    assignmentId: assignment.id,
    userId: assignment.userId,
    userName: assignment.user.fullName,
    status: assignment.status,
    startedAt: assignment.startedAt?.toISOString() ?? assignment.assignedAt.toISOString(),
    pausedAt: assignment.pausedAt?.toISOString(),
    completedAt: assignment.completedAt?.toISOString(),
    durationLabel: durationLabel(assignment.startedAt ?? assignment.assignedAt, assignment.completedAt)
  }))

  const activityRows: OrderActivityRow[] = activities.map((activity) => ({
    activityId: activity.id,
    occurredAt: activity.createdAt.toISOString(),
    userName: activity.user.fullName,
    action: activity.activityType,
    lineLabel: activity.orderLineRefId ?? undefined,
    details: activity.notes ?? 'No details'
  }))

  const movementRows: OrderMovementRow[] = movements.map((movement) => ({
    movementId: movement.id,
    occurredAt: movement.createdAt.toISOString(),
    sku: itemSkuMap.get(movement.warItemId) ?? movement.warItemId,
    fromBinCode: movement.fromBinId ? (binCodeMap.get(movement.fromBinId) ?? movement.fromBinId) : undefined,
    toBinCode: movement.toBinId ? (binCodeMap.get(movement.toBinId) ?? movement.toBinId) : undefined,
    quantity: Math.round(movement.quantity.toNumber() * 100) / 100,
    boeId: movement.id,
    userName: movement.user.fullName
  }))

  const totalLines = detail.lines.length
  const completedLines = detail.lines.filter((line) => line.status === 'COMPLETED').length
  const remainingLines = totalLines - completedLines
  const exceptions = detail.lines.filter((line) => line.status === 'EXCEPTION').length
  const rejectedQuantity = detail.lines
    .filter((line) => line.status === 'EXCEPTION')
    .reduce((sum, line) => sum + line.remainingQty, 0)

  const durationMinutes = assignmentRows
    .map((row) => {
      if (!row.startedAt || !row.completedAt) {
        return null
      }

      return Math.max(0, Math.round((new Date(row.completedAt).getTime() - new Date(row.startedAt).getTime()) / 60000))
    })
    .filter((value): value is number => value !== null)

  const avgDuration = durationMinutes.length > 0
    ? `${Math.round(durationMinutes.reduce((sum, value) => sum + value, 0) / durationMinutes.length)}m`
    : '—'

  const kpis: DashboardKpi[] = [
    { label: 'Total lines', value: String(totalLines), tone: 'neutral' },
    { label: 'Completed lines', value: String(completedLines), tone: completedLines > 0 ? 'green' : 'neutral' },
    { label: 'Remaining lines', value: String(Math.max(0, remainingLines)), tone: remainingLines > 0 ? 'yellow' : 'green' },
    { label: 'Expected qty', value: String(Math.round(detail.expectedTotal)), tone: 'neutral' },
    { label: 'Processed qty', value: String(Math.round(detail.processedTotal)), tone: detail.processedTotal > 0 ? 'green' : 'neutral' },
    { label: 'Rejected qty', value: String(Math.round(rejectedQuantity)), tone: rejectedQuantity > 0 ? 'red' : 'neutral' },
    { label: 'Exceptions', value: String(exceptions), tone: exceptions > 0 ? 'red' : 'neutral' },
    { label: 'Avg duration', value: avgDuration, tone: 'neutral' }
  ]

  return {
    header: {
      title: detail.header.orderLabel,
      subtitle: `${detail.header.warehouseName} · ${detail.header.status}`,
      orderId: detail.header.orderId,
      orderLabel: detail.header.orderLabel,
      orderType: detail.header.orderType,
      warehouseName: detail.header.warehouseName,
      progressPercent: detail.header.progressPercent
    },
    kpis,
    lines: detail.lines,
    assignments: assignmentRows,
    activity: activityRows,
    movements: movementRows
  }
}
