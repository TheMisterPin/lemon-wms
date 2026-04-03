import type { PrismaClient } from '@/generated/prisma'
import { BinType, ZoneType } from '@/generated/prisma'

// ---------------------------------------------------------------------------
// Warehouse master data — 10 facilities
// ---------------------------------------------------------------------------
const WAREHOUSES = [
  { code: 'W01', name: 'Metropolitan Distribution Hub',    city: 'New York',      state: 'NY', timezone: 'America/New_York',    currency: 'USD' },
  { code: 'W02', name: 'Pacific Coast Fulfillment Center', city: 'Los Angeles',   state: 'CA', timezone: 'America/Los_Angeles', currency: 'USD' },
  { code: 'W03', name: 'Great Lakes Logistics Depot',      city: 'Chicago',       state: 'IL', timezone: 'America/Chicago',     currency: 'USD' },
  { code: 'W04', name: 'Southern Regional Warehouse',      city: 'Atlanta',       state: 'GA', timezone: 'America/New_York',    currency: 'USD' },
  { code: 'W05', name: 'Mountain States Storage Center',   city: 'Denver',        state: 'CO', timezone: 'America/Denver',      currency: 'USD' },
  { code: 'W06', name: 'Northeast Cold Storage Facility',  city: 'Boston',        state: 'MA', timezone: 'America/New_York',    currency: 'USD' },
  { code: 'W07', name: 'Gulf Coast Distribution Center',   city: 'Houston',       state: 'TX', timezone: 'America/Chicago',     currency: 'USD' },
  { code: 'W08', name: 'Pacific Northwest Regional Hub',   city: 'Seattle',       state: 'WA', timezone: 'America/Los_Angeles', currency: 'USD' },
  { code: 'W09', name: 'Mid-Atlantic Fulfillment Center',  city: 'Philadelphia',  state: 'PA', timezone: 'America/New_York',    currency: 'USD' },
  { code: 'W10', name: 'Sunbelt Regional Depot',           city: 'Phoenix',       state: 'AZ', timezone: 'America/Phoenix',     currency: 'USD' },
]

// ---------------------------------------------------------------------------
// Zone layout — 5 zones per warehouse (RECEIVING, STORAGE×2, PICKING, SHIPPING + QUARANTINE)
// Each warehouse gets zones with names tailored to its purpose
// ---------------------------------------------------------------------------
interface ZoneDef {
  slug:  string         // used in codes, e.g. RCV → W01-RCV
  name:  string
  type:  ZoneType
  binType: BinType
  binNamePrefix: string // e.g. "RCV" → RCV-A-001
}

const ZONE_LAYOUT: ZoneDef[] = [
  {
    slug: 'RCV',
    name: 'Inbound Receiving Dock',
    type: ZoneType.RECEIVING,
    binType: BinType.RECEIVING,
    binNamePrefix: 'RCV',
  },
  {
    slug: 'STA',
    name: 'General Storage A — Bulk',
    type: ZoneType.STORAGE,
    binType: BinType.STORAGE,
    binNamePrefix: 'STA',
  },
  {
    slug: 'STB',
    name: 'General Storage B — Shelving',
    type: ZoneType.STORAGE,
    binType: BinType.STORAGE,
    binNamePrefix: 'STB',
  },
  {
    slug: 'PKF',
    name: 'Pick Face & Forward Picking',
    type: ZoneType.PICKING,
    binType: BinType.PICK_FACE,
    binNamePrefix: 'PKF',
  },
  {
    slug: 'SHP',
    name: 'Outbound Shipping & Staging',
    type: ZoneType.SHIPPING,
    binType: BinType.SHIPPING,
    binNamePrefix: 'SHP',
  },
]

const BINS_PER_ZONE = 30

// Build a bin code: W01-RCV-001
function binCode(warehouseCode: string, zoneSlug: string, index: number): string {
  return `${warehouseCode}-${zoneSlug}-${String(index).padStart(3, '0')}`
}

// Bin names cycle through shelf rows A–F, positions 1–5
const ROWS = ['A', 'B', 'C', 'D', 'E', 'F']
function binName(zoneSlug: string, index: number): string {
  const row = ROWS[Math.floor((index - 1) / 5) % ROWS.length]
  const pos = ((index - 1) % 5) + 1
  return `${zoneSlug} Row-${row} Pos-${pos}`
}

// ---------------------------------------------------------------------------
// Seed function
// ---------------------------------------------------------------------------
export async function seedLocations(prisma: PrismaClient) {
  let warehousesCreated = 0
  let zonesCreated = 0
  let binsCreated = 0

  for (const wh of WAREHOUSES) {
    const address = `${wh.name}, ${wh.city}, ${wh.state}, USA`

    const warehouse = await prisma.warehouse.upsert({
      where:  { id: wh.code },
      update: {},
      create: {
        id:        wh.code,
        name:      wh.name,
        address,
        timezone:  wh.timezone,
        currency:  wh.currency,
        status:    'ACTIVE',
      },
    })
    warehousesCreated++

    for (const zoneDef of ZONE_LAYOUT) {
      const zoneId = `${wh.code}-${zoneDef.slug}`

      const zone = await prisma.zone.upsert({
        where:  { id: zoneId },
        update: {},
        create: {
          id:          zoneId,
          warehouseId: warehouse.id,
          name:        zoneDef.name,
          type:        zoneDef.type,
          isActive:    true,
        },
      })
      zonesCreated++

      for (let i = 1; i <= BINS_PER_ZONE; i++) {
        const code = binCode(wh.code, zoneDef.slug, i)
        const name = binName(zoneDef.slug, i)

        await prisma.bin.upsert({
          where:  { code },
          update: {},
          create: {
            id:          code,
            zoneId:      zone.id,
            warehouseId: warehouse.id,
            name,
            code,
            type:        zoneDef.binType,
            isBlocked:   false,
          },
        })
        binsCreated++
      }
    }
  }

  return { warehousesCreated, zonesCreated, binsCreated }
}
