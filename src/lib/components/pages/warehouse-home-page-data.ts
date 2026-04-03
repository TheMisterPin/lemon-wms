import type { PrismaClient } from '@/generated/prisma'

async function getWarehouseHomePageData(prisma: PrismaClient) {
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
              isBlocked: true,
              blockReason: true,
              maxCapacity: true,
              type: true
            }
          }
        }
      }
    }
  })
  // divide warehouses, zones, and bins into separate arrays for easier consumption by the frontend
  const warehouses = rawData.map(warehouse => ({
    id: warehouse.id,
    name: warehouse.name,
    zones: warehouse.zones.length,
    bins: warehouse.zones.reduce((acc, zone) => acc + zone.bins.length, 0)
  }))
  const zones = rawData.flatMap(warehouse => warehouse.zones.map(zone => ({
    id: zone.id,
    warehouseId: warehouse.id,
    name: zone.name,
    type: zone.type,
    isActive: zone.isActive,
    bins: zone.bins.length

  })))
  const bins = rawData.flatMap(warehouse => warehouse.zones.flatMap(zone => zone.bins.map(bin => ({
    id: bin.id,
    zoneId: zone.id,
    name: bin.name,
    isBlocked: bin.isBlocked,
    blockReason: bin.blockReason,
    active: !bin.isBlocked,
    maxCapacity: bin.maxCapacity? bin.maxCapacity.toNumber() : 100,
    type: bin.type,
    currentCapacity: Math.floor(Math.random() * (bin.maxCapacity? bin.maxCapacity.toNumber() + 1 : 10)) // simulate current capacity with random number for now
  }))))
  const info = {
    warehouses: warehouses.length,
    zones: zones.length,
    bins: bins.length
  }
  const result = { info, warehouses, zones, bins }

  return result
}

export { getWarehouseHomePageData }
