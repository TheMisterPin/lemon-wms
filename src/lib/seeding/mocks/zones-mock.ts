import { Prisma, ZoneType } from '@/generated/prisma'

// 5 zones per warehouse — consistent layout, names tuned per facility type
const ZONE_DEFS = [
  { slug: 'RCV', name: 'Inbound Receiving Dock',          type: ZoneType.RECEIVING  },
  { slug: 'STA', name: 'General Storage A — Bulk Racking', type: ZoneType.STORAGE   },
  { slug: 'STB', name: 'General Storage B — Shelving',     type: ZoneType.STORAGE   },
  { slug: 'PKF', name: 'Pick Face & Forward Picking',      type: ZoneType.PICKING   },
  { slug: 'SHP', name: 'Outbound Shipping & Staging',      type: ZoneType.SHIPPING  },
]

const WAREHOUSE_IDS = ['W01','W02','W03','W04','W05','W06','W07','W08','W09','W10']

function buildZones(): Prisma.ZoneCreateManyInput[] {
  return WAREHOUSE_IDS.flatMap((wId) =>
    ZONE_DEFS.map((z) => ({
      id:          `${wId}-${z.slug}`,
      warehouseId: wId,
      name:        z.name,
      type:        z.type,
      isActive:    true,
    }))
  )
}

export const zones = buildZones()
