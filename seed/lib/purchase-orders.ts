import { OrderStatus, type PrismaClient } from '@/generated/prisma'

import {
  SEED_ORDER_WAREHOUSE_COUNT,
  warehouseOrderSeedCount
} from './warehouse-order-seed-count'

const MIN_LINES_PER_ORDER = 10
const MAX_LINES_PER_ORDER = 20

const WEIGHTED_STATUSES: OrderStatus[] = [
  ...Array(12).fill(OrderStatus.DRAFT),
  ...Array(10).fill(OrderStatus.RELEASED),
  ...Array(5).fill(OrderStatus.EXECUTING),
  ...Array(3).fill(OrderStatus.PAUSED)
]

type SeedSupplierItem = {
  id: string
  name: string
  uom: string
  supplierId: string | null
}

/**
 * Returns a weighted order status for the given seed index.
 */
function pickStatus(index: number): OrderStatus {
  return WEIGHTED_STATUSES[index % WEIGHTED_STATUSES.length]
}

/**
 * Returns a deterministic integer between min and max inclusive.
 */
function getDeterministicRangeValue(seed: number, min: number, max: number): number {
  return min + (seed % (max - min + 1))
}

/**
 * Builds between 10 and 20 unique purchase order lines for a supplier.
 */
function buildPurchaseOrderLines(
  supplierItems: SeedSupplierItem[],
  orderIndex: number
) {
  const lineCount = getDeterministicRangeValue(orderIndex, MIN_LINES_PER_ORDER, MAX_LINES_PER_ORDER)

  const lines = []
  for (let lineIndex = 0; lineIndex < lineCount; lineIndex++) {
    const item = supplierItems[(orderIndex + lineIndex) % supplierItems.length]

    lines.push({
      itemId: item.id,
      lineSequence: lineIndex + 1,
      itemNameSnapshot: item.name,
      uom: item.uom,
      orderedQuantity: 5 + ((orderIndex + lineIndex) % 10)
    })
  }

  return lines
}

/**
 * Seeds purchase orders with 10 to 20 lines each.
 */
export async function seedPurchaseOrders(prisma: PrismaClient) {
  const warehouses = await prisma.warehouse.findMany({
    where: { deletedAt: null },
    orderBy: { createdAt: 'asc' },
    select: { id: true, name: true },
    take: SEED_ORDER_WAREHOUSE_COUNT
  })

  if (warehouses.length === 0) {
    throw new Error('No warehouse found for purchase order seeding.')
  }

  const users = await prisma.user.findMany({
    where: { isActive: true },
    orderBy: { createdAt: 'asc' },
    select: { id: true }
  })

  if (users.length === 0) {
    throw new Error('No active users found for purchase order seeding.')
  }

  const suppliers = await prisma.businessParty.findMany({
    where: {
      type: 'SUPPLIER',
      isActive: true
    },
    orderBy: { createdAt: 'asc' },
    select: { id: true, name: true }
  })

  if (suppliers.length === 0) {
    throw new Error('No active suppliers found for purchase order seeding.')
  }

  const items = await prisma.item.findMany({
    where: {
      isActive: true,
      deletedAt: null,
      supplierId: { not: null }
    },
    orderBy: { createdAt: 'asc' },
    select: { id: true, name: true, uom: true, supplierId: true }
  })

  if (items.length === 0) {
    throw new Error('No supplier-linked items found for purchase order seeding.')
  }

  const itemBySupplier = new Map<string, SeedSupplierItem[]>()

  for (const item of items) {
    if (!item.supplierId) {
      continue
    }

    const current = itemBySupplier.get(item.supplierId) ?? []
    current.push(item)
    itemBySupplier.set(item.supplierId, current)
  }

  let createdCount = 0
  let globalIndex = 0

  for (const warehouse of warehouses) {
    const ordersForWarehouse = warehouseOrderSeedCount(warehouse.id, 'purchase')
    let createdForWarehouse = 0

    for (let k = 0; k < ordersForWarehouse; k += 1) {
      const i = globalIndex
      const supplier = suppliers[i % suppliers.length]
      const supplierItems = itemBySupplier.get(supplier.id) ?? []

      if (supplierItems.length === 0) {
        globalIndex += 1
        continue
      }

      const createdById = users[i % users.length].id
      const sequence = String(globalIndex + 1).padStart(4, '0')
      const lines = buildPurchaseOrderLines(supplierItems, i)

      await prisma.purchaseOrder.create({
        data: {
          reference: `PO-SEED-${sequence}`,
          status: pickStatus(i),
          warehouseId: warehouse.id,
          supplierNameSnapshot: supplier.name,
          businessPartyId: supplier.id,
          createdById,
          lines: {
            create: lines
          }
        }
      })

      globalIndex += 1
      createdCount += 1
      createdForWarehouse += 1
    }

    console.warn(`Seeded ${createdForWarehouse} purchase orders in ${warehouse.name}`)
  }

  return { count: createdCount }
}
