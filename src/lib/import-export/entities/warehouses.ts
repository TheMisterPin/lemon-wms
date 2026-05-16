import type { PrismaClient, Prisma } from '@/generated/prisma'
import { generateWarehouseSerial } from '@/utils/serials'

type DbClient = PrismaClient | Prisma.TransactionClient

export type WarehouseExportRecord = {
  name: string
  address: unknown
  timezone: string | null
  currency: string | null
  status: string
}

export type WarehouseImportRecord = {
  name: string
  address?: unknown
  timezone?: string | null
  currency?: string | null
  status: string
}

export async function exportWarehousesForExport(db: DbClient): Promise<WarehouseExportRecord[]> {
  return db.warehouse.findMany({
    where: { deletedAt: null },
    select: {
      name: true,
      address: true,
      timezone: true,
      currency: true,
      status: true,
    },
    orderBy: { createdAt: 'asc' },
  })
}

// Serial IDs must be generated sequentially to avoid collisions.
export async function insertWarehousesBatch(db: PrismaClient, records: WarehouseImportRecord[]): Promise<number> {
  let inserted = 0
  for (const record of records) {
    const id = await generateWarehouseSerial(db)
    await db.warehouse.create({
      data: {
        id,
        name: record.name,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      address: record.address as any,
        timezone: record.timezone ?? undefined,
        currency: record.currency ?? undefined,
        status: record.status as 'ACTIVE' | 'INACTIVE' | 'ARCHIVED',
      },
    })
    inserted++
  }
  return inserted
}
