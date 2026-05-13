import type { PrismaClient } from '@/generated/prisma'

import { DomainError } from '@/lib/errors'
import { sumPickLineQuantities } from '@/lib/orders/shared/pick-line-progress'
import type { DashboardKpi } from '@/types/bin-detail-dashboard.types'
import type { ItemDetailDashboardDTO, ItemOrderRow } from '@/types/item-detail-dashboard.types'
import type { OrderMovementRow } from '@/types/order-detail-dashboard.types'

function toQty(value: { toNumber(): number }): number {
  return Math.round(value.toNumber() * 100) / 100
}

function orderHref(type: string, id: string): string {
  return `/dashboard/orders/${type.toLowerCase()}/${id}`
}

export async function getItemDetailDashboardData(
  prisma: PrismaClient,
  itemId: string
): Promise<ItemDetailDashboardDTO> {
  const item = await prisma.item.findUnique({
    where: { id: itemId },
    select: {
      id: true,
      sku: true,
      name: true,
      uom: true,
      minQuantity: true,
      category: { select: { name: true, handlingFlags: true } }
    }
  })

  if (!item) {
    throw new DomainError('Item not found.', 'NOT_FOUND', 404)
  }

  const [stockRows, lots, movements, purchaseLines, salesLines, transferLines, returnLines, adjustmentLines] = await Promise.all([
    prisma.binStockItem.findMany({
      where: { itemId },
      select: {
        id: true,
        quantityAvailable: true,
        quantityReserved: true,
        quantityBlocked: true,
        status: true,
        lot: { select: { lotNumber: true } },
        serialNumber: { select: { serial: true } },
        bin: {
          select: {
            id: true,
            code: true,
            warehouseId: true,
            warehouse: { select: { name: true } },
            zone: { select: { name: true } }
          }
        }
      }
    }),
    prisma.lot.findMany({ where: { itemId, expiryDate: { not: null } }, select: { expiryDate: true } }),
    prisma.binOperationEntry.findMany({
      where: { warItemId: itemId },
      orderBy: { createdAt: 'desc' },
      take: 100,
      select: {
        id: true,
        createdAt: true,
        quantity: true,
        fromBinId: true,
        toBinId: true,
        user: { select: { fullName: true } }
      }
    }),
    prisma.purchaseOrderLine.findMany({
      where: { itemId, purchaseOrder: { deletedAt: null } },
      select: {
        orderedQuantity: true,
        purchaseOrderId: true,
        purchaseOrder: {
          select: {
            id: true,
            reference: true,
            status: true,
            warehouse: { select: { name: true } }
          }
        },
        receiptLines: { select: { quantity: true } }
      },
      take: 30
    }),
    prisma.salesOrderLine.findMany({
      where: { itemId, salesOrder: { deletedAt: null } },
      select: {
        baseQuantity: true,
        pickLines: { select: { quantity: true } },
        salesOrder: {
          select: {
            id: true,
            reference: true,
            status: true,
            warehouse: { select: { name: true } }
          }
        }
      },
      take: 30
    }),
    prisma.transferOrderLine.findMany({
      where: { itemId, transferOrder: { deletedAt: null } },
      select: {
        baseQuantity: true,
        pickLines: { select: { quantity: true } },
        transferOrder: {
          select: {
            id: true,
            reference: true,
            status: true,
            warehouse: { select: { name: true } }
          }
        }
      },
      take: 30
    }),
    prisma.returnOrderLine.findMany({
      where: { itemId, returnOrder: { deletedAt: null } },
      select: {
        baseQuantity: true,
        pickLines: { select: { quantity: true } },
        returnOrder: {
          select: {
            id: true,
            reference: true,
            status: true,
            warehouse: { select: { name: true } }
          }
        }
      },
      take: 30
    }),
    prisma.adjustmentOrderLine.findMany({
      where: { itemId, adjustmentOrder: { deletedAt: null } },
      select: {
        baseQuantity: true,
        pickLines: { select: { quantity: true } },
        adjustmentOrder: {
          select: {
            id: true,
            reference: true,
            status: true,
            warehouse: { select: { name: true } }
          }
        }
      },
      take: 30
    })
  ])

  const warehouseMap = new Map<string, {
    warehouseId: string
    warehouseName: string
    totalOnHand: number
    available: number
    reserved: number
    blocked: number
    bins: Set<string>
  }>()

  let totalOnHand = 0
  let available = 0
  let reserved = 0
  let blocked = 0

  for (const row of stockRows) {
    const rowAvailable = toQty(row.quantityAvailable)
    const rowReserved = toQty(row.quantityReserved)
    const rowBlocked = toQty(row.quantityBlocked)
    const rowTotal = rowAvailable + rowReserved + rowBlocked

    totalOnHand += rowTotal
    available += rowAvailable
    reserved += rowReserved
    blocked += rowBlocked

    const aggregate = warehouseMap.get(row.bin.warehouseId) ?? {
      warehouseId: row.bin.warehouseId,
      warehouseName: row.bin.warehouse.name,
      totalOnHand: 0,
      available: 0,
      reserved: 0,
      blocked: 0,
      bins: new Set<string>()
    }

    aggregate.totalOnHand += rowTotal
    aggregate.available += rowAvailable
    aggregate.reserved += rowReserved
    aggregate.blocked += rowBlocked
    aggregate.bins.add(row.bin.id)
    warehouseMap.set(row.bin.warehouseId, aggregate)
  }

  const stockByWarehouse = [...warehouseMap.values()]
    .map((row) => ({
      warehouseId: row.warehouseId,
      warehouseName: row.warehouseName,
      totalOnHand: Math.round(row.totalOnHand),
      available: Math.round(row.available),
      reserved: Math.round(row.reserved),
      blocked: Math.round(row.blocked),
      binsCount: row.bins.size,
      href: `/dashboard/locations/warehouses/${row.warehouseId}/stock`
    }))
    .sort((a, b) => b.totalOnHand - a.totalOnHand)

  const stockByBin = stockRows
    .map((row) => ({
      binStockItemId: row.id,
      warehouseName: row.bin.warehouse.name,
      zoneName: row.bin.zone.name,
      binCode: row.bin.code,
      lotCode: row.lot?.lotNumber ?? undefined,
      serialNumber: row.serialNumber?.serial ?? undefined,
      available: Math.round(toQty(row.quantityAvailable)),
      reserved: Math.round(toQty(row.quantityReserved)),
      blocked: Math.round(toQty(row.quantityBlocked)),
      status: row.status,
      href: `/dashboard/locations/bins/${row.bin.id}`
    }))
    .sort((a, b) => b.available + b.reserved + b.blocked - (a.available + a.reserved + a.blocked))

  const orderRows: ItemOrderRow[] = []
  for (const line of purchaseLines) {
    orderRows.push({
      orderId: line.purchaseOrder.id,
      orderLabel: line.purchaseOrder.reference,
      type: 'PURCHASE',
      warehouseName: line.purchaseOrder.warehouse.name,
      requiredQty: Math.round(toQty(line.orderedQuantity)),
      processedQty: Math.round(line.receiptLines.reduce((sum, entry) => sum + toQty(entry.quantity), 0)),
      status: line.purchaseOrder.status,
      href: orderHref('purchase', line.purchaseOrder.id)
    })
  }
  for (const line of salesLines) {
    orderRows.push({
      orderId: line.salesOrder.id,
      orderLabel: line.salesOrder.reference,
      type: 'SALES',
      warehouseName: line.salesOrder.warehouse.name,
      requiredQty: Math.round(toQty(line.baseQuantity)),
      processedQty: Math.round(sumPickLineQuantities(line.pickLines)),
      status: line.salesOrder.status,
      href: orderHref('sales', line.salesOrder.id)
    })
  }
  for (const line of transferLines) {
    orderRows.push({
      orderId: line.transferOrder.id,
      orderLabel: line.transferOrder.reference,
      type: 'TRANSFER',
      warehouseName: line.transferOrder.warehouse.name,
      requiredQty: Math.round(toQty(line.baseQuantity)),
      processedQty: Math.round(sumPickLineQuantities(line.pickLines)),
      status: line.transferOrder.status,
      href: orderHref('transfer', line.transferOrder.id)
    })
  }
  for (const line of returnLines) {
    orderRows.push({
      orderId: line.returnOrder.id,
      orderLabel: line.returnOrder.reference,
      type: 'RETURN',
      warehouseName: line.returnOrder.warehouse.name,
      requiredQty: Math.round(toQty(line.baseQuantity)),
      processedQty: Math.round(sumPickLineQuantities(line.pickLines)),
      status: line.returnOrder.status,
      href: orderHref('return', line.returnOrder.id)
    })
  }
  for (const line of adjustmentLines) {
    orderRows.push({
      orderId: line.adjustmentOrder.id,
      orderLabel: line.adjustmentOrder.reference,
      type: 'ADJUSTMENT',
      warehouseName: line.adjustmentOrder.warehouse.name,
      requiredQty: Math.round(toQty(line.baseQuantity)),
      processedQty: Math.round(sumPickLineQuantities(line.pickLines)),
      status: line.adjustmentOrder.status,
      href: orderHref('adjustment', line.adjustmentOrder.id)
    })
  }

  const binIdSet = new Set<string>()
  for (const movement of movements) {
    if (movement.fromBinId) {
      binIdSet.add(movement.fromBinId)
    }
    if (movement.toBinId) {
      binIdSet.add(movement.toBinId)
    }
  }

  const bins = binIdSet.size > 0
    ? await prisma.bin.findMany({ where: { id: { in: [...binIdSet] } }, select: { id: true, code: true } })
    : []
  const binCodeMap = new Map(bins.map((bin) => [bin.id, bin.code]))

  const movementRows: OrderMovementRow[] = movements.map((movement) => ({
    movementId: movement.id,
    occurredAt: movement.createdAt.toISOString(),
    sku: item.sku,
    fromBinCode: movement.fromBinId ? (binCodeMap.get(movement.fromBinId) ?? movement.fromBinId) : undefined,
    toBinCode: movement.toBinId ? (binCodeMap.get(movement.toBinId) ?? movement.toBinId) : undefined,
    quantity: Math.round(toQty(movement.quantity)),
    boeId: movement.id,
    userName: movement.user.fullName
  }))

  const now = Date.now()
  const expiringLots = lots.filter((lot) => {
    if (!lot.expiryDate) {
      return false
    }

    const delta = lot.expiryDate.getTime() - now

    return delta >= 0 && delta <= 1000 * 60 * 60 * 24 * 30
  }).length

  const kpis: DashboardKpi[] = [
    {
      label: 'Total on hand',
      value: String(Math.round(totalOnHand)),
      helper: 'Available + reserved + blocked',
      tone: 'neutral'
    },
    {
      label: 'Available',
      value: String(Math.round(available)),
      helper: 'Ready to allocate',
      tone: 'success'
    },
    {
      label: 'Reserved',
      value: String(Math.round(reserved)),
      helper: 'Committed to orders',
      tone: reserved > 0 ? 'warning' : 'neutral'
    },
    {
      label: 'Blocked',
      value: String(Math.round(blocked)),
      helper: 'Not available',
      tone: blocked > 0 ? 'danger' : 'neutral'
    },
    {
      label: 'Warehouses',
      value: String(stockByWarehouse.length),
      helper: 'Warehouses holding stock',
      tone: 'neutral'
    },
    {
      label: 'Bins',
      value: String(stockByBin.length),
      helper: 'Bins containing this SKU',
      tone: 'neutral'
    },
    {
      label: 'Open orders',
      value: String(orderRows.filter((row) => row.status !== 'EXECUTED' && row.status !== 'SIGNED_OFF').length),
      helper: 'Non-terminal order lines',
      tone: 'warning'
    }
  ]

  const handlingFlags = item.category?.handlingFlags && typeof item.category.handlingFlags === 'object'
    ? Object.entries(item.category.handlingFlags as Record<string, unknown>)
      .filter(([, value]) => Boolean(value))
      .map(([key]) => key)
    : []

  return {
    header: {
      title: item.name,
      subtitle: '',
      itemId: item.id,
      sku: item.sku,
      categoryName: item.category?.name ?? 'Uncategorized',
      uom: item.uom,
      handlingFlags
    },
    kpis,
    stockByWarehouse,
    stockByBin,
    orders: orderRows.slice(0, 100),
    movements: movementRows
  }
}
