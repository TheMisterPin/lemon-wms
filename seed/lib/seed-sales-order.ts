import {
  BinItemStatus,
  OrderStatus,
  Prisma,
  ReceiptStatus,
  type PrismaClient
} from '@/generated/prisma'

import {
  SEED_ORDER_WAREHOUSE_COUNT,
  warehouseOrderSeedCount
} from './warehouse-order-seed-count'

const UPDATE_BATCH_SIZE = 100

function pickStatus(index: number): OrderStatus {
  const cycle: OrderStatus[] = [
    OrderStatus.RELEASED,
    OrderStatus.EXECUTING,
    OrderStatus.PAUSED,
    OrderStatus.RELEASED,
    OrderStatus.RELEASED
  ]

  return cycle[index % cycle.length]
}

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

type MutableStock = {
  id: string
  warehouseId: string
  binId: string
  itemId: string
  itemName: string
  uom: string
  quantityAvailable: number
  quantityReserved: number
  reservedByOrderId: string | null
  reservedByOrderLineId: string | null
}

export async function seedSalesOrders(prisma: PrismaClient) {
  const seedWarehouses = await prisma.warehouse.findMany({
    where: { deletedAt: null },
    orderBy: { createdAt: 'asc' },
    select: { id: true, name: true },
    take: SEED_ORDER_WAREHOUSE_COUNT
  })

  const seedWarehouseIds = new Set(seedWarehouses.map((w) => w.id))

  const [customers, users, stockRows] = await Promise.all([
    prisma.businessParty.findMany({
      where: { type: 'CUSTOMER', isActive: true },
      orderBy: { createdAt: 'asc' },
      select: { id: true, name: true }
    }),
    prisma.user.findMany({
      where: {
        isActive: true,
        role: { in: ['OWNER', 'OFFICE_MANAGER', 'OFFICE_WORKER'] }
      },
      orderBy: { createdAt: 'asc' },
      select: { id: true }
    }),
    prisma.binStockItem.findMany({
      where: {
        quantityAvailable: { gt: 0 },
        status: 'AVAILABLE',
        bin: { deletedAt: null },
        warehouseId: { in: [...seedWarehouseIds] }
      },
      orderBy: { createdAt: 'asc' },
      select: {
        id: true,
        warehouseId: true,
        binId: true,
        itemId: true,
        name: true,
        uom: true,
        quantityAvailable: true,
        quantityReserved: true
      }
    })
  ])

  if (
    customers.length === 0
    || users.length === 0
    || stockRows.length === 0
    || seedWarehouses.length === 0
  ) {
    return { count: 0, reservedUpdates: 0 }
  }

  const mutableStock: MutableStock[] = stockRows.map((row) => ({
    id: row.id,
    warehouseId: row.warehouseId,
    binId: row.binId,
    itemId: row.itemId,
    itemName: row.name,
    uom: row.uom,
    quantityAvailable: Number(row.quantityAvailable),
    quantityReserved: Number(row.quantityReserved),
    reservedByOrderId: null,
    reservedByOrderLineId: null
  }))

  let created = 0
  let globalIndex = 0

  for (const targetWarehouse of seedWarehouses) {
    const warehouseId = targetWarehouse.id
    const ordersForWarehouse = warehouseOrderSeedCount(targetWarehouse.id, 'sales')
    let createdForWarehouse = 0

    for (let k = 0; k < ordersForWarehouse; k += 1) {
      const index = globalIndex
      globalIndex += 1

      const availableForOrder = mutableStock.filter((row) => row.quantityAvailable > 0)
      if (availableForOrder.length === 0) {
        break
      }

      const warehousePool = mutableStock.filter(
        (row) => row.warehouseId === warehouseId && row.quantityAvailable > 0
      )

      if (warehousePool.length === 0) {
        continue
      }

      const lineCount = Math.min(warehousePool.length, randomInt(2, 5))
      const start = (index * 7) % warehousePool.length
      const selected: MutableStock[] = []

      for (let offset = 0; offset < warehousePool.length && selected.length < lineCount; offset += 1) {
        const row = warehousePool[(start + offset) % warehousePool.length]
        if (selected.some((s) => s.id === row.id)) {
          continue
        }
        selected.push(row)
      }

      if (selected.length === 0) {
        continue
      }

      const customer = customers[index % customers.length]
      const createdBy = users[index % users.length]

      const lines: Prisma.SalesOrderLineUncheckedCreateWithoutSalesOrderInput[] = selected.map((stock) => {
        const reserveQty = Math.min(stock.quantityAvailable, randomInt(1, Math.min(6, stock.quantityAvailable)))

        stock.quantityAvailable -= reserveQty
        stock.quantityReserved += reserveQty

        return {
          itemId: stock.itemId,
          itemNameSnapshot: stock.itemName,
          originBinId: stock.binId,
          baseQuantity: new Prisma.Decimal(reserveQty),
          uom: stock.uom
        }
      })

      const reference = `SO-SEED-${String(index + 1).padStart(4, '0')}`

      const order = await prisma.salesOrder.create({
        data: {
          reference,
          status: pickStatus(index),
          warehouseId,
          businessPartyId: customer.id,
          customerName: customer.name,
          createdById: createdBy.id,
          lines: { create: lines }
        },
        select: {
          id: true,
          lines: {
            select: {
              id: true,
              itemId: true,
              itemNameSnapshot: true,
              baseQuantity: true,
              uom: true
            }
          }
        }
      })

      selected.forEach((stockRow, lineIdx) => {
        const line = order.lines[lineIdx]
        if (!line) {
          return
        }

        stockRow.reservedByOrderId = order.id
        stockRow.reservedByOrderLineId = line.id
      })

      await prisma.salesOrderPick.create({
        data: {
          reference: `${reference}/PICK-001`,
          salesOrderId: order.id,
          status: ReceiptStatus.OPEN,
          warehouseId,
          customerNameSnapshot: customer.name,
          createdById: createdBy.id,
          totalLines: order.lines.length,
          openLines: order.lines.length,
          completedLines: 0,
          lines: {
            create: order.lines.map((line, lineIdx) => {
              const stock = selected[lineIdx]
              if (!stock) {
                throw new Error('Seed sales order: pick line missing matching bin stock row.')
              }

              return {
                salesOrderLineId: line.id,
                quantity: new Prisma.Decimal(0),
                orderedQuantity: line.baseQuantity,
                uom: line.uom,
                itemId: line.itemId,
                itemNameSnapshot: line.itemNameSnapshot,
                stockItems: {
                  connect: [{ id: stock.id }]
                }
              }
            })
          }
        }
      })

      created += 1
      createdForWarehouse += 1
    }

    console.warn(`Seeded ${createdForWarehouse} sales orders in ${targetWarehouse.name}`)
  }

  const updates = mutableStock
    .map((row) => ({
      id: row.id,
      quantityAvailable: row.quantityAvailable,
      quantityReserved: row.quantityReserved,
      status: row.quantityReserved > 0 ? BinItemStatus.RESERVED : BinItemStatus.AVAILABLE,
      reservedByOrderId: row.reservedByOrderId,
      reservedByOrderLineId: row.reservedByOrderLineId
    }))
    .filter((row) => row.quantityReserved > 0)

  for (let i = 0; i < updates.length; i += UPDATE_BATCH_SIZE) {
    const batch = updates.slice(i, i + UPDATE_BATCH_SIZE)

    await Promise.all(
      batch.map((row) =>
        prisma.binStockItem.update({
          where: { id: row.id },
          data: {
            quantityAvailable: new Prisma.Decimal(row.quantityAvailable),
            quantityReserved: new Prisma.Decimal(row.quantityReserved),
            status: row.status,
            reservedByOrderId: row.reservedByOrderId,
            reservedByOrderLineId: row.reservedByOrderLineId
          }
        })
      )
    )
  }

  return { count: created, reservedUpdates: updates.length }
}
