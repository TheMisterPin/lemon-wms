import { NextRequest } from 'next/server'

import { fail, ok, unauthorized } from '@/lib/api/response'
import { verifyAccessTokenFromRequest } from '@/lib/auth/middleware'
import { getBinList, getBins } from '@/lib/locations'
import { logAppError } from '@/lib/logs/app-logger'
import { getWarehouseOrderPoolRecords, resolveWarehouseActiveExecutingPoolRecord } from '@/lib/orders/shared/warehouse-order-pool-queries'
import prisma from '@/lib/prisma'

function toNumberOrZero(value: unknown): number {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return value
  }

  if (
    value !== null
    && typeof value === 'object'
    && 'toNumber' in value
    && typeof value.toNumber === 'function'
  ) {
    const parsed = value.toNumber()

    return Number.isFinite(parsed) ? parsed : 0
  }

  if (typeof value === 'string' && value.trim() !== '') {
    const parsed = Number(value)

    if (Number.isFinite(parsed)) {
      return parsed
    }
  }

  return 0
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
    const binIds = bins.map((bin) => bin.id)
    const binStockRows =
      binIds.length === 0
        ? []
        : await prisma.binStockItem.findMany({
          where: { binId: { in: binIds } },
          select: {
            binId: true,
            status: true,
            quantityAvailable: true,
            quantityReserved: true,
            quantityBlocked: true
          }
        })
    const stockCapacityByBin = new Map<string, number>()

    for (const row of binStockRows) {
      if (row.status === 'IN_TRANSIT') {
        continue
      }

      const total = row.status === 'RESERVED'
        ? toNumberOrZero(row.quantityReserved)
        : row.status === 'BLOCKED'
          ? toNumberOrZero(row.quantityBlocked)
          : toNumberOrZero(row.quantityAvailable)

      stockCapacityByBin.set(row.binId, (stockCapacityByBin.get(row.binId) ?? 0) + total)
    }

    const normalizedBins = bins.map((bin) => {
      const maxCapacity = toNumberOrZero(bin.maxCapacity)
      const stockCapacity = stockCapacityByBin.get(bin.id) ?? 0
      const storedCapacity = toNumberOrZero(bin.currentCapacity)
      const currentCapacity = stockCapacity > 0 ? stockCapacity : storedCapacity
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

    const warehouseIdForPool = payload.warehouseId ?? device?.warehouseId ?? ''

    const orders = await getWarehouseOrderPoolRecords(prisma, warehouseIdForPool)
    const activeExecutingOrder =
      warehouseIdForPool.trim() !== ''
        ? await resolveWarehouseActiveExecutingPoolRecord(prisma, warehouseIdForPool, user.id, orders)
        : null
    const warehouseHomePageData = {
      user: userData,
      warehouseInfo,
      orders,
      activeExecutingOrder,
      bins: normalizedBins,
      binList
    }

    return ok(warehouseHomePageData, 'Warehouse home page data retrieved successfully.')
  } catch (error) {
    logAppError('[GET /api/warehouse]', error)

    return fail('Failed to retrieve warehouse home page data.', '', 500)
  }
}
