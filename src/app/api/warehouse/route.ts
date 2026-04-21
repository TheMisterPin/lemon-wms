import { NextRequest } from 'next/server'

import { fail, ok, unauthorized } from '@/lib/api/response'
import { verifyAccessTokenFromRequest } from '@/lib/auth/middleware'
import { getBinList, getBins } from '@/lib/locations'
import prisma from '@/lib/prisma'

function toNumberOrZero(value: unknown): number {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return value
  }

  if (typeof value === 'string' && value.trim() !== '') {
    const parsed = Number(value)

    if (Number.isFinite(parsed)) {
      return parsed
    }
  }

  return 0
}

async function getOrdersForWarehouseHomePage(warehouseId: string) {
  const purchaseOrders = await prisma.purchaseOrder.findMany({
    where: { warehouseId },
    select: {
      id: true,
      status: true
    },
    orderBy: { createdAt: 'desc' }
  })
  const transferOrders = await prisma.transferOrder.findMany({
    where: { warehouseId },
    select: {
      id: true,
      status: true
    },
    orderBy: { createdAt: 'desc' }
  })
  const salesOrders = await prisma.salesOrder.findMany({
    where: { warehouseId },
    select: {
      id: true,
      status: true
    },
    orderBy: { createdAt: 'desc' }
  })
  const mappedPurchaseOrders = purchaseOrders.map(order => ({ ...order, type: 'PURCHASE', assignedTo: 'Unassigned' }))
  const mappedTransferOrders = transferOrders.map(order => ({ ...order, type: 'TRANSFER', assignedTo: 'Unassigned' }))
  const mappedSalesOrders = salesOrders.map(order => ({ ...order, type: 'SALES', assignedTo: 'Unassigned' }))
  const rawOrders = [...mappedPurchaseOrders, ...mappedTransferOrders, ...mappedSalesOrders]
  const afterAllOrders = rawOrders.map(order => ({ ...order, progress: Math.floor(Math.random() * 101) }))

  return afterAllOrders
}
/**
 * @swagger
 * /api/warehouse:
 *   get:
 *     summary: GET /api/warehouse
 *     tags: [Warehouse]
 *     responses:
 *       200:
 *         description: Successful response
 */
export async function GET(req: NextRequest) {
  const payload = verifyAccessTokenFromRequest(req)
  if (!payload) {
    return unauthorized()
  }
  const userID = payload.userId
  const user = await prisma.user.findUnique({ where: { id: userID } })
  if (!user) {
    return unauthorized()
  }

  try {
    const userData = {
      userId: user.id,
      name: user.fullName,
      role: user.role
    }
    const deviceID = user.lastLoginDeviceId
    if (!deviceID) {
      return fail('User is not associated with any device.', '400', 400)
    }
    const device = await prisma.device.findFirst({
      where: { id: deviceID },
      select: { id: true, name: true, zoneId: true, warehouseId: true }
    })
    const warehouse = await prisma.warehouse.findFirst({
      where: { id: device?.warehouseId ?? '' },
      select: { id: true, name: true }
    })
    const zone = await prisma.zone.findFirst({
      where: { id: device?.zoneId ?? '' },
      select: { id: true, name: true }
    })
    const warehouseInfo = {
      warehouseId: device?.warehouseId ?? '',
      warehouseName: warehouse?.name ?? '',
      zoneId: device?.zoneId ?? '',
      zoneName: zone?.name ?? '',
      deviceId: device?.id ?? '',
      deviceName: device?.name ?? ''
    }
    const binList = await getBinList(prisma, device?.zoneId ?? '')
    const bins = await getBins(prisma, { zoneId: device?.zoneId ?? '' })
    const normalizedBins = bins.map((bin) => {
      const maxCapacity = toNumberOrZero(bin.maxCapacity)
      const currentCapacity = toNumberOrZero(bin.currentCapacity)
      const filledPercentage =
        maxCapacity > 0 ? (currentCapacity / maxCapacity) * 100 : null

      return {
        id: bin.id,
        zoneId: bin.zoneId,
        name: bin.name,
        code: bin.code,
        isBlocked: bin.isBlocked,
        blockReason: bin.blockReason,
        type: bin.type,
        maxCapacity,
        currentCapacity,
        filledPercentage,
        itemsInBin: bin._count.binStockItems
      }
    })

    const orders = await getOrdersForWarehouseHomePage(device?.warehouseId ?? '')
    const warehouseHomePageData = {
      user: userData,
      warehouseInfo,
      orders,
      bins: normalizedBins,
      binList
    }

    return ok(warehouseHomePageData, 'Warehouse home page data retrieved successfully.')
  } catch (error) {
    console.error('[GET /api/warehouse]', error)

    return fail('Failed to retrieve warehouse home page data.', '', 500)
  }
}
