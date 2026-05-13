import type { OrderType, PrismaClient } from '@/generated/prisma'

import { DomainError } from '@/lib/errors'
import { getDeviceDetailRecord } from '@/lib/iam/devices/devices-dashboard-queries'
import { computePickLineProgressPercent } from '@/lib/orders/shared/pick-line-progress'
import { computePurchaseOrderProgressPercentFromMasterLines } from '@/lib/orders/shared/order-progress'
import type { DashboardKpi } from '@/types/bin-detail-dashboard.types'
import type { DeviceDetailDashboardDTO, DeviceCurrentWorkRow, DeviceActivityRow } from '@/types/device-detail-dashboard.types'

function formatOrderHref(orderType: OrderType, orderId: string): string {
  const typeSlug: Record<OrderType, string> = {
    PURCHASE: 'purchase',
    SALES: 'sales',
    TRANSFER: 'transfer',
    RETURN: 'return',
    ADJUSTMENT: 'adjustment'
  }

  return `/dashboard/orders/${typeSlug[orderType] ?? 'purchase'}/${orderId}`
}

async function resolveOrderProgress(
  prisma: PrismaClient,
  orderId: string,
  orderType: OrderType
): Promise<{ reference: string; progressPercent: number }> {
  if (orderType === 'PURCHASE') {
    const order = await prisma.purchaseOrder.findFirst({
      where: { id: orderId },
      select: {
        reference: true,
        lines: {
          select: {
            orderedQuantity: true,
            receiptLines: { select: { quantity: true } }
          }
        }
      }
    })

    if (!order) {
      return { reference: orderId, progressPercent: 0 }
    }

    return {
      reference: order.reference,
      progressPercent: computePurchaseOrderProgressPercentFromMasterLines(order.lines)
    }
  }

  if (orderType === 'SALES') {
    const order = await prisma.salesOrder.findFirst({
      where: { id: orderId },
      select: {
        reference: true,
        lines: { select: { baseQuantity: true, pickLines: { select: { quantity: true } } } }
      }
    })

    if (!order) {
      return { reference: orderId, progressPercent: 0 }
    }

    return {
      reference: order.reference,
      progressPercent: computePickLineProgressPercent(order.lines)
    }
  }

  if (orderType === 'TRANSFER') {
    const order = await prisma.transferOrder.findFirst({
      where: { id: orderId },
      select: {
        reference: true,
        lines: { select: { baseQuantity: true, pickLines: { select: { quantity: true } } } }
      }
    })

    if (!order) {
      return { reference: orderId, progressPercent: 0 }
    }

    return {
      reference: order.reference,
      progressPercent: computePickLineProgressPercent(order.lines)
    }
  }

  if (orderType === 'RETURN') {
    const order = await prisma.returnOrder.findFirst({
      where: { id: orderId },
      select: {
        reference: true,
        lines: { select: { baseQuantity: true, pickLines: { select: { quantity: true } } } }
      }
    })

    if (!order) {
      return { reference: orderId, progressPercent: 0 }
    }

    return {
      reference: order.reference,
      progressPercent: computePickLineProgressPercent(order.lines)
    }
  }

  if (orderType === 'ADJUSTMENT') {
    const order = await prisma.adjustmentOrder.findFirst({
      where: { id: orderId },
      select: {
        reference: true,
        lines: { select: { baseQuantity: true, pickLines: { select: { quantity: true } } } }
      }
    })

    if (!order) {
      return { reference: orderId, progressPercent: 0 }
    }

    return {
      reference: order.reference,
      progressPercent: computePickLineProgressPercent(order.lines)
    }
  }

  return { reference: orderId, progressPercent: 0 }
}

async function getDeviceDetailDashboardData(
  prisma: PrismaClient,
  deviceId: string
): Promise<DeviceDetailDashboardDTO> {
  const device = await getDeviceDetailRecord(prisma, deviceId)

  if (!device) {
    throw new DomainError('Device not found.', 'NOT_FOUND', 404)
  }

  // Resolve order progress for active assignments in parallel
  const currentWork: DeviceCurrentWorkRow[] = await Promise.all(
    device.orderAssignments.map(async (a) => {
      const { reference, progressPercent } = await resolveOrderProgress(
        prisma,
        a.orderId,
        a.orderType
      )

      return {
        orderId: a.orderId,
        orderLabel: reference,
        orderType: a.orderType,
        progressPercent,
        userId: a.user?.id,
        userName: a.user?.fullName ?? undefined,
        startedAt: a.startedAt?.toISOString() ?? a.assignedAt?.toISOString(),
        href: formatOrderHref(a.orderType, a.orderId)
      }
    })
  )

  const activity: DeviceActivityRow[] = device.userActivityEntries.map((e) => ({
    id: e.id,
    occurredAt: e.createdAt.toISOString(),
    userId: e.userId,
    userName: e.user.fullName ?? e.userId,
    action: e.actionType,
    entityType: e.entityType,
    entityId: e.entityId,
    warehouseName: e.warehouse?.name,
    notes: e.notes ?? undefined
  }))

  const kpis: DashboardKpi[] = [
    {
      label: 'Status',
      value: device.onlineStatus,
      helper: 'Heartbeat / connectivity',
      tone: device.onlineStatus === 'ACTIVE' ? 'success' : device.onlineStatus === 'IDLE' ? 'warning' : 'danger'
    },
    {
      label: 'Authorization',
      value: device.authorizationStatus,
      helper: 'Office approval state',
      tone:
        device.authorizationStatus === 'AUTHORIZED'
          ? 'success'
          : device.authorizationStatus === 'PENDING'
            ? 'warning'
            : 'danger'
    },
    {
      label: 'Active Jobs',
      value: String(device.orderAssignments.length),
      helper: 'Open order assignments',
      tone: device.orderAssignments.length > 0 ? 'success' : 'neutral'
    },
    {
      label: 'Error Count',
      value: String(device.errorCount),
      helper: 'Recorded device errors',
      tone: device.errorCount > 0 ? 'danger' : 'neutral'
    },
    {
      label: 'Total Sessions',
      value: String(device._count.deviceSessions),
      helper: 'Historical sign-ins',
      tone: 'neutral'
    },
    {
      label: 'Activity Entries',
      value: String(device._count.userActivityEntries),
      helper: 'Logged user actions',
      tone: 'neutral'
    }
  ]

  return {
    header: {
      title: device.name,
      subtitle: device.warehouseId
        ? `Assigned to ${device.warehouse?.name ?? device.warehouseId}`
        : 'Not assigned to a warehouse',
      deviceId: device.id,
      deviceCode: device.code,
      deviceName: device.name,
      authorizationStatus: device.authorizationStatus,
      onlineStatus: device.onlineStatus,
      warehouseId: device.warehouseId ?? undefined,
      warehouseName: device.warehouse?.name,
      currentUserName: device.lastUser?.fullName ?? undefined,
      lastSeenAt: device.lastSeenAt?.toISOString()
    },
    kpis,
    currentWork,
    activity
  }
}

export { getDeviceDetailDashboardData }
