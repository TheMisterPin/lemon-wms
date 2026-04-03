import { NextRequest } from 'next/server'

import { fail, ok, unauthorized } from '@/lib/api/response'
import { verifyAccessTokenFromRequest } from '@/lib/auth/middleware'
import { getBinList } from '@/lib/entities/bins'
import prisma from '@/lib/prisma'

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
  const mappedPurchaseOrders = purchaseOrders.map(order => ({ ...order, type: 'PURCHASE' }))
  const mappedTransferOrders = transferOrders.map(order => ({ ...order, type: 'TRANSFER' }))
  const mappedSalesOrders = salesOrders.map(order => ({ ...order, type: 'SALES' }))
  const rawOrders = [...mappedPurchaseOrders, ...mappedTransferOrders, ...mappedSalesOrders]
  const afterAllOrders = rawOrders.map(order => ({ ...order, progress: Math.floor(Math.random() * 101) }))

  return afterAllOrders
}
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
    const userInfo  = {
      userId: user.id,
      name: user.fullName,
      role: user.role
    }
    const deviceID = user.lastLoginDeviceId
    if (!deviceID) {
      return fail('User is not associated with any device.')
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
    const bins = await getBinList(prisma, device?.zoneId ?? '')
    const orders = await getOrdersForWarehouseHomePage(device?.warehouseId ?? '')
    const warehouseHomePageData = {
      userInfo,
      warehouseInfo,
      orders,
      bins: bins
    }

    return ok(warehouseHomePageData, 'Warehouse home page data retrieved successfully.')
  } catch (error) {
    console.error('[GET /api/warehouse]', error)

    return fail('Failed to retrieve warehouse home page data.')
  }
}
