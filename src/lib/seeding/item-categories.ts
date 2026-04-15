// prisma/seed/categories.ts
// 50 parent categories × 5 subcategories = 250 subcategories + 50 parents = 300 total records
// Run via: prisma.$transaction([...upserts]) inside your main seed function

import { type PrismaClient } from '@/generated/prisma'

// ---------------------------------------------------------------------------
// Data definition
// ---------------------------------------------------------------------------

interface SubCategory {
  code: string;
  name: string;
  handlingFlags?: string[];
}

interface ParentCategory {
  code: string;
  name: string;
  description: string;
  handlingFlags?: string[];
  children: SubCategory[];
}

const categories: ParentCategory[] = [
  {
    code: 'ELEC',
    name: 'Electronics',
    description: 'Consumer and industrial electronic devices and components',
    handlingFlags: ['FRAGILE'],
    children: [
      { code: 'KBDS', name: 'Keyboards' },
      { code: 'MNTR', name: 'Monitors', handlingFlags: ['FRAGILE'] },
      { code: 'CABL', name: 'Cables' },
      { code: 'BATT', name: 'Batteries' },
      { code: 'ADPT', name: 'Adapters' }
    ]
  },
  {
    code: 'APRL',
    name: 'Apparel',
    description: 'Clothing, footwear, and fashion accessories',
    children: [
      { code: 'SHRT', name: 'Shirts' },
      { code: 'TRSR', name: 'Trousers' },
      { code: 'FTWR', name: 'Footwear' },
      { code: 'OTWR', name: 'Outerwear' },
      { code: 'ACCS', name: 'Accessories' }
    ]
  },
  {
    code: 'FDBV',
    name: 'Food & Beverage',
    description: 'Dry, canned, and packaged food products',
    handlingFlags: ['PERISHABLE'],
    children: [
      { code: 'DRYG', name: 'Dry Goods' },
      { code: 'CANG', name: 'Canned Goods' },
      { code: 'BVRG', name: 'Beverages' },
      { code: 'SNCK', name: 'Snacks' },
      { code: 'CNDM', name: 'Condiments' }
    ]
  },
  {
    code: 'PHRM',
    name: 'Pharmaceuticals',
    description: 'Prescription and over-the-counter medicinal products',
    handlingFlags: ['PERISHABLE'],
    children: [
      { code: 'VTMN', name: 'Vitamins' },
      { code: 'ANTB', name: 'Antibiotics', handlingFlags: ['PERISHABLE'] },
      { code: 'ANLG', name: 'Analgesics' },
      { code: 'TPCL', name: 'Topicals' },
      { code: 'SPPL', name: 'Supplements' }
    ]
  },
  {
    code: 'FURN',
    name: 'Furniture',
    description: 'Office and domestic furniture items',
    handlingFlags: ['FRAGILE'],
    children: [
      { code: 'CHRS', name: 'Chairs' },
      { code: 'DESK', name: 'Desks' },
      { code: 'SHLV', name: 'Shelving' },
      { code: 'CBNT', name: 'Cabinets' },
      { code: 'TABL', name: 'Tables' }
    ]
  },
  {
    code: 'BVCL',
    name: 'Beverages Cold',
    description: 'Refrigerated and cold-chain beverages',
    handlingFlags: ['COLD', 'PERISHABLE'],
    children: [
      { code: 'JUIC', name: 'Juices', handlingFlags: ['COLD', 'PERISHABLE'] },
      { code: 'DARY', name: 'Dairy Drinks', handlingFlags: ['COLD', 'PERISHABLE'] },
      { code: 'ENRG', name: 'Energy Drinks' },
      { code: 'WATR', name: 'Water' },
      { code: 'SMTH', name: 'Smoothies', handlingFlags: ['COLD', 'PERISHABLE'] }
    ]
  },
  {
    code: 'FRZN',
    name: 'Frozen Foods',
    description: 'Deep-frozen food products requiring cold-chain storage',
    handlingFlags: ['COLD', 'PERISHABLE'],
    children: [
      { code: 'MEAT', name: 'Meat', handlingFlags: ['COLD', 'PERISHABLE'] },
      { code: 'VGTB', name: 'Vegetables', handlingFlags: ['COLD', 'PERISHABLE'] },
      { code: 'RDML', name: 'Ready Meals', handlingFlags: ['COLD', 'PERISHABLE'] },
      { code: 'ICRM', name: 'Ice Cream', handlingFlags: ['COLD', 'PERISHABLE'] },
      { code: 'SFOD', name: 'Seafood', handlingFlags: ['COLD', 'PERISHABLE'] }
    ]
  }
]

// ---------------------------------------------------------------------------
// Seed function
// ---------------------------------------------------------------------------

export async function seedCategories(prisma: PrismaClient): Promise<{ parentCount: number, childCount: number }> {

  let parentCount = 0
  let childCount = 0

  for (const cat of categories) {
    // Upsert parent
    await prisma.itemCategory.upsert({
      where: { code: cat.code },
      update: {},
      create: {
        code: cat.code,
        name: cat.name,
        description: cat.description,
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
        update: {},
        create: {
          code: child.code,
          name: child.name,
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
