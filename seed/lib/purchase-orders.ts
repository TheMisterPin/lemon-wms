import { OrderStatus, type PrismaClient } from '@/generated/prisma'

const PURCHASE_ORDER_COUNT = 30
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
  const warehouse = await prisma.warehouse.findFirst({
    where: { deletedAt: null },
    orderBy: { createdAt: 'asc' },
    select: { id: true }
  })

  if (!warehouse) {
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

  for (let i = 0; i < PURCHASE_ORDER_COUNT; i++) {
    const supplier = suppliers[i % suppliers.length]
    const supplierItems = itemBySupplier.get(supplier.id) ?? []

    if (supplierItems.length === 0) {
      continue
    }

    const createdById = users[i % users.length].id
    const sequence = String(i + 1).padStart(4, '0')
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

    createdCount += 1
  }

  return { count: createdCount }
}
