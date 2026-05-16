import type { PrismaClient, Prisma } from '@/generated/prisma'

import type { FieldValidationError, ImportEntity, InvalidRecord, RelationCheckResult } from './types'
import type { BinImportRecord } from './entities/bins'
import type { DeviceImportRecord } from './entities/devices'
import type { ItemImportRecord } from './entities/items'
import type { UserImportRecord } from './entities/users'
import type { WarehouseImportRecord } from './entities/warehouses'
import type { ZoneImportRecord } from './entities/zones'

type DbClient = PrismaClient | Prisma.TransactionClient

function fkError(field: string, value: unknown): FieldValidationError {
  return {
    field,
    issue: `Referenced ${field} "${String(value)}" does not exist`,
    received: value,
    expected: 'an existing record id',
  }
}

function dupError(field: string, value: unknown): FieldValidationError {
  return {
    field,
    issue: `A record with ${field} "${String(value)}" already exists`,
    received: value,
    expected: 'a unique value',
  }
}

async function checkWarehouses(
  db: DbClient,
  records: WarehouseImportRecord[]
): Promise<RelationCheckResult<WarehouseImportRecord>> {
  const names = records.map((r) => r.name)
  const existing = await db.warehouse.findMany({
    where: { name: { in: names }, deletedAt: null },
    select: { name: true },
  })
  const existingNames = new Set(existing.map((w) => w.name))

  const toInsert: WarehouseImportRecord[] = []
  const duplicates: WarehouseImportRecord[] = []
  const invalid: InvalidRecord<WarehouseImportRecord>[] = []

  for (let i = 0; i < records.length; i++) {
    const r = records[i]
    if (existingNames.has(r.name)) {
      duplicates.push(r)
    } else {
      toInsert.push(r)
    }
  }

  return { toInsert, duplicates, invalid }
}

async function checkZones(
  db: DbClient,
  records: ZoneImportRecord[]
): Promise<RelationCheckResult<ZoneImportRecord>> {
  const warehouseIds = [...new Set(records.map((r) => r.warehouseId))]
  const existingWarehouses = await db.warehouse.findMany({
    where: { id: { in: warehouseIds }, deletedAt: null },
    select: { id: true },
  })
  const validWarehouseIds = new Set(existingWarehouses.map((w) => w.id))

  // Check existing zone names per warehouse
  const existingZones = await db.zone.findMany({
    where: {
      warehouseId: { in: warehouseIds },
      deletedAt: null,
    },
    select: { warehouseId: true, name: true },
  })
  const existingZoneKeys = new Set(existingZones.map((z) => `${z.warehouseId}::${z.name}`))

  const toInsert: ZoneImportRecord[] = []
  const duplicates: ZoneImportRecord[] = []
  const invalid: InvalidRecord<ZoneImportRecord>[] = []

  for (let i = 0; i < records.length; i++) {
    const r = records[i]
    const errors: FieldValidationError[] = []

    if (!validWarehouseIds.has(r.warehouseId)) {
      errors.push(fkError('warehouseId', r.warehouseId))
    }

    if (errors.length > 0) {
      invalid.push({ record: r, index: i, errors })
      continue
    }

    const key = `${r.warehouseId}::${r.name}`
    if (existingZoneKeys.has(key)) {
      duplicates.push(r)
    } else {
      toInsert.push(r)
    }
  }

  return { toInsert, duplicates, invalid }
}

async function checkBins(
  db: DbClient,
  records: BinImportRecord[]
): Promise<RelationCheckResult<BinImportRecord>> {
  const warehouseIds = [...new Set(records.map((r) => r.warehouseId))]
  const zoneIds = [...new Set(records.map((r) => r.zoneId))]
  const codes = records.map((r) => r.code)

  const [existingWarehouses, existingZones, existingBins] = await Promise.all([
    db.warehouse.findMany({ where: { id: { in: warehouseIds }, deletedAt: null }, select: { id: true } }),
    db.zone.findMany({ where: { id: { in: zoneIds }, deletedAt: null }, select: { id: true, warehouseId: true } }),
    db.bin.findMany({ where: { code: { in: codes }, deletedAt: null }, select: { code: true } }),
  ])

  const validWarehouseIds = new Set(existingWarehouses.map((w) => w.id))
  const zoneMap = new Map(existingZones.map((z) => [z.id, z.warehouseId]))
  const existingCodes = new Set(existingBins.map((b) => b.code))

  const toInsert: BinImportRecord[] = []
  const duplicates: BinImportRecord[] = []
  const invalid: InvalidRecord<BinImportRecord>[] = []

  for (let i = 0; i < records.length; i++) {
    const r = records[i]
    const errors: FieldValidationError[] = []

    if (!validWarehouseIds.has(r.warehouseId)) {
      errors.push(fkError('warehouseId', r.warehouseId))
    }

    const zoneWarehouseId = zoneMap.get(r.zoneId)
    if (zoneWarehouseId === undefined) {
      errors.push(fkError('zoneId', r.zoneId))
    } else if (zoneWarehouseId !== r.warehouseId) {
      errors.push({
        field: 'zoneId',
        issue: `Zone "${r.zoneId}" does not belong to warehouse "${r.warehouseId}"`,
        received: r.zoneId,
        expected: `a zone belonging to warehouse ${r.warehouseId}`,
      })
    }

    if (errors.length > 0) {
      invalid.push({ record: r, index: i, errors })
      continue
    }

    if (existingCodes.has(r.code)) {
      duplicates.push(r)
    } else {
      toInsert.push(r)
    }
  }

  return { toInsert, duplicates, invalid }
}

async function checkUsers(
  db: DbClient,
  records: UserImportRecord[]
): Promise<RelationCheckResult<UserImportRecord>> {
  const emails = records.filter((r) => r.email).map((r) => r.email as string)

  const existingUsers = emails.length > 0
    ? await db.user.findMany({ where: { email: { in: emails }, deletedAt: null }, select: { email: true } })
    : []
  const existingEmails = new Set(existingUsers.map((u) => u.email).filter(Boolean))

  const toInsert: UserImportRecord[] = []
  const duplicates: UserImportRecord[] = []
  const invalid: InvalidRecord<UserImportRecord>[] = []

  for (let i = 0; i < records.length; i++) {
    const r = records[i]
    if (r.email && existingEmails.has(r.email)) {
      duplicates.push(r)
    } else {
      toInsert.push(r)
    }
  }

  return { toInsert, duplicates, invalid }
}

async function checkItems(
  db: DbClient,
  records: ItemImportRecord[]
): Promise<RelationCheckResult<ItemImportRecord>> {
  const skus = records.map((r) => r.sku)
  const uoms = [...new Set(records.map((r) => r.uom))]
  const categoryIds = [...new Set(records.filter((r) => r.categoryId).map((r) => r.categoryId as string))]
  const supplierIds = [...new Set(records.filter((r) => r.supplierId).map((r) => r.supplierId as string))]

  const [existingItems, validUoms, validCategories, validSuppliers] = await Promise.all([
    db.item.findMany({ where: { sku: { in: skus }, deletedAt: null }, select: { sku: true } }),
    db.unitOfMeasure.findMany({ where: { id: { in: uoms } }, select: { id: true } }),
    categoryIds.length > 0
      ? db.itemCategory.findMany({ where: { code: { in: categoryIds } }, select: { code: true } })
      : Promise.resolve([]),
    supplierIds.length > 0
      ? db.businessParty.findMany({ where: { id: { in: supplierIds } }, select: { id: true } })
      : Promise.resolve([]),
  ])

  const existingSkus = new Set(existingItems.map((i) => i.sku))
  const validUomIds = new Set(validUoms.map((u) => u.id))
  const validCategoryCodes = new Set(validCategories.map((c) => c.code))
  const validSupplierIds = new Set(validSuppliers.map((s) => s.id))

  const toInsert: ItemImportRecord[] = []
  const duplicates: ItemImportRecord[] = []
  const invalid: InvalidRecord<ItemImportRecord>[] = []

  for (let i = 0; i < records.length; i++) {
    const r = records[i]
    const errors: FieldValidationError[] = []

    if (!validUomIds.has(r.uom)) {
      errors.push(fkError('uom', r.uom))
    }
    if (r.categoryId && !validCategoryCodes.has(r.categoryId)) {
      errors.push(fkError('categoryId', r.categoryId))
    }
    if (r.supplierId && !validSupplierIds.has(r.supplierId)) {
      errors.push(fkError('supplierId', r.supplierId))
    }

    if (errors.length > 0) {
      invalid.push({ record: r, index: i, errors })
      continue
    }

    if (existingSkus.has(r.sku)) {
      duplicates.push(r)
    } else {
      toInsert.push(r)
    }
  }

  return { toInsert, duplicates, invalid }
}

async function checkDevices(
  db: DbClient,
  records: DeviceImportRecord[]
): Promise<RelationCheckResult<DeviceImportRecord>> {
  const warehouseIds = [...new Set(records.filter((r) => r.warehouseId).map((r) => r.warehouseId as string))]
  const zoneIds = [...new Set(records.filter((r) => r.zoneId).map((r) => r.zoneId as string))]
  const codes = records.map((r) => r.code)
  const names = records.map((r) => r.name)

  const [existingWarehouses, existingZones, existingByCodes, existingByNames] = await Promise.all([
    warehouseIds.length > 0
      ? db.warehouse.findMany({ where: { id: { in: warehouseIds }, deletedAt: null }, select: { id: true } })
      : Promise.resolve([]),
    zoneIds.length > 0
      ? db.zone.findMany({ where: { id: { in: zoneIds }, deletedAt: null }, select: { id: true, warehouseId: true } })
      : Promise.resolve([]),
    db.device.findMany({ where: { code: { in: codes } }, select: { code: true } }),
    db.device.findMany({ where: { name: { in: names } }, select: { name: true } }),
  ])

  const validWarehouseIds = new Set(existingWarehouses.map((w) => w.id))
  const zoneMap = new Map(existingZones.map((z) => [z.id, z.warehouseId]))
  const existingCodes = new Set(existingByCodes.map((d) => d.code))
  const existingNames = new Set(existingByNames.map((d) => d.name))

  const toInsert: DeviceImportRecord[] = []
  const duplicates: DeviceImportRecord[] = []
  const invalid: InvalidRecord<DeviceImportRecord>[] = []

  for (let i = 0; i < records.length; i++) {
    const r = records[i]
    const errors: FieldValidationError[] = []

    if (r.warehouseId && !validWarehouseIds.has(r.warehouseId)) {
      errors.push(fkError('warehouseId', r.warehouseId))
    }

    if (r.zoneId) {
      const zoneWarehouseId = zoneMap.get(r.zoneId)
      if (zoneWarehouseId === undefined) {
        errors.push(fkError('zoneId', r.zoneId))
      } else if (r.warehouseId && zoneWarehouseId !== r.warehouseId) {
        errors.push({
          field: 'zoneId',
          issue: `Zone "${r.zoneId}" does not belong to warehouse "${r.warehouseId}"`,
          received: r.zoneId,
          expected: `a zone belonging to warehouse ${r.warehouseId}`,
        })
      }
    }

    if (errors.length > 0) {
      invalid.push({ record: r, index: i, errors })
      continue
    }

    if (existingCodes.has(r.code) || existingNames.has(r.name)) {
      duplicates.push(r)
    } else {
      toInsert.push(r)
    }
  }

  return { toInsert, duplicates, invalid }
}

export async function checkImportDataRelations<T>(
  db: DbClient,
  entity: ImportEntity,
  records: T[]
): Promise<RelationCheckResult<T>> {
  switch (entity) {
    case 'warehouses':
      return checkWarehouses(db, records as unknown as WarehouseImportRecord[]) as Promise<RelationCheckResult<T>>
    case 'zones':
      return checkZones(db, records as unknown as ZoneImportRecord[]) as Promise<RelationCheckResult<T>>
    case 'bins':
      return checkBins(db, records as unknown as BinImportRecord[]) as Promise<RelationCheckResult<T>>
    case 'users':
      return checkUsers(db, records as unknown as UserImportRecord[]) as Promise<RelationCheckResult<T>>
    case 'items':
      return checkItems(db, records as unknown as ItemImportRecord[]) as Promise<RelationCheckResult<T>>
    case 'devices':
      return checkDevices(db, records as unknown as DeviceImportRecord[]) as Promise<RelationCheckResult<T>>
    default:
      throw new Error(`Unknown entity: ${entity as string}`)
  }
}
