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

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

function pickStatus(index: number): OrderStatus {
  const cycle: OrderStatus[] = [
    OrderStatus.RELEASED,
    OrderStatus.EXECUTING,
    OrderStatus.PAUSED,
    OrderStatus.RELEASED
  ]

  return cycle[index % cycle.length]
}

type TransferCandidate = {
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

export async function seedTransferOrders(prisma: PrismaClient) {
  const seedWarehouses = await prisma.warehouse.findMany({
    where: { deletedAt: null },
    orderBy: { createdAt: 'asc' },
    select: { id: true, name: true },
    take: SEED_ORDER_WAREHOUSE_COUNT
  })

  const seedWarehouseIds = seedWarehouses.map((w) => w.id)

  if (seedWarehouseIds.length === 0) {
    return { count: 0, reservedUpdates: 0 }
  }

  const [users, bins, stockRows] = await Promise.all([
    prisma.user.findMany({
      where: { isActive: true, role: { in: ['OWNER', 'OFFICE_MANAGER'] } },
      orderBy: { createdAt: 'asc' },
      select: { id: true }
    }),
    prisma.bin.findMany({
      where: {
        deletedAt: null,
        isBlocked: false,
        warehouseId: { in: seedWarehouseIds }
      },
      orderBy: { createdAt: 'asc' },
      select: { id: true, warehouseId: true }
    }),
    prisma.binStockItem.findMany({
      where: {
        quantityAvailable: { gt: 0 },
        status: { in: ['AVAILABLE', 'RESERVED'] },
        warehouseId: { in: seedWarehouseIds },
        bin: { deletedAt: null, isBlocked: false }
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

  if (users.length === 0 || bins.length === 0 || stockRows.length === 0) {
    return { count: 0, reservedUpdates: 0 }
  }

  const binsByWarehouse = new Map<string, string[]>()
  for (const bin of bins) {
    const current = binsByWarehouse.get(bin.warehouseId) ?? []

    current.push(bin.id)
    binsByWarehouse.set(bin.warehouseId, current)
  }

  const mutableStock: TransferCandidate[] = stockRows.map((row) => ({
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

  for (const originWarehouse of seedWarehouses) {
    const transfersForWarehouse = warehouseOrderSeedCount(originWarehouse.id, 'transfer')
    let createdForWarehouse = 0

    for (let k = 0; k < transfersForWarehouse; k += 1) {
      const index = globalIndex
      globalIndex += 1

      const available = mutableStock.filter((row) => row.quantityAvailable > 0)
      if (available.length === 0) {
        break
      }

      const targetWarehouseId = originWarehouse.id
      const inRotatedWarehouse = available.filter((row) => row.warehouseId === targetWarehouseId)
      const candidatePool =
        inRotatedWarehouse.length > 0 ? inRotatedWarehouse : available
      const source = candidatePool[index % candidatePool.length]
      const destinationWarehouses = seedWarehouseIds.filter((id) => id !== source.warehouseId)

      if (destinationWarehouses.length === 0) {
        continue
      }

      const destinationWarehouseId = destinationWarehouses[index % destinationWarehouses.length]
      const destinationBins = binsByWarehouse.get(destinationWarehouseId) ?? []

      if (destinationBins.length === 0) {
        continue
      }

      const destinationBinId = destinationBins[index % destinationBins.length]
      const reserveQty = Math.min(source.quantityAvailable, randomInt(1, Math.min(4, source.quantityAvailable)))

      source.quantityAvailable -= reserveQty
      source.quantityReserved += reserveQty

      const reference = `TO-SEED-${String(index + 1).padStart(4, '0')}`

      const transfer = await prisma.transferOrder.create({
        data: {
          reference,
          status: pickStatus(index),
          warehouseId: source.warehouseId,
          originBinId: source.binId,
          destinationBinId,
          isCrossWarehouse: true,
          createdById: users[index % users.length].id,
          lines: {
            create: [{
              itemId: source.itemId,
              itemNameSnapshot: source.itemName,
              binId: source.binId,
              baseQuantity: new Prisma.Decimal(reserveQty),
              uom: source.uom
            }]
          }
        },
        select: {
          id: true,
          warehouseId: true,
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

      const line = transfer.lines[0]
      if (line) {
        source.reservedByOrderId = transfer.id
        source.reservedByOrderLineId = line.id

        await prisma.transferOrderPick.create({
          data: {
            reference: `${reference}/PICK-001`,
            transferOrderId: transfer.id,
            status: ReceiptStatus.OPEN,
            warehouseId: transfer.warehouseId,
            createdById: users[index % users.length].id,
            totalLines: 1,
            openLines: 1,
            completedLines: 0,
            lines: {
              create: [{
                transferOrderLineId: line.id,
                quantity: new Prisma.Decimal(0),
                orderedQuantity: line.baseQuantity,
                uom: line.uom,
                itemId: line.itemId,
                itemNameSnapshot: line.itemNameSnapshot,
                stockItems: {
                  connect: [{ id: source.id }]
                }
              }]
            }
          }
        })
      }

      created += 1
      createdForWarehouse += 1
    }

    console.warn(`Seeded ${createdForWarehouse} transfer orders in ${originWarehouse.name}`)
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
