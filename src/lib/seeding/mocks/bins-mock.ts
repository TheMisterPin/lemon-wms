import { BinType, Prisma } from '@/generated/prisma'

const BINS_PER_ZONE = 30
const ROWS = ['A', 'B', 'C', 'D', 'E', 'F']

const ZONE_BIN_TYPES: Record<string, BinType> = {
  RCV: BinType.RECEIVING,
  STA: BinType.STORAGE,
  STB: BinType.STORAGE,
  PKF: BinType.PICKING,
  SHP: BinType.SHIPPING,
}

const WAREHOUSE_IDS = ['W01','W02','W03','W04','W05','W06','W07','W08','W09','W10']
const ZONE_SLUGS    = ['RCV','STA','STB','PKF','SHP']

function binName(slug: string, index: number): string {
  const row = ROWS[Math.floor((index - 1) / 5) % ROWS.length]
  const pos = ((index - 1) % 5) + 1
  return `${slug} Row-${row} Pos-${pos}`
}

function buildBins(): Prisma.BinCreateManyInput[] {
  const bins: Prisma.BinCreateManyInput[] = []

  for (const wId of WAREHOUSE_IDS) {
    for (const slug of ZONE_SLUGS) {
      const zoneId  = `${wId}-${slug}`
      const binType = ZONE_BIN_TYPES[slug]

      for (let i = 1; i <= BINS_PER_ZONE; i++) {
        const code = `${wId}-${slug}-${String(i).padStart(3, '0')}`
        bins.push({
          id:          code,
          code,
          zoneId,
          warehouseId: wId,
          name:        binName(slug, i),
          type:        binType,
          isBlocked:   false,
        })
      }
    }
  }

  return bins
}

export const bins = buildBins()
