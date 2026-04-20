import { Prisma, ZoneType } from '@/generated/prisma'

const zoneDefinitions: Array<{ name: string, type: ZoneType }> = [
  { name: 'General Storage', type: ZoneType.GENERAL },
  { name: 'Hazmat Storage', type: ZoneType.HAZMAT },
  { name: 'Cold Storage Area', type: ZoneType.COLD },
  { name: 'Quarantine Area', type: ZoneType.QUARANTINE },
  { name: 'Staging Area', type: ZoneType.STAGING },
  { name: 'Returns Area', type: ZoneType.RETURNS }
]

export const zones: Prisma.ZoneCreateManyInput[] = Array.from({ length: 5 }, (_, warehouseIndex) => {
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
