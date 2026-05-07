import type { PrismaClient } from '@/generated/prisma'

import { DomainError } from '@/lib/errors'
import type {
  CategoryStockCard,
  CategoryStockDashboardDTO,
  LowStockItemRow,
  StockItemSummaryRow,
  SubcategoryStockGroup
} from '@/types/category-stock-dashboard.types'

type CategoryAccumulator = {
  categoryId: string
  name: string
  totalOnHand: number
  available: number
  reserved: number
  blocked: number
}

type ItemAccumulator = {
  itemId: string
  sku: string
  name: string
  categoryId: string
  categoryName: string
  quantity: number
  available: number
  reserved: number
  blocked: number
  minQuantity: number
}

export async function getCategoryStockDashboardData(
  prisma: PrismaClient,
  selectedCategoryId?: string
): Promise<CategoryStockDashboardDTO> {
  const rows = await prisma.binStockItem.findMany({
    where: selectedCategoryId
      ? {
        item: {
          OR: [
            { categoryId: selectedCategoryId },
            { category: { parentCode: selectedCategoryId } }
          ]
        }
      }
      : undefined,
    select: {
      itemId: true,
      quantityAvailable: true,
      quantityReserved: true,
      quantityBlocked: true,
      bin: { select: { warehouse: { select: { name: true } } } },
      item: {
        select: {
          sku: true,
          name: true,
          minQuantity: true,
          categoryId: true,
          category: {
            select: {
              code: true,
              name: true,
              parentCode: true,
              parent: { select: { code: true, name: true } }
            }
          }
        }
      }
    }
  })

  if (selectedCategoryId) {
    const category = await prisma.itemCategory.findUnique({
      where: { code: selectedCategoryId },
      select: { code: true }
    })

    if (!category) {
      throw new DomainError('Category not found.', 'NOT_FOUND', 404)
    }
  }

  const byParentCategory = new Map<string, CategoryAccumulator>()
  const bySubcategory = new Map<string, Map<string, CategoryAccumulator>>()
  const byItem = new Map<string, ItemAccumulator>()
  const lowStockByItem = new Map<string, LowStockItemRow>()

  for (const row of rows) {
    const available = row.quantityAvailable.toNumber()
    const reserved = row.quantityReserved.toNumber()
    const blocked = row.quantityBlocked.toNumber()
    const quantity = available + reserved + blocked

    const categoryCode = row.item.category?.code ?? '__uncategorized__'
    const categoryName = row.item.category?.name ?? 'Uncategorized'
    const parentCode = row.item.category?.parent?.code ?? categoryCode
    const parentName = row.item.category?.parent?.name ?? categoryName

    const parent = byParentCategory.get(parentCode) ?? {
      categoryId: parentCode,
      name: parentName,
      totalOnHand: 0,
      available: 0,
      reserved: 0,
      blocked: 0
    }
    parent.totalOnHand += quantity
    parent.available += available
    parent.reserved += reserved
    parent.blocked += blocked
    byParentCategory.set(parentCode, parent)

    const subMap = bySubcategory.get(parentCode) ?? new Map<string, CategoryAccumulator>()
    const sub = subMap.get(categoryCode) ?? {
      categoryId: categoryCode,
      name: categoryName,
      totalOnHand: 0,
      available: 0,
      reserved: 0,
      blocked: 0
    }
    sub.totalOnHand += quantity
    sub.available += available
    sub.reserved += reserved
    sub.blocked += blocked
    subMap.set(categoryCode, sub)
    bySubcategory.set(parentCode, subMap)

    const item = byItem.get(row.itemId) ?? {
      itemId: row.itemId,
      sku: row.item.sku,
      name: row.item.name,
      categoryId: categoryCode,
      categoryName,
      quantity: 0,
      available: 0,
      reserved: 0,
      blocked: 0,
      minQuantity: row.item.minQuantity.toNumber()
    }

    item.quantity += quantity
    item.available += available
    item.reserved += reserved
    item.blocked += blocked
    byItem.set(row.itemId, item)

    const shortage = Math.max(0, item.minQuantity - item.available)
    if (shortage > 0) {
      lowStockByItem.set(row.itemId, {
        itemId: row.itemId,
        sku: item.sku,
        name: item.name,
        available: Math.round(item.available),
        minimumExpected: Math.round(item.minQuantity),
        shortage: Math.round(shortage),
        warehouseName: row.bin.warehouse.name,
        href: `/dashboard/stock/items/${row.itemId}`
      })
    }
  }

  const categoryCards: CategoryStockCard[] = [...byParentCategory.values()]
    .map((category) => ({
      categoryId: category.categoryId,
      name: category.name,
      totalOnHand: Math.round(category.totalOnHand),
      available: Math.round(category.available),
      reserved: Math.round(category.reserved),
      blocked: Math.round(category.blocked),
      href: `/dashboard/stock/categories/${category.categoryId}`
    }))
    .sort((a, b) => b.totalOnHand - a.totalOnHand)

  const subcategoryGroups: SubcategoryStockGroup[] = categoryCards.map((category) => {
    const rows = [...(bySubcategory.get(category.categoryId)?.values() ?? [])]
      .map((sub) => ({
        categoryId: sub.categoryId,
        name: sub.name,
        onHand: Math.round(sub.totalOnHand),
        available: Math.round(sub.available),
        reserved: Math.round(sub.reserved),
        blocked: Math.round(sub.blocked),
        href: `/dashboard/stock/categories/${sub.categoryId}`
      }))
      .sort((a, b) => b.onHand - a.onHand)

    return {
      parentCategoryId: category.categoryId,
      parentCategoryName: category.name,
      rows
    }
  })

  const items: StockItemSummaryRow[] = [...byItem.values()]
    .map((item) => ({
      itemId: item.itemId,
      sku: item.sku,
      name: item.name,
      categoryName: item.categoryName,
      quantity: Math.round(item.quantity),
      available: Math.round(item.available),
      reserved: Math.round(item.reserved),
      blocked: Math.round(item.blocked),
      href: `/dashboard/stock/items/${item.itemId}`
    }))
    .sort((a, b) => b.quantity - a.quantity)

  const categoryDistribution = categoryCards.map((category) => ({
    categoryId: category.categoryId,
    categoryName: category.name,
    totalOnHand: category.totalOnHand,
    href: category.href
  }))

  const statusBreakdown = categoryCards.map((category) => ({
    label: category.name,
    available: category.available,
    reserved: category.reserved,
    blocked: category.blocked
  }))

  const lowStockItems = [...lowStockByItem.values()]
    .sort((a, b) => b.shortage - a.shortage)
    .slice(0, 20)

  return {
    header: {
      title: selectedCategoryId ? `Category: ${selectedCategoryId}` : 'Category Stock Overview',
      subtitle: selectedCategoryId
        ? 'Filtered category and subcategory stock distribution'
        : 'Stock by parent category and subcategory'
    },
    categoryCards,
    categoryDistribution,
    statusBreakdown,
    subcategoryGroups,
    lowStockItems,
    items
  }
}
