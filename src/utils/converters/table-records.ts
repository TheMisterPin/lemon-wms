import type {
  BinType,
  DeviceType,
  ItemTrackingMode,
  ZoneType
} from '@/generated/prisma'

type DecimalLike = { toString(): string }

type ZoneWithWarehouseName = {
  id: string
  warehouseId: string
  name: string
  type: ZoneType
  isActive: boolean
  defaultReceivingBinId: string | null
  defaultQuarantineBinId: string | null
  defaultOutgoingBinId: string | null
  createdAt: Date
  deletedAt: Date | null
  warehouse: { name: string }
}

type BinWithRelations = {
  id: string
  zoneId: string
  warehouseId: string
  name: string
  code: string
  type: BinType
  isBlocked: boolean
  blockReason: string | null
  maxWeightKg: DecimalLike | null
  maxVolumeM3: DecimalLike | null
  maxCapacity: DecimalLike | null
  currentCapacity: DecimalLike | null
  createdAt: Date
  deletedAt: Date | null
  zone: { name: string }
  warehouse: { name: string }
  _count: { binStockItems: number }
}

type DeviceWithRelations = {
  id: string
  name: string
  code: string
  warehouseId: string | null
  zoneId: string | null
  authorized: boolean
  isActive: boolean
  type: DeviceType
  registeredAt: Date
  warehouse: { name: string } | null
  zone: { name: string } | null
}

export type WarehouseTableRecord = {
  id: string
  name: string
  address: string | null
  timezone: string | null
  currency: string | null
  status: 'ACTIVE' | 'INACTIVE' | 'ARCHIVED'
  createdById: string | null
  createdAt: string
  deletedAt: string | null
}

export type ZoneTableRecord = {
  id: string
  warehouseId: string
  warehouseName: string
  name: string
  type: ZoneType
  isActive: boolean
  defaultReceivingBinId: string | null
  defaultQuarantineBinId: string | null
  defaultOutgoingBinId: string | null
  createdAt: string
  deletedAt: string | null
}

export type BinTableRecord = {
  id: string
  zoneId: string
  zoneName: string
  warehouseId: string
  warehouseName: string
  name: string
  code: string
  type: BinType
  isBlocked: boolean
  blockReason: string | null
  maxWeightKg: string | null
  maxVolumeM3: string | null
  maxCapacity: number | null
  currentCapacity: number | null
  filledPercentage: number | null
  itemsInBin: number
  createdAt: string
  deletedAt: string | null
}

export type DeviceTableRecord = {
  id: string
  name: string
  code: string
  warehouseId: string | null
  warehouseName: string
  zoneId: string | null
  zoneName: string
  authorized: boolean
  isActive: boolean
  type: DeviceType
  registeredAt: string
}

export type UserTableRecord = {
  id: string
  email: string | null
  badgeNumber: string
  role: 'OWNER' | 'OFFICE_MANAGER' | 'OFFICE_WORKER' | 'WAREHOUSE_MANAGER' | 'WAREHOUSE_WORKER'
  loginType: 'CREDENTIAL' | 'BADGE_PIN' | 'BOTH'
  isActive: boolean
  deletedAt: string | null
  createdAt: string
}

export type ItemTableRecord = {
  id: string
  sku: string
  name: string
  description: string | null
  barcode: string | null
  categoryId: string | null
  trackingMode: ItemTrackingMode
  uom: string
  weightKg: string | null
  dimensions: unknown
  minQuantity: number
  isActive: boolean
  supplierId: string | null
  createdAt: string
  deletedAt: string | null
}

type WarehouseRecordInput = {
  id: string
  name: string
  address: string | null
  timezone: string | null
  currency: string | null
  status: WarehouseTableRecord['status']
  createdById: string | null
  createdAt: Date
  deletedAt: Date | null
}

/**
 * toWarehouseTableRecords.
 * @param records - Parameter for toWarehouseTableRecords.
 * @returns Result from toWarehouseTableRecords.
 */
export function toWarehouseTableRecords(records: WarehouseRecordInput[]): WarehouseTableRecord[] {
  return records.map((record) => ({
    id: record.id,
    name: record.name,
    address: record.address,
    timezone: record.timezone,
    currency: record.currency,
    status: record.status,
    createdById: record.createdById,
    createdAt: record.createdAt.toISOString(),
    deletedAt: record.deletedAt?.toISOString() ?? null
  }))
}

/**
 * toZoneTableRecords.
 * @param records - Parameter for toZoneTableRecords.
 * @returns Result from toZoneTableRecords.
 */
export function toZoneTableRecords(records: ZoneWithWarehouseName[]): ZoneTableRecord[] {
  return records.map((record) => ({
    id: record.id,
    warehouseId: record.warehouseId,
    warehouseName: record.warehouse.name,
    name: record.name,
    type: record.type,
    isActive: record.isActive,
    defaultReceivingBinId: record.defaultReceivingBinId,
    defaultQuarantineBinId: record.defaultQuarantineBinId,
    defaultOutgoingBinId: record.defaultOutgoingBinId,
    createdAt: record.createdAt.toISOString(),
    deletedAt: record.deletedAt?.toISOString() ?? null
  }))
}

/**
 * decimalLikeToNumber.
 * @param value - Parameter for decimalLikeToNumber.
 * @returns Result from decimalLikeToNumber.
 */
function decimalLikeToNumber(value: DecimalLike | null | undefined): number | null {
  if (value === null || value === undefined) {
    return null
  }

  const n = Number(value.toString())

  return Number.isFinite(n) ? n : null
}

/**
 * toBinTableRecords.
 * @param records - Parameter for toBinTableRecords.
 * @returns Result from toBinTableRecords.
 */
export function toBinTableRecords(records: BinWithRelations[]): BinTableRecord[] {
  return records.map((record) => {
    const maxCapacity = decimalLikeToNumber(record.maxCapacity)
    const currentCapacity = decimalLikeToNumber(record.currentCapacity)
    const filledPercentage =
      maxCapacity !== null && maxCapacity > 0 && currentCapacity !== null
        ? (currentCapacity / maxCapacity) * 100
        : null

    return {
      id: record.id,
      zoneId: record.zoneId,
      zoneName: record.zone.name,
      warehouseId: record.warehouseId,
      warehouseName: record.warehouse.name,
      name: record.name,
      code: record.code,
      type: record.type,
      isBlocked: record.isBlocked,
      blockReason: record.blockReason,
      maxWeightKg: record.maxWeightKg?.toString() ?? null,
      maxVolumeM3: record.maxVolumeM3?.toString() ?? null,
      maxCapacity,
      currentCapacity,
      filledPercentage,
      itemsInBin: record._count.binStockItems,
      createdAt: record.createdAt.toISOString(),
      deletedAt: record.deletedAt?.toISOString() ?? null
    }
  })
}

/**
 * toDeviceTableRecords.
 * @param records - Parameter for toDeviceTableRecords.
 * @returns Result from toDeviceTableRecords.
 */
export function toDeviceTableRecords(records: DeviceWithRelations[]): DeviceTableRecord[] {
  return records.map((record) => ({
    id: record.id,
    name: record.name,
    code: record.code,
    warehouseId: record.warehouseId,
    warehouseName: record.warehouse?.name ?? '—',
    zoneId: record.zoneId,
    zoneName: record.zone?.name ?? '—',
    authorized: record.authorized,
    isActive: record.isActive,
    type: record.type,
    registeredAt: record.registeredAt.toISOString()
  }))
}

type UserRecordInput = {
  id: string
  email: string | null
  badgeNumber: string
  role: UserTableRecord['role']
  loginType: UserTableRecord['loginType']
  isActive: boolean
  deletedAt: Date | null
  createdAt: Date
}

/**
 * toUserTableRecords.
 * @param records - Parameter for toUserTableRecords.
 * @returns Result from toUserTableRecords.
 */
export function toUserTableRecords(records: UserRecordInput[]): UserTableRecord[] {
  return records.map((record) => ({
    id: record.id,
    email: record.email,
    badgeNumber: record.badgeNumber,
    role: record.role,
    loginType: record.loginType,
    isActive: record.isActive,
    deletedAt: record.deletedAt?.toISOString() ?? null,
    createdAt: record.createdAt.toISOString()
  }))
}

type ItemRecordInput = {
  id: string
  sku: string
  name: string
  description: string | null
  barcode: string | null
  categoryId: string | null
  trackingMode: ItemTrackingMode
  uom: string
  weightKg: DecimalLike | null
  dimensions: unknown
  minQuantity: DecimalLike
  isActive: boolean
  supplierId: string | null
  createdAt: Date
  deletedAt: Date | null
}

/**
 * toItemTableRecords.
 * @param records - Parameter for toItemTableRecords.
 * @returns Result from toItemTableRecords.
 */
export function toItemTableRecords(records: ItemRecordInput[]): ItemTableRecord[] {
  return records.map((record) => ({
    id: record.id,
    sku: record.sku,
    name: record.name,
    description: record.description,
    barcode: record.barcode,
    categoryId: record.categoryId,
    trackingMode: record.trackingMode,
    uom: record.uom,
    weightKg: record.weightKg?.toString() ?? null,
    dimensions: record.dimensions,
    minQuantity: Number(record.minQuantity),
    isActive: record.isActive,
    supplierId: record.supplierId,
    createdAt: record.createdAt.toISOString(),
    deletedAt: record.deletedAt?.toISOString() ?? null
  }))
}
