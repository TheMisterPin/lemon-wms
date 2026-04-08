import type { PrismaClient } from '@/generated/prisma'
import { BusinessPartyType, Prisma, WarehouseStatus } from '@/generated/prisma'

import { DomainError } from '@/lib/errors'
import type { PurchaseOrderCreateInput } from '@/lib/schemas/purchase-order-create'

export type CreatePurchaseOrderParams = PurchaseOrderCreateInput & { createdById: string }

export type PurchaseOrderCreatedSummary = {
  id: string
  reference: string
  status: string
  lineCount: number
  lines: Array<{ id: string }>
}

async function createPurchaseOrder(
  prisma: PrismaClient,
  input: CreatePurchaseOrderParams
): Promise<PurchaseOrderCreatedSummary> {
  const {
    orderNo,
    businessPartyId,
    warehouseId,
    lines,
    notes,
    expectedDate,
    createdById
  } = input

  return prisma.$transaction(async tx => {
    const warehouse = await tx.warehouse.findFirst({
      where: {
        id: warehouseId,
        status: WarehouseStatus.ACTIVE,
        deletedAt: null
      },
      select: { id: true }
    })

    if (!warehouse) {
      throw new DomainError('Warehouse not found.', 'NOT_FOUND', 404)
    }

    const supplier = await tx.businessParty.findFirst({
      where: {
        id: businessPartyId,
        type: BusinessPartyType.SUPPLIER,
        isActive: true
      },
      select: { id: true, name: true }
    })

    if (!supplier) {
      throw new DomainError('Supplier not found.', 'NOT_FOUND', 404)
    }

    const lineCreates: Array<{
      lineSequence: number
      itemId: string
      itemName: string
      uom: string
      baseQuantity: Prisma.Decimal
    }> = []

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i]
      const item = await tx.item.findFirst({
        where: {
          id: line.itemId,
          supplierId: businessPartyId,
          isActive: true,
          deletedAt: null
        },
        select: { id: true, name: true, uom: true }
      })

      if (!item) {
        throw new DomainError(
          'Item is not in this supplier catalog.',
          'INVALID_LINE_ITEM',
          400
        )
      }

      lineCreates.push({
        lineSequence: i + 1,
        itemId: item.id,
        itemName: item.name,
        uom: item.uom,
        baseQuantity: new Prisma.Decimal(line.baseQuantity)
      })
    }

    const created = await tx.purchaseOrder.create({
      data: {
        reference: orderNo,
        warehouseId,
        businessPartyId,
        supplier: supplier.name,
        createdById,
        notes: notes ?? null,
        expectedDate: expectedDate ?? null,
        lines: {
          create: lineCreates
        }
      },
      select: {
        id: true,
        reference: true,
        status: true,
        lines: { select: { id: true } }
      }
    })

    return {
      id: created.id,
      reference: created.reference,
      status: created.status,
      lineCount: created.lines.length,
      lines: created.lines.map(l => ({ id: l.id }))
    }
  })
}

export { createPurchaseOrder }
