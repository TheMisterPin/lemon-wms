import { NextRequest } from 'next/server'
import { beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('@/lib/auth/middleware', () => ({
  verifyAccessTokenFromRequest: vi.fn()
}))

vi.mock('@/lib/entities/business-parties', () => ({
  getItemsForVendor: vi.fn()
}))

vi.mock('@/lib/prisma', () => ({
  default: {}
}))

import { GET } from '@/app/api/dashboard/business-parties/[id]/route'
import { verifyAccessTokenFromRequest } from '@/lib/auth/middleware'
import { getItemsForVendor } from '@/lib/parties/business-parties'

const mockAuth = verifyAccessTokenFromRequest as ReturnType<typeof vi.fn>
const mockGetItems = getItemsForVendor as ReturnType<typeof vi.fn>

function makeReq(idInPath: string) {
  return new NextRequest(`http://localhost/api/dashboard/business-parties/${idInPath}`)
}

describe('GET /api/dashboard/business-parties/[id]', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns 401 when not authenticated', async () => {
    mockAuth.mockReturnValue(null)
    const res = await GET(makeReq('SUP-0001'), {
      params: Promise.resolve({ id: 'SUP-0001' })
    })

    expect(res.status).toBe(401)
    expect(mockGetItems).not.toHaveBeenCalled()
  })

  it('returns 400 for blank id', async () => {
    mockAuth.mockReturnValue({ userId: 'u1', role: 'OWNER' })
    const res = await GET(makeReq('x'), {
      params: Promise.resolve({ id: '   ' })
    })

    expect(res.status).toBe(400)
    expect(mockGetItems).not.toHaveBeenCalled()
  })

  it('returns 404 when supplier not found', async () => {
    mockAuth.mockReturnValue({ userId: 'u1', role: 'OWNER' })
    mockGetItems.mockResolvedValue(null)
    const res = await GET(makeReq('SUP-9999'), {
      params: Promise.resolve({ id: 'SUP-9999' })
    })
    const body = await res.json()

    expect(res.status).toBe(404)
    expect(body.success).toBe(false)
    expect(mockGetItems).toHaveBeenCalledWith(expect.anything(), 'SUP-9999')
  })

  it('returns 200 with empty items array', async () => {
    mockAuth.mockReturnValue({ userId: 'u1', role: 'OWNER' })
    mockGetItems.mockResolvedValue([])
    const res = await GET(makeReq('SUP-0001'), {
      params: Promise.resolve({ id: 'SUP-0001' })
    })
    const body = await res.json()

    expect(res.status).toBe(200)
    expect(body.success).toBe(true)
    expect(body.data).toEqual([])
  })

  it('returns 200 with supplier items', async () => {
    mockAuth.mockReturnValue({ userId: 'u1', role: 'OWNER' })
    mockGetItems.mockResolvedValue([
      { id: 'ITEM-A', sku: 'A', name: 'Item A', uom: 'EA' }
    ])
    const res = await GET(makeReq('SUP-0001'), {
      params: Promise.resolve({ id: 'SUP-0001' })
    })
    const body = await res.json()

    expect(res.status).toBe(200)
    expect(body.data).toEqual([{ id: 'ITEM-A', sku: 'A', name: 'Item A', uom: 'EA' }])
  })
})
