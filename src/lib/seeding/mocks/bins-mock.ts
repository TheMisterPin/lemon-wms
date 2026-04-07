import { BinType, Prisma } from '@/generated/prisma'

const binTypeByZonePosition: BinType[] = [
  BinType.GENERAL,
  BinType.QUARANTINE,
  BinType.GENERAL,
  BinType.QUARANTINE,
  BinType.STAGING,
  BinType.RECEIVING
]

const buildBinName = (type: BinType, index: number): string => {
  if (type === BinType.RECEIVING) {
    return `Dock ${index}`
  }

  if (type === BinType.OUTGOING) {
    return `Outgoing Bin ${index}`
  }

  if (type === BinType.QUARANTINE) {
    return `Quarantine Bin ${index}`
  }

  if (type === BinType.STAGING) {
    return `Staging Bin ${index}`
  }

  if (type === BinType.GENERAL) {
    return `General Bin ${index}`
  }

  return `Unknown Bin Type ${index}`
}

export const bins: Prisma.BinCreateManyInput[] = Array.from({ length: 5 }, (_, warehouseIndex) => {
  const warehouseCode = String(warehouseIndex + 1).padStart(4, '0')
  const warehouseId = `WH-${warehouseCode}`

  return Array.from({ length: 6 }, (_, zoneIndex) => {
    const zoneCode = String(zoneIndex + 1).padStart(4, '0')
    const zoneId = `ZN-${warehouseCode}-${zoneCode}`
    const binType = binTypeByZonePosition[zoneIndex]

    return Array.from({ length: 20 }, (_, binIndex) => {
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
