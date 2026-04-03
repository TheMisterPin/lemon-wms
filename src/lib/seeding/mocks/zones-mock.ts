import { Prisma, ZoneType } from '@/generated/prisma'

const zoneDefinitions: Array<{ name: string, type: ZoneType }> = [
  { name: 'Receiving', type: ZoneType.RECEIVING },
  { name: 'Storage', type: ZoneType.STORAGE },
  { name: 'Picking', type: ZoneType.PICKING },
  { name: 'Packing', type: ZoneType.PACKING },
  { name: 'Shipping', type: ZoneType.SHIPPING }
]

export const zones: Prisma.ZoneCreateManyInput[] = Array.from({ length: 10 }, (_, warehouseIndex) => {
  const warehouseCode = String(warehouseIndex + 1).padStart(4, '0')
  const warehouseId = `WH-${warehouseCode}`

  return zoneDefinitions.map((zone, zoneIndex) => ({
    id: `ZN-${warehouseCode}-${String(zoneIndex + 1).padStart(4, '0')}`,
    warehouseId,
    name: `${zone.name} Zone`,
    type: zone.type,
    isActive: true
  }))
}).flat()
