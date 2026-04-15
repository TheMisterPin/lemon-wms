import type { PrismaClient } from '@/generated/prisma'

async function getWarehouseHomeData(prisma: PrismaClient) {
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
              currentCapacity: true,
              maxCapacity: true,
              type: true,
              _count: {
                select: { binStockItems: true }
              }
            }
          }
        }
      }
    }
  })

  const warehouses = rawData.map((warehouse) => ({
    id: warehouse.id,
    name: warehouse.name,
    zones: warehouse.zones.length,
    bins: warehouse.zones.reduce((acc, zone) => acc + zone.bins.length, 0)
  }))

  const zones = rawData.flatMap((warehouse) =>
    warehouse.zones.map((zone) => ({
      id: zone.id,
      warehouseId: warehouse.id,
      name: zone.name,
      type: zone.type,
      isActive: zone.isActive,
      bins: zone.bins.length
    }))
  )

  const bins = rawData.flatMap((warehouse) =>
    warehouse.zones.flatMap((zone) =>
      zone.bins.map((bin) => {
        const maxCapacity = bin.maxCapacity?.toNumber() ?? null
        const currentCapacity = bin.currentCapacity?.toNumber() ?? null
        const filledPercentage =
          maxCapacity !== null && maxCapacity > 0 && currentCapacity !== null
            ? (currentCapacity / maxCapacity) * 100
            : null

        return {
          id: bin.id,
          warehouseId: warehouse.id,
          zoneId: zone.id,
          name: bin.name,
          code: bin.code,
          isBlocked: bin.isBlocked,
          blockReason: bin.blockReason,
          active: !bin.isBlocked,
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

export { getWarehouseHomeData }
