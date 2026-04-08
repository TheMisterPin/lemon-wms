import { describe, expect, it, vi } from 'vitest'
import type { PrismaClient } from '@/generated/prisma'
import { BusinessPartyType } from '@/generated/prisma'
import { getAllVendors } from '@/lib/entities/business-parties/get-all-vendors'

describe('getAllVendors', () => {
  it('queries active suppliers ordered by name', async () => {
    const findMany = vi.fn().mockResolvedValue([
      { id: 'SUP-0001', name: 'Alpha Co' },
      { id: 'SUP-0002', name: 'Beta Inc' }
    ])
    const prisma = { businessParty: { findMany } } as unknown as PrismaClient

    const result = await getAllVendors(prisma)

    expect(findMany).toHaveBeenCalledWith({
      where: {
        type: BusinessPartyType.SUPPLIER,
        isActive: true
      },
      select: { id: true, name: true },
      orderBy: { name: 'asc' }
    })
    expect(result).toEqual([
      { id: 'SUP-0001', name: 'Alpha Co' },
      { id: 'SUP-0002', name: 'Beta Inc' }
    ])
  })
})
