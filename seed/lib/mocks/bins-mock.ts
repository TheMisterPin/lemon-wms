import { BinType, Prisma } from '@/generated/prisma'

const BINS_PER_ZONE = 20
const WAREHOUSE_COUNT = 5
const ZONES_PER_WAREHOUSE = 6

/**
 * randomCount1to3.
 * @returns Integer in [1, 3].
 */
const randomCount1to3 = (): number => Math.floor(Math.random() * 3) + 1

/**
 * buildBinName.
 * @param type - Parameter for buildBinName.
 * @param index - Parameter for buildBinName.
 * @returns Result from buildBinName.
 */
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

export type ZoneDefaultBinPointers = {
  zoneId: string
  defaultReceivingBinId: string | null
  defaultQuarantineBinId: string | null
  defaultOutgoingBinId: string | null
}

const zoneDefaultBinPointers: ZoneDefaultBinPointers[] = []
const bins: Prisma.BinCreateManyInput[] = []

for (let warehouseIndex = 0; warehouseIndex < WAREHOUSE_COUNT; warehouseIndex++) {
  const warehouseCode = String(warehouseIndex + 1).padStart(4, '0')
  const warehouseId = `WH-${warehouseCode}`

  for (let zoneIndex = 0; zoneIndex < ZONES_PER_WAREHOUSE; zoneIndex++) {
    const zoneCode = String(zoneIndex + 1).padStart(4, '0')
    const zoneId = `ZN-${warehouseCode}-${zoneCode}`

    const receivingCount = randomCount1to3()
    const outgoingCount = randomCount1to3()
    const stagingCount = randomCount1to3()
    const quarantineCount = randomCount1to3()
    const generalCount = BINS_PER_ZONE - receivingCount - outgoingCount - stagingCount - quarantineCount

    const typeSequence: BinType[] = [
      ...Array.from({ length: receivingCount }, () => BinType.RECEIVING),
      ...Array.from({ length: outgoingCount }, () => BinType.OUTGOING),
      ...Array.from({ length: stagingCount }, () => BinType.STAGING),
      ...Array.from({ length: quarantineCount }, () => BinType.QUARANTINE),
      ...Array.from({ length: generalCount }, () => BinType.GENERAL)
    ]

    const perTypeIndex: Record<BinType, number> = {
      [BinType.GENERAL]: 0,
      [BinType.RECEIVING]: 0,
      [BinType.OUTGOING]: 0,
      [BinType.QUARANTINE]: 0,
      [BinType.STAGING]: 0
    }

    let defaultReceivingBinId: string | null = null
    let defaultOutgoingBinId: string | null = null
    let defaultQuarantineBinId: string | null = null

    for (let binIndex = 0; binIndex < typeSequence.length; binIndex++) {
      const binType = typeSequence[binIndex]
      perTypeIndex[binType] += 1
      const binCode = String(binIndex + 1).padStart(4, '0')
      const id = `BIN-${warehouseCode}-${zoneCode}-${binCode}`

      if (binType === BinType.RECEIVING && receivingCount === 1) {
        defaultReceivingBinId = id
      }

      if (binType === BinType.OUTGOING && outgoingCount === 1) {
        defaultOutgoingBinId = id
      }

      if (binType === BinType.QUARANTINE && quarantineCount === 1) {
        defaultQuarantineBinId = id
      }

      bins.push({
        id,
        code: id,
        warehouseId,
        zoneId,
        name: buildBinName(binType, perTypeIndex[binType]),
        type: binType,
        isBlocked: false,
        maxCapacity: 100
      })
    }

    zoneDefaultBinPointers.push({
      zoneId,
      defaultReceivingBinId,
      defaultQuarantineBinId,
      defaultOutgoingBinId
    })
  }
}

export { bins, zoneDefaultBinPointers }
