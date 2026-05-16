import type { PrismaClient, Prisma } from '@/generated/prisma'
import { generateBinSerial } from '@/utils/serials'

type DbClient = PrismaClient | Prisma.TransactionClient

export type BinExportRecord = {
  warehouseId: string
  zoneId: string
  name: string
  code: string
  type: string
  isBlocked: boolean
  maxWeightKg: number | null
  maxVolumeM3: number | null
  maxCapacity: number | string | null
}

export type BinImportRecord = {
  warehouseId: string
  zoneId: string
  name: string
  code: string
  type: string
  isBlocked: boolean
  maxWeightKg?: number | null
  maxVolumeM3?: number | null
  maxCapacity?: number | null
}

export async function exportBinsForExport(db: DbClient): Promise<BinExportRecord[]> {
  const bins = await db.bin.findMany({
    where: { deletedAt: null },
    select: {
      warehouseId: true,
      zoneId: true,
      name: true,
      code: true,
      type: true,
      isBlocked: true,
      maxWeightKg: true,
      maxVolumeM3: true,
      maxCapacity: true,
    },
    orderBy: { createdAt: 'asc' },
  })
  return bins.map((b) => ({
    warehouseId: b.warehouseId,
    zoneId: b.zoneId,
    name: b.name,
    code: b.code,
    type: b.type,
    isBlocked: b.isBlocked,
    maxWeightKg: b.maxWeightKg ? b.maxWeightKg.toNumber() : null,
    maxVolumeM3: b.maxVolumeM3 ? b.maxVolumeM3.toNumber() : null,
    maxCapacity: b.maxCapacity ? b.maxCapacity.toNumber() : null,
  }))
}

// Bin IDs encode the zone/warehouse pattern; each must be generated sequentially.
export async function insertBinsBatch(db: PrismaClient, records: BinImportRecord[]): Promise<number> {
  let inserted = 0
  for (const record of records) {
    const id = await generateBinSerial(db, record.zoneId)
    await db.bin.create({
      data: {
        id,
        warehouseId: record.warehouseId,
        zoneId: record.zoneId,
        name: record.name,
        code: record.code,
        type: record.type as 'GENERAL' | 'RECEIVING' | 'OUTGOING' | 'QUARANTINE' | 'STAGING',
        isBlocked: record.isBlocked,
        maxWeightKg: record.maxWeightKg ?? undefined,
        maxVolumeM3: record.maxVolumeM3 ?? undefined,
        maxCapacity: record.maxCapacity ?? undefined,
      },
    })
    inserted++
  }
  return inserted
}
