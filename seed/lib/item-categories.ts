// Seed only active MVP category families.

import { type PrismaClient } from '@/generated/prisma'

// ---------------------------------------------------------------------------
// Data definition
// ---------------------------------------------------------------------------

interface SubCategory {
  code: string
  name: string
  iconUrl?: string
  description?: string
  handlingFlags?: string[]
}

interface ParentCategory {
  code: string
  name: string
  iconUrl?: string
  description: string
  handlingFlags?: string[]
  children: SubCategory[]
}

const categories: ParentCategory[] = [
  {
    code: 'APRL',
    name: 'Apparel',
    iconUrl: 'https://img.icons8.com/parakeet-line/48/clothes.png',
    description: 'Clothing, footwear, and fashion accessories',
    children: [
      { code: 'SHRT', name: 'Shirts', iconUrl: 'https://img.icons8.com/ios/50/shirt.png', description: 'T-shirts, button-downs, and formal tops' },
      { code: 'TRSR', name: 'Trousers', iconUrl: 'https://img.icons8.com/ios/50/trousers.png', description: 'Pants, jeans, and formal trousers' },
      { code: 'FTWR', name: 'Footwear', iconUrl: 'https://img.icons8.com/ios/50/shoes.png', description: 'Shoes, boots, sandals, and sneakers' },
      { code: 'OTWR', name: 'Outerwear', iconUrl: 'https://img.icons8.com/ios/50/outerwear.png', description: 'Coats, jackets, and heavy weather gear' },
      { code: 'ACCS', name: 'Accessories', iconUrl: 'https://img.icons8.com/external-victoruler-outline-victoruler/64/external-accessories-clothes-and-outfit-victoruler-outline-victoruler.png', description: 'Belts, hats, scarves, and jewelry' }
    ]
  },
  {
    code: 'FDBV',
    name: 'Food & Beverage',
    iconUrl: 'https://img.icons8.com/ios/50/food.png',
    description: 'Dry, canned, and packaged food products',
    handlingFlags: ['PERISHABLE'],
    children: [
      { code: 'DRYG', name: 'Dry Goods', iconUrl: 'https://img.icons8.com/ios/50/pantry--v2.png', description: 'Rice, pasta, flour, and other pantry staples' },
      { code: 'CANG', name: 'Canned Goods', iconUrl: 'https://img.icons8.com/ios/50/can-soup.png', description: 'Preserved vegetables, soups, and canned meats' },
      { code: 'BVRG', name: 'Beverages', iconUrl: 'https://img.icons8.com/ios/50/bottle-of-water.png', description: 'Water, juices, sodas, and other drinks' },
      { code: 'SNCK', name: 'Snacks', iconUrl: 'https://img.icons8.com/ios/50/potato-chips.png', description: 'Chips, nuts, pretzels, and crackers' },
      { code: 'CNDM', name: 'Condiments', iconUrl: 'https://img.icons8.com/ios/50/dressing.png', description: 'Sauces, dressings, spices, and spreads' }
    ]
  },
  {
    code: 'PHRM',
    name: 'Pharmaceuticals',
    iconUrl: 'https://img.icons8.com/ios/50/hospital.png',
    description: 'Prescription and over-the-counter medicinal products',
    handlingFlags: ['PERISHABLE'],
    children: [
      { code: 'VTMN', name: 'Vitamins', iconUrl: 'https://img.icons8.com/external-outline-andi-nur-abdillah/64/external-Vitamin-nutrition-(outline)-outline-andi-nur-abdillah.png', description: 'Essential daily vitamins and minerals' },
      { code: 'ANTB', name: 'Antibiotics', handlingFlags: ['PERISHABLE'], iconUrl: 'https://img.icons8.com/external-others-iconmarket/64/external-antibiotic-vaccination-others-iconmarket-3.png', description: 'Medications used to treat bacterial infections' },
      { code: 'ANLG', name: 'Analgesics', iconUrl: 'https://img.icons8.com/external-those-icons-lineal-those-icons/24/external-Painkiller-emergency-those-icons-lineal-those-icons.png', description: 'Pain relief and fever-reducing medications' },
      { code: 'TPCL', name: 'Topicals', iconUrl: 'https://img.icons8.com/external-others-cattaleeya-thongsriphong/64/external-Cream-pharmacy-outline-others-cattaleeya-thongsriphong.png', description: 'Medicated creams, ointments, and gels' },
      { code: 'SPPL', name: 'Supplements', iconUrl: 'https://img.icons8.com/external-icongeek26-outline-icongeek26/64/external-supplements-healthy-lifestyle-icongeek26-outline-icongeek26.png', description: 'Dietary aids and health-boosting supplements' }
    ]
  },
  {
    code: 'FURN',
    name: 'Furniture',
    iconUrl: 'https://img.icons8.com/ios/50/furniture.png',
    description: 'Office and domestic furniture items',
    handlingFlags: ['FRAGILE'],
    children: [
      { code: 'CHRS', name: 'Chairs', iconUrl: 'https://img.icons8.com/ios/50/chair.png', description: 'Office chairs, stools, and dining seating' },
      { code: 'DESK', name: 'Desks', iconUrl: 'https://img.icons8.com/ios/50/desk.png', description: 'Workstations, computer desks, and writing tables' },
      { code: 'SHLV', name: 'Shelving', iconUrl: 'https://img.icons8.com/ios/50/rack.png', description: 'Bookshelves, storage racks, and wall mounts' },
      { code: 'CBNT', name: 'Cabinets', iconUrl: 'https://img.icons8.com/ios/50/cabinet-light.png', description: 'Storage cupboards and filing cabinets' },
      { code: 'TABL', name: 'Tables', iconUrl: 'https://img.icons8.com/ios/50/table.png', description: 'Dining tables, coffee tables, and end tables' }
    ]
  }
]

// ---------------------------------------------------------------------------
// Seed function
// ---------------------------------------------------------------------------

/**
 * seedCategories.
 * @param prisma - Parameter for seedCategories.
 * @returns Result from seedCategories.
 */
export async function seedCategories(prisma: PrismaClient): Promise<{ parentCount: number, childCount: number }> {

  let parentCount = 0
  let childCount = 0

  for (const cat of categories) {
    // Upsert parent
    await prisma.itemCategory.upsert({
      where: { code: cat.code },
      update: {
        name: cat.name,
        description: cat.description,
        iconUrl: cat.iconUrl ?? null,
        hasChildren: true,
        handlingFlags: cat.handlingFlags ?? []
      },
      create: {
        code: cat.code,
        name: cat.name,
        description: cat.description,
        iconUrl: cat.iconUrl ?? null,
        hasChildren: true,
        parentCode: null,
        handlingFlags: cat.handlingFlags ?? []
      }
    })
    parentCount++

    // Upsert children
    for (const child of cat.children) {
      await prisma.itemCategory.upsert({
        where: { code: child.code },
        update: {
          name: child.name,
          description: child.description ?? null,
          iconUrl: child.iconUrl ?? null,
          parentCode: cat.code,
          handlingFlags: child.handlingFlags ?? []
        },
        create: {
          code: child.code,
          name: child.name,
          description: child.description ?? null,
          iconUrl: child.iconUrl ?? null,
          hasChildren: false,
          parentCode: cat.code,
          handlingFlags: child.handlingFlags ?? []
        }
      })
      childCount++
    }
  }

  return { parentCount, childCount }
}
