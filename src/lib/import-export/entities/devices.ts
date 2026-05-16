import type { PrismaClient, Prisma } from '@/generated/prisma'
import { generateDeviceSerial } from '@/utils/serials'

type DbClient = PrismaClient | Prisma.TransactionClient

export type DeviceExportRecord = {
  name: string
  code: string
  warehouseId: string | null
  zoneId: string | null
  type: string
  subType: string
  authorized: boolean
  authorizationStatus: string
}

export type DeviceImportRecord = {
  name: string
  code: string
  warehouseId?: string | null
  zoneId?: string | null
  type: string
  subType: string
  authorized: boolean
  authorizationStatus: string
}

export async function exportDevicesForExport(db: DbClient): Promise<DeviceExportRecord[]> {
  return db.device.findMany({
    where: {},
    select: {
      name: true,
      code: true,
      warehouseId: true,
      zoneId: true,
      type: true,
      subType: true,
      authorized: true,
      authorizationStatus: true,
    },
    orderBy: { registeredAt: 'asc' },
  })
}

// Device IDs use a sequential serial; each must be generated individually.
export async function insertDevicesBatch(db: PrismaClient, records: DeviceImportRecord[]): Promise<number> {
  let inserted = 0
  for (const record of records) {
    const id = await generateDeviceSerial(db)
    await db.device.create({
      data: {
        id,
        name: record.name,
        code: record.code,
        warehouseId: record.warehouseId ?? undefined,
        zoneId: record.zoneId ?? undefined,
        type: record.type as 'FLOOR' | 'HANDHELD' | 'PC' | 'TABLET',
        subType: record.subType as 'TERMINAL' | 'HANDHELD_SCANNER' | 'TROLLEY',
        authorized: record.authorized,
        authorizationStatus: record.authorizationStatus as 'PENDING' | 'AUTHORIZED' | 'REJECTED',
      },
    })
    inserted++
  }
  return inserted
}
