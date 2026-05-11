import type {
  SelectLocationModalBinDto,
  SelectLocationModalWarehouseDto,
  SelectLocationModalZoneDto
} from '@/types/dto/locations/select-location-modal.types'

export type SelectLocationModalTreeSource = {
  warehouses: Array<{ id: string; name: string }>
  zones: Array<{
    id: string
    warehouseId: string
    name: string
    type: string
  }>
  bins: Array<{
    id: string
    warehouseId: string
    zoneId: string
    name: string
    code: string
    type: string
    isBlocked: boolean
  }>
}

function toBinDto(bin: SelectLocationModalTreeSource['bins'][number]): SelectLocationModalBinDto {
  return {
    id: bin.id,
    name: bin.name,
    code: bin.code,
    type: bin.type,
    isBlocked: bin.isBlocked
  }
}

function buildZonesForWarehouse(
  source: SelectLocationModalTreeSource,
  warehouseId: string
): SelectLocationModalZoneDto[] {
  return source.zones
    .filter((zone) => zone.warehouseId === warehouseId)
    .map((zone) => ({
      id: zone.id,
      name: zone.name,
      type: zone.type,
      bins: source.bins
        .filter((bin) => bin.zoneId === zone.id)
        .map(toBinDto)
    }))
}

/**
 * Builds a nested warehouse → zone → bin tree for the dashboard location picker modal
 * from the flat lists returned by `GET /api/dashboard/home`.
 */
export function buildSelectLocationModalTree(
  source: SelectLocationModalTreeSource
): SelectLocationModalWarehouseDto[] {
  return source.warehouses.map((warehouse) => ({
    id: warehouse.id,
    name: warehouse.name,
    zones: buildZonesForWarehouse(source, warehouse.id)
  }))
}
