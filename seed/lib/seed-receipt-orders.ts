import { Prisma, type PrismaClient } from '@/generated/prisma'

/**
 * Creates one OPEN receipt per seeded purchase order with one receipt line per PO line (qty 0).
 */
export async function seedReceiptOrders(prisma: PrismaClient): Promise<{ count: number }> {
  const purchaseOrders = await prisma.purchaseOrder.findMany({
    where: { deletedAt: null },
    select: {
      id: true,
      reference: true,
      warehouseId: true,
      supplierNameSnapshot: true,
      notes: true,
      createdById: true,
      lines: {
        select: {
          id: true,
          itemId: true,
          itemNameSnapshot: true,
          uom: true,
          orderedQuantity: true,
          notes: true
        }
      }
    }
  })

  let count = 0

  for (const po of purchaseOrders) {
    if (po.lines.length === 0) {
      continue
    }

    const reference = `${po.reference}/RCP-SEED`

    const existing = await prisma.purchaseOrderReceipt.findFirst({
      where: { reference }
    })

    if (existing) {
      continue
    }

    await prisma.purchaseOrderReceipt.create({
      data: {
        reference,
        purchaseOrderId: po.id,
        warehouseId: po.warehouseId,
        supplierNameSnapshot: po.supplierNameSnapshot,
        notes: po.notes,
        createdById: po.createdById,
        lines: {
          create: po.lines.map((line) => ({
            purchaseOrderLineId: line.id,
            quantity: new Prisma.Decimal(0),
            orderedQuantity: line.orderedQuantity,
            uom: line.uom,
            itemId: line.itemId,
            itemNameSnapshot: line.itemNameSnapshot,
            notes: line.notes
          }))
        }
      }
    })

    count += 1
  }

  return { count }
}
