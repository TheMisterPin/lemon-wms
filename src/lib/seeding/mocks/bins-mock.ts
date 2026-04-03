import { BinType, Prisma } from '@/generated/prisma'

const zoneTypeByPosition: BinType[] = [
  BinType.RECEIVING,
  BinType.STORAGE,
  BinType.PICKING,
  BinType.PACKING,
  BinType.SHIPPING
]

const buildBinName = (type: BinType, index: number): string => {
  if (type === BinType.RECEIVING) {
    return `Dock ${index}`
  }

  if (type === BinType.STORAGE) {
    return `Rack-${String(index).padStart(2, '0')}`
  }

  if (type === BinType.PICKING) {
    return `Pick Face ${index}`
  }

  if (type === BinType.PACKING) {
    return `Pack Station ${index}`
  }

  return `Outbound Lane ${index}`
}

export const bins: Prisma.BinCreateManyInput[] = Array.from({ length: 10 }, (_, warehouseIndex) => {
  const warehouseCode = String(warehouseIndex + 1).padStart(4, '0')
  const warehouseId = `WH-${warehouseCode}`

  return Array.from({ length: 5 }, (_, zoneIndex) => {
    const zoneCode = String(zoneIndex + 1).padStart(4, '0')
    const zoneId = `ZN-${warehouseCode}-${zoneCode}`
    const binType = zoneTypeByPosition[zoneIndex]

    return Array.from({ length: 30 }, (_, binIndex) => {
      const binCode = String(binIndex + 1).padStart(4, '0')
      const id = `BIN-${warehouseCode}-${zoneCode}-${binCode}`

      return {
        id,
        code: id,
        warehouseId,
        zoneId,
        name: buildBinName(binType, binIndex + 1),
        type: binType,
        isBlocked: false
      }
    })
  }).flat()
}).flat()
