import type { OrderType, PrismaClient } from '@/generated/prisma'

import { getDevicesDashboardRecords, getTrolleyDashboardRecords, type DevicesDashboardFilters } from '@/lib/iam'
import type { DevicesDashboardDTO } from '@/types/devices-dashboard.types'

function deriveOnlineStatus(lastSeenAt: Date | null, persisted: 'ACTIVE' | 'IDLE' | 'OFFLINE') {
  if (persisted !== 'OFFLINE') {
    return persisted
  }

  if (!lastSeenAt) {
    return 'OFFLINE'
  }

  const ageMs = Date.now() - lastSeenAt.getTime()

  if (ageMs <= 5 * 60 * 1000) {
    return 'ACTIVE'
  }

  if (ageMs <= 60 * 60 * 1000) {
    return 'IDLE'
  }

  return 'OFFLINE'
}

function formatOrderFallback(orderType: OrderType, orderId: string) {
  return `${orderType.toLowerCase()} · ${orderId.slice(0, 8)}`
}

async function getOrderReferenceMap(
  prisma: PrismaClient,
  assignments: Array<{ orderId: string; orderType: OrderType }>
) {
  const byType = new Map<OrderType, string[]>()

  for (const assignment of assignments) {
    const ids = byType.get(assignment.orderType) ?? []
    ids.push(assignment.orderId)
    byType.set(assignment.orderType, ids)
  }

  const [purchase, sales, transfer, returns, adjustment] = await Promise.all([
    byType.has('PURCHASE')
      ? prisma.purchaseOrder.findMany({
        where: { id: { in: byType.get('PURCHASE') } },
        select: { id: true, reference: true }
      })
      : [],
    byType.has('SALES')
      ? prisma.salesOrder.findMany({
        where: { id: { in: byType.get('SALES') } },
        select: { id: true, reference: true }
      })
      : [],
    byType.has('TRANSFER')
      ? prisma.transferOrder.findMany({
        where: { id: { in: byType.get('TRANSFER') } },
        select: { id: true, reference: true }
      })
      : [],
    byType.has('RETURN')
      ? prisma.returnOrder.findMany({
        where: { id: { in: byType.get('RETURN') } },
        select: { id: true, reference: true }
      })
      : [],
    byType.has('ADJUSTMENT')
      ? prisma.adjustmentOrder.findMany({
        where: { id: { in: byType.get('ADJUSTMENT') } },
        select: { id: true, reference: true }
      })
      : []
  ])

  const referenceMap = new Map<string, string>()

  for (const row of purchase) {
    referenceMap.set(`PURCHASE:${row.id}`, row.reference)
  }
  for (const row of sales) {
    referenceMap.set(`SALES:${row.id}`, row.reference)
  }
  for (const row of transfer) {
    referenceMap.set(`TRANSFER:${row.id}`, row.reference)
  }
  for (const row of returns) {
    referenceMap.set(`RETURN:${row.id}`, row.reference)
  }
  for (const row of adjustment) {
    referenceMap.set(`ADJUSTMENT:${row.id}`, row.reference)
  }

  return referenceMap
}

async function getDevicesDashboardData(
  prisma: PrismaClient,
  filters?: DevicesDashboardFilters
): Promise<DevicesDashboardDTO> {
  const [devices, trolleys] = await Promise.all([
    getDevicesDashboardRecords(prisma, filters),
    getTrolleyDashboardRecords(prisma, filters)
  ])

  const activeAssignments = devices
    .flatMap((device) => device.orderAssignments)
    .map((assignment) => ({
      orderId: assignment.orderId,
      orderType: assignment.orderType
    }))

  const orderReferences = await getOrderReferenceMap(prisma, activeAssignments)

  const rows: DevicesDashboardDTO['devices'] = devices.map((device) => {
    const activeAssignment = device.orderAssignments[0]
    const orderLabel = activeAssignment
      ? orderReferences.get(`${activeAssignment.orderType}:${activeAssignment.orderId}`)
          ?? formatOrderFallback(activeAssignment.orderType, activeAssignment.orderId)
      : undefined

    return {
      deviceId: device.id,
      code: device.code,
      label: device.name,
      warehouseId: device.warehouseId ?? undefined,
      warehouseName: device.warehouse?.name ?? undefined,
      userId: device.lastUser?.id ?? undefined,
      userName: device.lastUser?.fullName ?? undefined,
      onlineStatus: deriveOnlineStatus(device.lastSeenAt, device.onlineStatus),
      authorizationStatus: device.authorized ? 'AUTHORIZED' : device.authorizationStatus,
      lastSeenAt: device.lastSeenAt?.toISOString(),
      currentOrderLabel: orderLabel,
      href: `/dashboard/auth/devices/${device.id}`
    }
  })

  const activeDeviceCount = rows.filter((row) => row.onlineStatus === 'ACTIVE').length
  const authorizedDeviceCount = rows.filter((row) => row.authorizationStatus === 'AUTHORIZED').length
  const pendingDeviceCount = rows.filter((row) => row.authorizationStatus === 'PENDING').length
  const offlineDeviceCount = rows.filter((row) => row.onlineStatus === 'OFFLINE').length
  const devicesWithActiveOrders = rows.filter((row) => row.currentOrderLabel !== undefined).length

  return {
    header: {
      title: 'Devices',
      subtitle: `${rows.length.toLocaleString()} devices · ${trolleys.length.toLocaleString()} trolleys in dashboard scope`
    },
    kpis: [
      {
        label: 'Active devices',
        value: activeDeviceCount.toLocaleString(),
        helper: 'Heartbeat within the active window',
        tone: 'success'
      },
      {
        label: 'Authorized devices',
        value: authorizedDeviceCount.toLocaleString(),
        helper: 'Ready for floor or office sign-in',
        tone: 'neutral'
      },
      {
        label: 'Pending authorization',
        value: pendingDeviceCount.toLocaleString(),
        helper: 'Awaiting office approval',
        tone: 'warning'
      },
      {
        label: 'Offline devices',
        value: offlineDeviceCount.toLocaleString(),
        helper: 'No recent heartbeat detected',
        tone: 'warning'
      },
      {
        label: 'Devices with active orders',
        value: devicesWithActiveOrders.toLocaleString(),
        helper: 'Currently assigned to live work',
        tone: 'success'
      },
      {
        label: 'Devices linked to trolleys',
        value: trolleys.filter((trolley) => trolley.currentDevice !== null).length.toLocaleString(),
        helper: 'Physical trolley links in the current scope',
        tone: 'neutral'
      }
    ],
    tabs: [
      { key: 'ACTIVE', label: 'Active', count: activeDeviceCount },
      { key: 'AUTHORIZED', label: 'Authorized', count: authorizedDeviceCount },
      { key: 'PENDING', label: 'Pending authorization', count: pendingDeviceCount },
      { key: 'OFFLINE', label: 'Offline', count: offlineDeviceCount }
    ],
    devices: rows,
    trolleys: trolleys.map((trolley) => ({
      trolleyId: trolley.id,
      code: trolley.code,
      deviceCode: trolley.currentDevice?.code ?? undefined,
      userName: trolley.currentUser?.fullName ?? undefined,
      warehouseName: trolley.warehouse.name,
      itemCount: trolley._count.transitBinStockItems,
      linkedOrdersCount: trolley._count.orderAssignments,
      href: `/dashboard/auth/devices/${trolley.currentDevice?.code ?? trolley.id}`
    }))
  }
}

export { getDevicesDashboardData }
