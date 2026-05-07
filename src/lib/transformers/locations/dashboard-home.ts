import type { Warehouse } from '@/lib/locations'
import type {
  BinApiRecord,
  DashboardHomePayload,
  ZoneApiRecord
} from '@/types/api/locations/dashboard-home'

export function mapWireWarehousesToDomainWarehouses(
  warehouses: DashboardHomePayload['warehouses']
): Warehouse[] {
  return warehouses.map((w) => ({
    ...w,
    status: 'ACTIVE',
    timezone: 'UTC',
    currency: 'USD',
    address: '',
    createdById: null,
    createdAt: new Date(),
    deletedAt: null
  }))
}

export function mapWireZonesToZoneApiRecords(
  zones: DashboardHomePayload['zones']
): ZoneApiRecord[] {
  return zones.map((zone) => ({
    id: zone.id,
    warehouseId: zone.warehouseId,
    name: zone.name,
    type: zone.type,
    isActive: zone.isActive,
    createdAt: new Date().toISOString(),
    deletedAt: null
  }))
}

export function mapWireBinsToBinApiRecords(
  bins: DashboardHomePayload['bins']
): BinApiRecord[] {
  return bins.map((bin) => ({
    id: bin.id,
    warehouseId: bin.warehouseId,
    zoneId: bin.zoneId,
    name: bin.name,
    code: bin.code,
    type: bin.type,
    isBlocked: bin.isBlocked,
    createdAt: bin.createdAt,
    deletedAt: null,
    maxCapacity: bin.maxCapacity,
    currentCapacity: bin.currentCapacity,
    filledPercentage: bin.filledPercentage,
    itemsInBin: bin.itemsInBin
  }))
}
