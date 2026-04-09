import { OrderStatus, type PrismaClient } from '@/generated/prisma'

const PURCHASE_ORDER_COUNT = 30

const WEIGHTED_STATUSES: OrderStatus[] = [
  ...Array(12).fill(OrderStatus.DRAFT),
  ...Array(10).fill(OrderStatus.RELEASED),
  ...Array(5).fill(OrderStatus.EXECUTING),
  ...Array(3).fill(OrderStatus.PAUSED)
]

function pickStatus(index: number): OrderStatus {
  return WEIGHTED_STATUSES[index % WEIGHTED_STATUSES.length]
}

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

  const itemBySupplier = new Map<string, Array<(typeof items)[number]>>()
  for (const item of items) {
    if (!item.supplierId) {
      continue
    }
    const list = itemBySupplier.get(item.supplierId) ?? []
    list.push(item)
    itemBySupplier.set(item.supplierId, list)
  }

  let createdCount = 0
  for (let i = 0; i < PURCHASE_ORDER_COUNT; i++) {
    const supplier = suppliers[i % suppliers.length]
    const supplierItems = itemBySupplier.get(supplier.id) ?? []
    if (supplierItems.length === 0) {
      continue
    }

    const item = supplierItems[i % supplierItems.length]
    const createdById = users[i % users.length].id
    const sequence = String(i + 1).padStart(4, '0')

    await prisma.purchaseOrder.create({
      data: {
        reference: `PO-SEED-${sequence}`,
        status: pickStatus(i),
        warehouseId: warehouse.id,
        supplier: supplier.name,
        businessPartyId: supplier.id,
        createdById,
        lines: {
          create: [
            {
              itemId: item.id,
              itemName: item.name,
              uom: item.uom,
              baseQuantity: 5 + (i % 10)
            }
          ]
        }
      }
    })

    createdCount += 1
  }

  return { count: createdCount }
}
