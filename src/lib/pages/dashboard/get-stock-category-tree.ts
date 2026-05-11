import type { PrismaClient } from '@/generated/prisma'

import type { StockCategoryTreeDTO, StockCategoryTreeNodeDto } from '@/types/stock-category-tree.types'

export async function getStockCategoryTree(prisma: PrismaClient): Promise<StockCategoryTreeDTO> {
  const stockedCategories = await prisma.item.findMany({
    where: { deletedAt: null, categoryId: { not: null } },
    distinct: ['categoryId'],
    select: { categoryId: true }
  })

  const codesWithItems = new Set<string>(
    stockedCategories
      .map((row) => row.categoryId)
      .filter((c): c is string => c !== null && c !== '')
  )

  if (codesWithItems.size === 0) {
    return { parents: [], childrenByParentCode: {} }
  }

  const rows = await prisma.itemCategory.findMany({
    select: {
      code: true,
      name: true,
      parentCode: true,
      iconUrl: true
    },
    orderBy: { name: 'asc' }
  })

  const childrenByParentCode: Record<string, StockCategoryTreeNodeDto[]> = {}

  for (const r of rows) {
    if (r.parentCode === null) {
      continue
    }

    if (!codesWithItems.has(r.code)) {
      continue
    }

    const list = childrenByParentCode[r.parentCode] ?? []
    list.push({ code: r.code, name: r.name, iconUrl: r.iconUrl ?? null })
    childrenByParentCode[r.parentCode] = list
  }

  for (const key of Object.keys(childrenByParentCode)) {
    childrenByParentCode[key] = childrenByParentCode[key].slice().sort((a, b) => a.name.localeCompare(b.name))
  }

  const parents = rows
    .filter((r) => r.parentCode === null)
    .filter(
      (r) => codesWithItems.has(r.code) || (childrenByParentCode[r.code]?.length ?? 0) > 0
    )
    .map((r) => ({ code: r.code, name: r.name, iconUrl: r.iconUrl ?? null }))
    .sort((a, b) => a.name.localeCompare(b.name))

  const parentCodes = new Set(parents.map((p) => p.code))
  const prunedChildren: Record<string, StockCategoryTreeNodeDto[]> = {}

  for (const [parentCode, list] of Object.entries(childrenByParentCode)) {
    if (parentCodes.has(parentCode)) {
      prunedChildren[parentCode] = list
    }
  }

  return { parents, childrenByParentCode: prunedChildren }
}
