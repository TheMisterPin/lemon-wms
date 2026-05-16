import type { PrismaClient, Prisma } from '@/generated/prisma'
import { generateZoneSerial } from '@/utils/serials'

type DbClient = PrismaClient | Prisma.TransactionClient

export type ZoneExportRecord = {
  warehouseId: string
  name: string
  type: string
  isActive: boolean
}

export type ZoneImportRecord = {
  warehouseId: string
  name: string
  type: string
  isActive: boolean
}

export async function exportZonesForExport(db: DbClient): Promise<ZoneExportRecord[]> {
  return db.zone.findMany({
    where: { deletedAt: null },
    select: {
      warehouseId: true,
      name: true,
      type: true,
      isActive: true,
    },
    orderBy: { createdAt: 'asc' },
  })
}

// Zone IDs encode the warehouseId pattern; each must be generated sequentially per warehouse.
export async function insertZonesBatch(db: PrismaClient, records: ZoneImportRecord[]): Promise<number> {
  let inserted = 0
  for (const record of records) {
    const id = await generateZoneSerial(db, record.warehouseId)
    await db.zone.create({
      data: {
        id,
        warehouseId: record.warehouseId,
        name: record.name,
        type: record.type as 'GENERAL' | 'COLD' | 'HAZMAT' | 'QUARANTINE' | 'STAGING' | 'RETURNS',
        isActive: record.isActive,
      },
    })
    inserted++
  }
  return inserted
}
