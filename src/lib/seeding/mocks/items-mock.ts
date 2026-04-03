import { faker } from '@faker-js/faker'
import { ItemTrackingMode, Prisma } from '@/generated/prisma'

faker.seed(20260403)

const categories = [
  'Electronics',
  'Apparel',
  'Home Goods',
  'Industrial Supplies',
  'Automotive',
  'Health & Beauty',
  'Sports & Outdoors',
  'Office Supplies'
]

export const itemCategories: Prisma.ItemCategoryCreateManyInput[] = categories.map((name, index) => ({
  id: `CAT-${String(index + 1).padStart(4, '0')}`,
  name
}))

const uomOptions = ['PZ', 'KGS', 'MT'] as const

export const items: Prisma.ItemCreateManyInput[] = Array.from({ length: 1000 }, (_, index) => {
  const itemNo = index + 1
  const id = `ITM-${String(itemNo).padStart(6, '0')}`
  const uom = faker.helpers.arrayElement(uomOptions)
  const trackingMode = faker.helpers.arrayElement([
    ItemTrackingMode.NONE,
    ItemTrackingMode.LOT,
    ItemTrackingMode.SERIAL,
    ItemTrackingMode.FIFO
  ])

  const adjective = faker.commerce.productAdjective()
  const material = faker.commerce.productMaterial()
  const product = faker.commerce.product()
  const name = `${adjective} ${material} ${product}`

  return {
    id,
    sku: `SKU-${String(itemNo).padStart(6, '0')}`,
    name,
    description: faker.commerce.productDescription(),
    barcode: faker.string.numeric(13),
    trackingMode,
    uom,
    weightKg: uom === 'KGS' ? faker.number.float({ min: 1, max: 50, fractionDigits: 3 }) : faker.number.float({ min: 0.05, max: 15, fractionDigits: 3 }),
    dimensions: {
      lengthCm: faker.number.int({ min: 5, max: 120 }),
      widthCm: faker.number.int({ min: 5, max: 80 }),
      heightCm: faker.number.int({ min: 2, max: 60 })
    },
    minQuantity: faker.number.int({ min: 1, max: 100 }),
    isActive: true,
    supplierId: `SUP-${String((index % 30) + 1).padStart(4, '0')}`
  }
})
