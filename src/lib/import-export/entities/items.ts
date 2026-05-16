import type { PrismaClient, Prisma } from '@/generated/prisma'

type DbClient = PrismaClient | Prisma.TransactionClient

export type ItemExportRecord = {
  sku: string
  name: string
  barcode: string | null
  categoryId: string | null
  trackingMode: string
  uom: string
  weightKg: number | null
  dimensions: unknown
  minQuantity: number
  isActive: boolean
  supplierId: string | null
}

export type ItemImportRecord = {
  sku: string
  name: string
  barcode?: string | null
  categoryId?: string | null
  trackingMode: string
  uom: string
  weightKg?: number | null
  dimensions?: unknown
  minQuantity: number
  isActive: boolean
  supplierId?: string | null
}

export async function exportItemsForExport(db: DbClient): Promise<ItemExportRecord[]> {
  const items = await db.item.findMany({
    where: { deletedAt: null },
    select: {
      sku: true,
      name: true,
      barcode: true,
      categoryId: true,
      trackingMode: true,
      uom: true,
      weightKg: true,
      dimensions: true,
      minQuantity: true,
      isActive: true,
      supplierId: true,
    },
    orderBy: { createdAt: 'asc' },
  })
  return items.map((item) => ({
    ...item,
    weightKg: item.weightKg ? item.weightKg.toNumber() : null,
    minQuantity: item.minQuantity ? item.minQuantity.toNumber() : 0,
  }))
}

// Items use auto-generated cuid() ids; createMany is safe here.
export async function insertItemsBatch(db: PrismaClient, records: ItemImportRecord[]): Promise<number> {
  const result = await db.item.createMany({
    data: records.map((r) => ({
      sku: r.sku,
      name: r.name,
      barcode: r.barcode ?? undefined,
      categoryId: r.categoryId ?? undefined,
      trackingMode: r.trackingMode as 'NONE' | 'LOT' | 'SERIAL' | 'FIFO',
      uom: r.uom,
      weightKg: r.weightKg ?? undefined,
      dimensions: r.dimensions as Prisma.InputJsonValue ?? undefined,
      minQuantity: r.minQuantity,
      isActive: r.isActive,
      supplierId: r.supplierId ?? undefined,
    })),
    skipDuplicates: false,
  })
  return result.count
}
