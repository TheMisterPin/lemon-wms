import { PrismaClient, ItemTrackingMode } from '../src/generated/prisma'
import { faker } from '@faker-js/faker'

const prisma = new PrismaClient()

// ---------------------------------------------------------------------------
// Unit of Measure master data
// ---------------------------------------------------------------------------
const UNITS_OF_MEASURE = [
  { id: 'EA',   description: 'Each',            decimalRound: 0 },
  { id: 'PZ',   description: 'Piece',           decimalRound: 0 },
  { id: 'PK',   description: 'Pack',            decimalRound: 0 },
  { id: 'BX',   description: 'Box',             decimalRound: 0 },
  { id: 'CS',   description: 'Case',            decimalRound: 0 },
  { id: 'PLT',  description: 'Pallet',          decimalRound: 0 },
  { id: 'KGS',  description: 'Kilograms',       decimalRound: 3 },
  { id: 'GRS',  description: 'Grams',           decimalRound: 0 },
  { id: 'LBS',  description: 'Pounds',          decimalRound: 3 },
  { id: 'MT',   description: 'Metric Ton',      decimalRound: 3 },
  { id: 'LTR',  description: 'Litre',           decimalRound: 3 },
  { id: 'ML',   description: 'Millilitre',      decimalRound: 0 },
  { id: 'M',    description: 'Metre',           decimalRound: 3 },
  { id: 'CM',   description: 'Centimetre',      decimalRound: 1 },
  { id: 'M2',   description: 'Square Metre',    decimalRound: 3 },
  { id: 'M3',   description: 'Cubic Metre',     decimalRound: 3 },
  { id: 'ROL',  description: 'Roll',            decimalRound: 0 },
  { id: 'SET',  description: 'Set',             decimalRound: 0 },
  { id: 'PR',   description: 'Pair',            decimalRound: 0 },
  { id: 'DZ',   description: 'Dozen',           decimalRound: 0 },
]

// ---------------------------------------------------------------------------
// Category definitions — name → allowed UOM codes + tracking mode hints
// ---------------------------------------------------------------------------
interface CategoryDef {
  name: string
  handlingFlags: string[]
  uoms: string[]
  trackingModes: ItemTrackingMode[]
  weightRange: [number, number]   // kg
  productLines: string[][]        // [adjective[], noun[]]
}

const CATEGORIES: CategoryDef[] = [
  {
    name: 'Electronics & Components',
    handlingFlags: ['FRAGILE', 'ESD_SENSITIVE'],
    uoms: ['EA', 'PZ', 'PK', 'BX'],
    trackingModes: ['SERIAL', 'LOT'],
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
    trackingModes: ['LOT'],
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
    trackingModes: ['LOT', 'FIFO'],
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
    trackingModes: ['NONE', 'FIFO'],
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
    trackingModes: ['SERIAL', 'NONE'],
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
    trackingModes: ['LOT', 'FIFO'],
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
    trackingModes: ['LOT'],
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
    trackingModes: ['SERIAL', 'LOT'],
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
    trackingModes: ['LOT', 'SERIAL'],
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
    trackingModes: ['NONE', 'FIFO'],
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
    trackingModes: ['LOT', 'FIFO'],
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
    trackingModes: ['LOT', 'FIFO'],
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
function pickRandom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]
}

function pickTrackingMode(modes: ItemTrackingMode[]): ItemTrackingMode {
  return pickRandom(modes)
}

function generateSku(index: number): string {
  return `SKU-${String(index).padStart(6, '0')}`
}

function generateBarcode(): string {
  return faker.string.numeric(13)
}

function generateItemName(cat: CategoryDef): string {
  const adj = pickRandom(cat.productLines[0])
  const noun = pickRandom(cat.productLines[1])
  const variant = faker.helpers.arrayElement([
    `${faker.color.human()} `,
    `${faker.number.int({ min: 100, max: 9999 })}mm `,
    `${faker.number.int({ min: 5, max: 500 })}ml `,
    `${faker.number.int({ min: 1, max: 50 })}kg `,
    '',
    '',
    '',
  ])
  return `${adj} ${noun} ${variant}`.trim().replace(/\s+/g, ' ')
}

function generateWeight(range: [number, number]): number {
  return parseFloat(faker.number.float({ min: range[0], max: range[1], fractionDigits: 3 }).toFixed(3))
}

function generateDimensions() {
  return {
    lengthCm: parseFloat(faker.number.float({ min: 1, max: 200, fractionDigits: 1 }).toFixed(1)),
    widthCm:  parseFloat(faker.number.float({ min: 1, max: 100, fractionDigits: 1 }).toFixed(1)),
    heightCm: parseFloat(faker.number.float({ min: 1, max: 100, fractionDigits: 1 }).toFixed(1)),
  }
}

// ---------------------------------------------------------------------------
// Main seed
// ---------------------------------------------------------------------------
async function main() {
  console.log('Seeding UnitOfMeasure records...')
  for (const uom of UNITS_OF_MEASURE) {
    await prisma.unitOfMeasure.upsert({
      where: { id: uom.id },
      update: { description: uom.description, decimalRound: uom.decimalRound },
      create: uom,
    })
  }
  console.log(`  ✓ ${UNITS_OF_MEASURE.length} units of measure`)

  console.log('Seeding ItemCategory records...')
  const categoryMap = new Map<string, string>() // name → id
  for (const cat of CATEGORIES) {
    const record = await prisma.itemCategory.upsert({
      where: { name: cat.name },
      update: { handlingFlags: cat.handlingFlags },
      create: { name: cat.name, handlingFlags: cat.handlingFlags },
    })
    categoryMap.set(cat.name, record.id)
  }
  console.log(`  ✓ ${CATEGORIES.length} categories`)

  console.log('Seeding 1000 WARItem records...')
  const TARGET = 1000
  let created = 0
  let skipped = 0

  for (let i = 1; i <= TARGET; i++) {
    const cat = CATEGORIES[(i - 1) % CATEGORIES.length]
    const categoryId = categoryMap.get(cat.name)!
    const sku = generateSku(i)
    const uomCode = pickRandom(cat.uoms)
    const trackingMode = pickTrackingMode(cat.trackingModes)

    try {
      await prisma.wARItem.upsert({
        where: { sku },
        update: {},
        create: {
          sku,
          name: generateItemName(cat),
          description: faker.commerce.productDescription(),
          barcode: generateBarcode(),
          categoryId,
          trackingMode,
          uomCode,
          weightKg: generateWeight(cat.weightRange),
          dimensions: generateDimensions(),
          minQuantity: faker.number.int({ min: 0, max: 50 }),
          isActive: faker.datatype.boolean({ probability: 0.95 }),
          supplierId: null,
        },
      })
      created++
    } catch {
      skipped++
    }

    if (i % 100 === 0) {
      process.stdout.write(`  ${i}/${TARGET}...\n`)
    }
  }

  console.log(`  ✓ ${created} items created, ${skipped} skipped (already existed)`)
  console.log('\nDone.')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
