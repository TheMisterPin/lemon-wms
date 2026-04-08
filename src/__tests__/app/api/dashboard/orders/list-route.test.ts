import { NextRequest } from 'next/server'
import { beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('@/lib/auth/middleware', () => ({
  verifyAccessTokenFromRequest: vi.fn(),
  isOfficeRole: vi.fn()
}))

vi.mock('@/lib/orders/purchase', () => ({
  getDashboardPurchaseOrders: vi.fn()
}))

vi.mock('@/lib/prisma', () => ({
  default: {}
}))

import { GET } from '@/app/api/dashboard/orders/[orderType]/route'
import { verifyAccessTokenFromRequest, isOfficeRole } from '@/lib/auth/middleware'
import { getDashboardPurchaseOrders } from '@/lib/orders/purchase'

const mockAuth = verifyAccessTokenFromRequest as ReturnType<typeof vi.fn>
const mockOffice = isOfficeRole as ReturnType<typeof vi.fn>
const mockList = getDashboardPurchaseOrders as ReturnType<typeof vi.fn>

describe('GET /api/dashboard/orders/[orderType]', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns 401 when not authenticated', async () => {
    mockAuth.mockReturnValue(null)
    const req = new NextRequest('http://localhost/api/dashboard/orders/purchase')
    const res = await GET(req, { params: Promise.resolve({ orderType: 'purchase' }) })
    expect(res.status).toBe(401)
    expect(mockList).not.toHaveBeenCalled()
  })

  it('returns 403 when not office role', async () => {
    mockAuth.mockReturnValue({ userId: 'u1', role: 'WAREHOUSE_WORKER' })
    mockOffice.mockReturnValue(false)
    const req = new NextRequest('http://localhost/api/dashboard/orders/purchase')
    const res = await GET(req, { params: Promise.resolve({ orderType: 'purchase' }) })
    expect(res.status).toBe(403)
    expect(mockList).not.toHaveBeenCalled()
  })

  it('returns 400 for unsupported orderType', async () => {
    mockAuth.mockReturnValue({ userId: 'u1', role: 'OWNER' })
    mockOffice.mockReturnValue(true)
    const req = new NextRequest('http://localhost/api/dashboard/orders/sales')
    const res = await GET(req, { params: Promise.resolve({ orderType: 'sales' }) })
    expect(res.status).toBe(400)
    expect(mockList).not.toHaveBeenCalled()
  })

  it('returns 200 with list', async () => {
    mockAuth.mockReturnValue({ userId: 'u1', role: 'OWNER' })
    mockOffice.mockReturnValue(true)
    mockList.mockResolvedValue([
      {
        id: 'po-1',
        reference: 'R1',
        status: 'DRAFT',
        supplier: 'Acme',
        warehouseId: 'wh-1',
        createdAt: new Date(),
        businessPartyId: 'bp-1'
      }
    ])
    const req = new NextRequest('http://localhost/api/dashboard/orders/purchase')
    const res = await GET(req, { params: Promise.resolve({ orderType: 'purchase' }) })
    const body = await res.json()
    expect(res.status).toBe(200)
    expect(body.success).toBe(true)
    expect(body.data).toHaveLength(1)
    expect(mockList).toHaveBeenCalled()
  })
})
