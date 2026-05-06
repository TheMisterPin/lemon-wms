import type { PrismaClient } from '@/generated/prisma'

type CategoryOverviewDTO = {
  parent: string
  totalItemCount: number
  categories: { name: string; itemCount: number }[]
}
type CategoryStockOverviewDTO = {
  parent: string
  totalOnHand: number
  totalAvailable: number
  totalReserved: number
  totalBlocked: number
  categories: {
    name: string
    totalOnHand: number
    totalAvailable: number
    totalReserved: number
    totalBlocked: number
  }[]
}

async function getCategories(prisma: PrismaClient) {
  return prisma.itemCategory.findMany()
}

async function getCategoriesTree(prisma: PrismaClient) {
  const tree = await prisma.itemCategory.findMany({
    select: {
      id: true,
      code: true,
      name: true,
      description: true,
      children: {
        select: {
          id: true,
          code: true,
          name: true,
          description: true
        }
      }
    }
  })

  return tree.map(category => ({
    ...category,
    children: category.children?.map(child => ({ ...child })) ?? []
  }))
}

async function getCategory(prisma: PrismaClient, id: string) {
  return prisma.itemCategory.findUnique({ where: { id } })
}

async function getCategoryByCode(prisma: PrismaClient, code: string) {
  return prisma.itemCategory.findUnique({ where: { code } })
}

async function getBasicCategoryInfo(prisma: PrismaClient, id: string) {
  return prisma.itemCategory.findFirst({ where: { id },
    select: {
      id: true,
      code: true,
      name: true
    }
  })
}

async function getItemsByCategory(prisma: PrismaClient, id: string) {
  return prisma.item.findMany({
    where: { categoryId: id },
    select: {
      id: true,
      name: true
    }
  })
}

/**
 * Retrieves an overview of item categories grouped by their parent category.
 *
 * Only categories that contain at least one item are included.
 * Each parent group contains its child categories along with individual item counts,
 * and a total aggregated item count across all its children.
 *
 * @param {PrismaClient} prisma - Prisma client instance used to query the database.
 *
 * @returns {Promise<Array<CategoryOverviewDTO>>}
 *
 * @example
 * [
 *   {
 *     parent: "Pharmaceuticals",
 *     totalItemCount: 50,
 *     categories: [
 *       { name: "Vitamins", itemCount: 10 },
 *       { name: "Antibiotics", itemCount: 10 }
 *     ]
 *   }
 * ]
 *
 * @remarks
 * - Uses Prisma relation filter `items.some` to exclude empty categories at DB level.
 * - Uses `_count` to efficiently count related items without loading them.
 * - Grouping and aggregation are performed in-memory for simplicity and flexibility.
 */
const DEFAULT_PARENT = 'Uncategorized'

async function getCategoriesOverview(
  prisma: PrismaClient
): Promise<CategoryOverviewDTO[]> {
  const result = await prisma.itemCategory.findMany({
    where: {
      items: { some: {} }
    },
    select: {
      name: true,
      parent: { select: { name: true } },
      _count: { select: { items: true } }
    }
  })

  const grouped = new Map<string, CategoryOverviewDTO>()

  for (const category of result) {
    const parentName = category.parent?.name ?? DEFAULT_PARENT
    const itemCount = category._count.items

    let group = grouped.get(parentName)

    if (!group) {
      group = {
        parent: parentName,
        totalItemCount: 0,
        categories: []
      }
      grouped.set(parentName, group)
    }

    group.categories.push({
      name: category.name,
      itemCount
    })

    group.totalItemCount += itemCount
  }

  return Array.from(grouped.values())
}

/**
 * Retrieves a stock overview grouped by parent category.
 *
 * Only categories containing at least one item with stock records are included.
 * Stock totals are calculated from each item's related binStockItems.
 *
 * @param {PrismaClient} prisma - Prisma client instance used to query the database.
 *
 * @returns {Promise<CategoryStockOverviewDTO[]>}
 */
async function getCategoryStockOverview(
  prisma: PrismaClient
): Promise<CategoryStockOverviewDTO[]> {
  const result = await prisma.itemCategory.findMany({
    where: {
      items: {
        some: {
          binStockItems: {
            some: {}
          }
        }
      }
    },
    select: {
      name: true,
      parent: {
        select: {
          name: true
        }
      },
      items: {
        select: {
          binStockItems: {
            select: {
              quantityAvailable: true,
              quantityReserved: true,
              quantityBlocked: true
            }
          }
        }
      }
    }
  })

  const grouped = new Map<string, CategoryStockOverviewDTO>()

  for (const category of result) {
    let categoryAvailable = 0
    let categoryReserved = 0
    let categoryBlocked = 0

    for (const item of category.items) {
      for (const stock of item.binStockItems) {
        categoryAvailable += stock.quantityAvailable.toNumber()
        categoryReserved += stock.quantityReserved.toNumber()
        categoryBlocked += stock.quantityBlocked.toNumber()
      }
    }

    const categoryOnHand =
      categoryAvailable + categoryReserved + categoryBlocked

    const parentName = category.parent?.name ?? DEFAULT_PARENT

    let group = grouped.get(parentName)

    if (!group) {
      group = {
        parent: parentName,
        totalOnHand: 0,
        totalAvailable: 0,
        totalReserved: 0,
        totalBlocked: 0,
        categories: []
      }
      grouped.set(parentName, group)
    }

    group.categories.push({
      name: category.name,
      totalOnHand: categoryOnHand,
      totalAvailable: categoryAvailable,
      totalReserved: categoryReserved,
      totalBlocked: categoryBlocked
    })

    group.totalOnHand += categoryOnHand
    group.totalAvailable += categoryAvailable
    group.totalReserved += categoryReserved
    group.totalBlocked += categoryBlocked
  }

  return Array.from(grouped.values())
}

export { getCategoryStockOverview, getCategoriesOverview, getBasicCategoryInfo, getCategory, getCategoryByCode, getItemsByCategory, getCategories }
