import { describe, expect, it, vi } from 'vitest'
import type { PrismaClient } from '@/generated/prisma'
import { BusinessPartyType } from '@/generated/prisma'
import { getItemsForVendor } from '@/lib/entities/business-parties/get-items-for-vendor'

function makePrisma(overrides: {
  findFirstResult?: { id: string } | null
  findManyResult?: Array<{ sku: string; name: string; uom: string }>
}) {
  const findFirst = vi.fn().mockResolvedValue(overrides.findFirstResult ?? null)
  const findMany = vi.fn().mockResolvedValue(overrides.findManyResult ?? [])

  return {
    prisma: {
      businessParty: { findFirst },
      item: { findMany }
    } as unknown as PrismaClient,
    findFirst,
    findMany
  }
}

describe('getItemsForVendor', () => {
  it('returns null when supplier is missing', async () => {
    const { prisma, findFirst, findMany } = makePrisma({ findFirstResult: null })

    const result = await getItemsForVendor(prisma, 'missing-id')

    expect(result).toBeNull()
    expect(findFirst).toHaveBeenCalledWith({
      where: {
        id: 'missing-id',
        type: BusinessPartyType.SUPPLIER,
        isActive: true
      },
      select: { id: true }
    })
    expect(findMany).not.toHaveBeenCalled()
  })

  it('returns items when supplier exists', async () => {
    const rows = [{ sku: 'SKU-1', name: 'Bolt', uom: 'EA' }]
    const { prisma, findMany } = makePrisma({
      findFirstResult: { id: 'SUP-0001' },
      findManyResult: rows
    })

    const result = await getItemsForVendor(prisma, 'SUP-0001')

    expect(result).toEqual(rows)
    expect(findMany).toHaveBeenCalledWith({
      where: {
        supplierId: 'SUP-0001',
        isActive: true,
        deletedAt: null
      },
      select: { sku: true, name: true, uom: true },
      orderBy: { name: 'asc' }
    })
  })
})
