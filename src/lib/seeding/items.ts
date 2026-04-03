import { faker } from '@faker-js/faker'

import { ItemTrackingMode } from '@/generated/prisma'
import type { PrismaClient } from '@/generated/prisma'

// ---------------------------------------------------------------------------
// Unit of Measure master data — 20 standard UOMs
// ---------------------------------------------------------------------------
export const UNITS_OF_MEASURE = [
  { id: 'EA',  description: 'Each',         decimalRound: 0 },
  { id: 'PZ',  description: 'Piece',        decimalRound: 0 },
  { id: 'PK',  description: 'Pack',         decimalRound: 0 },
  { id: 'BX',  description: 'Box',          decimalRound: 0 },
  { id: 'CS',  description: 'Case',         decimalRound: 0 },
  { id: 'PLT', description: 'Pallet',       decimalRound: 0 },
  { id: 'KGS', description: 'Kilograms',    decimalRound: 3 },
  { id: 'GRS', description: 'Grams',        decimalRound: 0 },
  { id: 'LBS', description: 'Pounds',       decimalRound: 3 },
  { id: 'MT',  description: 'Metric Ton',   decimalRound: 3 },
  { id: 'LTR', description: 'Litre',        decimalRound: 3 },
  { id: 'ML',  description: 'Millilitre',   decimalRound: 0 },
  { id: 'M',   description: 'Metre',        decimalRound: 3 },
  { id: 'CM',  description: 'Centimetre',   decimalRound: 1 },
  { id: 'M2',  description: 'Square Metre', decimalRound: 3 },
  { id: 'M3',  description: 'Cubic Metre',  decimalRound: 3 },
  { id: 'ROL', description: 'Roll',         decimalRound: 0 },
  { id: 'SET', description: 'Set',          decimalRound: 0 },
  { id: 'PR',  description: 'Pair',         decimalRound: 0 },
  { id: 'DZ',  description: 'Dozen',        decimalRound: 0 },
]

// ---------------------------------------------------------------------------
// Category definitions
// ---------------------------------------------------------------------------
interface CategoryDef {
  name: string
  handlingFlags: string[]
  uoms: string[]
  trackingModes: ItemTrackingMode[]
  weightRange: [number, number]
  productLines: [string[], string[]]
}

const CATEGORIES: CategoryDef[] = [
  {
    name: 'Electronics & Components',
    handlingFlags: ['FRAGILE', 'ESD_SENSITIVE'],
    uoms: ['EA', 'PZ', 'PK', 'BX'],
    trackingModes: [ItemTrackingMode.SERIAL, ItemTrackingMode.LOT],
    weightRange: [0.05, 2.5],
    productLines: [
      ['Wireless', 'Programmable', 'Industrial', 'Compact', 'High-Frequency'],
      ['Sensor Module', 'Control Board', 'Power Supply Unit', 'Signal Converter', 'Relay Module'],
    ],
  },
  {
    name: 'Chemicals & Reagents',
    handlingFlags: ['HAZMAT', 'PERISHABLE'],
    uoms: ['LTR', 'ML', 'KGS', 'GRS'],
    trackingModes: [ItemTrackingMode.LOT],
    weightRange: [0.1, 25],
    productLines: [
      ['Industrial', 'Food-Grade', 'Lab-Grade', 'Technical', 'Pharmaceutical'],
      ['Solvent', 'Cleaning Agent', 'Lubricant', 'Adhesive', 'Coating Solution'],
    ],
  },
  {
    name: 'Raw Materials',
    handlingFlags: ['HEAVY'],
    uoms: ['KGS', 'MT', 'LBS', 'M', 'M2', 'M3'],
    trackingModes: [ItemTrackingMode.LOT, ItemTrackingMode.FIFO],
    weightRange: [1, 500],
    productLines: [
      ['Premium', 'Standard', 'Recycled', 'Structural', 'Refined'],
      ['Steel Sheet', 'Aluminium Bar', 'Copper Wire', 'Plastic Pellets', 'Timber Board'],
    ],
  },
  {
    name: 'Packaging Materials',
    handlingFlags: [],
    uoms: ['EA', 'PK', 'ROL', 'BX', 'CS'],
    trackingModes: [ItemTrackingMode.NONE, ItemTrackingMode.FIFO],
    weightRange: [0.01, 5],
    productLines: [
      ['Corrugated', 'Bubble', 'Stretch', 'Heavy-Duty', 'Eco-Friendly'],
      ['Shipping Box', 'Packing Tape', 'Bubble Wrap Roll', 'Foam Insert', 'Mailing Bag'],
    ],
  },
  {
    name: 'Tools & Hardware',
    handlingFlags: ['HEAVY'],
    uoms: ['EA', 'PZ', 'SET', 'PK'],
    trackingModes: [ItemTrackingMode.SERIAL, ItemTrackingMode.NONE],
    weightRange: [0.1, 15],
    productLines: [
      ['Professional', 'Heavy-Duty', 'Precision', 'Ergonomic', 'Industrial'],
      ['Torque Wrench', 'Socket Set', 'Drill Bit Set', 'Calibration Tool', 'Pneumatic Gun'],
    ],
  },
  {
    name: 'Personal Protective Equipment',
    handlingFlags: ['PERISHABLE'],
    uoms: ['EA', 'PZ', 'PK', 'BX', 'PR'],
    trackingModes: [ItemTrackingMode.LOT, ItemTrackingMode.FIFO],
    weightRange: [0.05, 2],
    productLines: [
      ['Class-A', 'Anti-Static', 'Chemical-Resistant', 'High-Visibility', 'Disposable'],
      ['Safety Helmet', 'Gloves', 'Face Shield', 'Safety Boots', 'Respirator Mask'],
    ],
  },
  {
    name: 'Food & Beverages',
    handlingFlags: ['PERISHABLE', 'TEMPERATURE_CONTROLLED'],
    uoms: ['KGS', 'LTR', 'CS', 'BX', 'DZ'],
    trackingModes: [ItemTrackingMode.LOT],
    weightRange: [0.25, 25],
    productLines: [
      ['Organic', 'Bulk', 'Premium', 'Frozen', 'Shelf-Stable'],
      ['Dried Goods', 'Cooking Oil', 'Beverage Concentrate', 'Dairy Product', 'Snack Mix'],
    ],
  },
  {
    name: 'Automotive Parts',
    handlingFlags: ['HEAVY', 'FRAGILE'],
    uoms: ['EA', 'PZ', 'SET', 'PR'],
    trackingModes: [ItemTrackingMode.SERIAL, ItemTrackingMode.LOT],
    weightRange: [0.1, 30],
    productLines: [
      ['OEM', 'Aftermarket', 'Heavy-Duty', 'Performance', 'Economy'],
      ['Brake Pad Set', 'Fuel Filter', 'Air Filter', 'Timing Belt', 'Alternator'],
    ],
  },
  {
    name: 'Medical Supplies',
    handlingFlags: ['PERISHABLE', 'FRAGILE', 'STERILE'],
    uoms: ['EA', 'BX', 'CS', 'PK'],
    trackingModes: [ItemTrackingMode.LOT, ItemTrackingMode.SERIAL],
    weightRange: [0.01, 5],
    productLines: [
      ['Sterile', 'Single-Use', 'Latex-Free', 'Hypoallergenic', 'Biodegradable'],
      ['Syringe', 'Bandage Roll', 'Examination Gloves', 'Wound Dressing', 'IV Set'],
    ],
  },
  {
    name: 'Office & Stationery',
    handlingFlags: [],
    uoms: ['EA', 'PK', 'BX', 'SET', 'DZ'],
    trackingModes: [ItemTrackingMode.NONE, ItemTrackingMode.FIFO],
    weightRange: [0.01, 3],
    productLines: [
      ['Premium', 'Recycled', 'Compact', 'Heavy-Duty', 'Colour-Coded'],
      ['Printer Paper', 'Binder Clip Set', 'Sticky Notes Pad', 'Correction Tape', 'File Folder'],
    ],
  },
  {
    name: 'Textiles & Fabrics',
    handlingFlags: ['FRAGILE'],
    uoms: ['M', 'M2', 'ROL', 'KGS'],
    trackingModes: [ItemTrackingMode.LOT, ItemTrackingMode.FIFO],
    weightRange: [0.1, 50],
    productLines: [
      ['Industrial', 'Flame-Retardant', 'Anti-Microbial', 'Waterproof', 'Breathable'],
      ['Woven Fabric', 'Non-Woven Cloth', 'Mesh Panel', 'Foam Padding', 'Reflective Tape'],
    ],
  },
  {
    name: 'Cleaning & Janitorial',
    handlingFlags: ['HAZMAT'],
    uoms: ['LTR', 'KGS', 'CS', 'BX'],
    trackingModes: [ItemTrackingMode.LOT, ItemTrackingMode.FIFO],
    weightRange: [0.5, 20],
    productLines: [
      ['Industrial-Strength', 'Eco', 'Hospital-Grade', 'Concentrated', 'Fragrance-Free'],
      ['Floor Cleaner', 'Disinfectant Spray', 'Degreaser', 'Glass Cleaner', 'Hand Sanitiser'],
    ],
  },
]

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]
}

function sku(index: number): string {
  return `SKU-${String(index).padStart(6, '0')}`
}

function itemName(cat: CategoryDef): string {
  const adj  = pick(cat.productLines[0])
  const noun = pick(cat.productLines[1])
  const variant = pick([
    `${faker.color.human()} `,
    `${faker.number.int({ min: 100, max: 9999 })}mm `,
    `${faker.number.int({ min: 5,   max: 500  })}ml `,
    `${faker.number.int({ min: 1,   max: 50   })}kg `,
    '', '', '',
  ])
  return `${adj} ${noun} ${variant}`.trim().replace(/\s+/g, ' ')
}

// ---------------------------------------------------------------------------
// Exported seed function
// ---------------------------------------------------------------------------
export async function seedItemsAndUOMs(prisma: PrismaClient, target = 1000) {
  // 1. UOMs
  for (const uom of UNITS_OF_MEASURE) {
    await prisma.unitOfMeasure.upsert({
      where:  { id: uom.id },
      update: { description: uom.description, decimalRound: uom.decimalRound },
      create: uom,
    })
  }

  // 2. Categories
  const categoryMap = new Map<string, string>()
  for (const cat of CATEGORIES) {
    const record = await prisma.itemCategory.upsert({
      where:  { name: cat.name },
      update: { handlingFlags: cat.handlingFlags },
      create: { name: cat.name, handlingFlags: cat.handlingFlags },
    })
    categoryMap.set(cat.name, record.id)
  }

  // 3. Items
  let created = 0
  let skipped = 0

  for (let i = 1; i <= target; i++) {
    const cat        = CATEGORIES[(i - 1) % CATEGORIES.length]
    const categoryId = categoryMap.get(cat.name)!
    const itemSku    = sku(i)
    const uomCode    = pick(cat.uoms)
    const trackingMode = pick(cat.trackingModes)
    const [wMin, wMax] = cat.weightRange

    try {
      await prisma.wARItem.upsert({
        where:  { sku: itemSku },
        update: {},
        create: {
          id: `item-${String(i).padStart(6, '0')}`,
          sku: itemSku,
          name: itemName(cat),
          description: faker.commerce.productDescription(),
          barcode: faker.string.numeric(13),
          categoryId,
          trackingMode,
          uomCode,
          weightKg: parseFloat(
            faker.number.float({ min: wMin, max: wMax, fractionDigits: 3 }).toFixed(3),
          ),
          dimensions: {
            lengthCm: parseFloat(faker.number.float({ min: 1, max: 200, fractionDigits: 1 }).toFixed(1)),
            widthCm:  parseFloat(faker.number.float({ min: 1, max: 100, fractionDigits: 1 }).toFixed(1)),
            heightCm: parseFloat(faker.number.float({ min: 1, max: 100, fractionDigits: 1 }).toFixed(1)),
          },
          minQuantity: faker.number.int({ min: 0, max: 50 }),
          isActive: faker.datatype.boolean({ probability: 0.95 }),
          supplierId: null,
        },
      })
      created++
    } catch {
      skipped++
    }
  }

  return {
    uomsSeeded:       UNITS_OF_MEASURE.length,
    categoriesSeeded: CATEGORIES.length,
    itemsCreated:     created,
    itemsSkipped:     skipped,
  }
}
