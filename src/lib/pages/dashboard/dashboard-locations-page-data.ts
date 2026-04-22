import type { PrismaClient } from '@/generated/prisma'

type LocationsHomeInfoDTO = {
  warehouses: number
  zones: number
  bins: number
}

type LocationsHomeWarehouseDTO = {
  id: string
  name: string
  zones: number
  bins: number
}

type LocationsHomeZoneDTO = {
  id: string
  warehouseId: string
  name: string
  type: string
  isActive: boolean
  bins: number
}

type LocationsHomeBinDTO = {
  id: string
  warehouseId: string
  zoneId: string
  name: string
  code: string
  isBlocked: boolean
  blockReason: string | null
  active: boolean
  maxCapacity: number | null
  currentCapacity: number | null
  filledPercentage: number
  itemsInBin: number
  type: string
  createdAt: string
}

type LocationsHomeDataDTO = {
  info: LocationsHomeInfoDTO
  warehouses: LocationsHomeWarehouseDTO[]
  zones: LocationsHomeZoneDTO[]
  bins: LocationsHomeBinDTO[]
}

/**
 * Retrieves warehouse home dashboard data.
 *
 * Returns:
 * - top-level totals for warehouses, zones, and bins
 * - warehouse summary rows
 * - zone summary rows
 * - bin records formatted for the current dashboard UI
 *
 * Notes:
 * - `itemsInBin` currently represents the count of related `binStockItems` rows,
 *   not the summed on-hand quantity.
 * - `filledPercentage` is derived from `currentCapacity / maxCapacity`.
 * - `active` is sourced from the bin record itself and is not inferred from `isBlocked`.
 *
 * @param {PrismaClient} prisma - Prisma client instance used to query the database.
 * @returns {Promise<WarehouseHomeDataDTO>}
 */
async function getLocationsHomeData(
  prisma: PrismaClient
): Promise<LocationsHomeDataDTO> {
  const rawData = await prisma.warehouse.findMany({
    select: {
      id: true,
      name: true,
      status: true,
      zones: {
        select: {
          id: true,
          name: true,
          type: true,
          isActive: true,
          bins: {
            select: {
              id: true,
              name: true,
              code: true,
              createdAt: true,
              isBlocked: true,
              blockReason: true,
              isActive: true,
              currentCapacity: true,
              maxCapacity: true,
              type: true,
              _count: {
                select: {
                  binStockItems: true
                }
              }
            }
          }
        }
      }
    }
  })

  const warehouses: LocationsHomeWarehouseDTO[] = rawData.map((warehouse) => ({
    id: warehouse.id,
    name: warehouse.name,
    zones: warehouse.zones.length,
    bins: warehouse.zones.reduce((acc, zone) => acc + zone.bins.length, 0)
  }))

  const zones: LocationsHomeZoneDTO[] = rawData.flatMap((warehouse) =>
    warehouse.zones.map((zone) => ({
      id: zone.id,
      warehouseId: warehouse.id,
      name: zone.name,
      type: zone.type,
      isActive: zone.isActive,
      bins: zone.bins.length
    }))
  )

  const bins: LocationsHomeBinDTO[] = rawData.flatMap((warehouse) =>
    warehouse.zones.flatMap((zone) =>
      zone.bins.map((bin) => {
        const maxCapacity = bin.maxCapacity?.toNumber() ?? null
        const currentCapacity = bin.currentCapacity?.toNumber() ?? null

        const filledPercentage =
          maxCapacity !== null && maxCapacity > 0 && currentCapacity !== null
            ? Math.round((currentCapacity / maxCapacity) * 100)
            : 0

        return {
          id: bin.id,
          warehouseId: warehouse.id,
          zoneId: zone.id,
          name: bin.name,
          code: bin.code,
          isBlocked: bin.isBlocked,
          blockReason: bin.blockReason,
          active: bin.isActive,
          maxCapacity,
          currentCapacity,
          filledPercentage,
          itemsInBin: bin._count.binStockItems,
          type: bin.type,
          createdAt: bin.createdAt.toISOString()
        }
      })
    )
  )

  return {
    info: {
      warehouses: warehouses.length,
      zones: zones.length,
      bins: bins.length
    },
    warehouses,
    zones,
    bins
  }
}

export {
  getLocationsHomeData,
  type LocationsHomeDataDTO,
  type LocationsHomeInfoDTO,
  type LocationsHomeWarehouseDTO,
  type LocationsHomeZoneDTO,
  type LocationsHomeBinDTO
}
