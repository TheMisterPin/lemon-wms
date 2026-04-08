import { NextRequest } from 'next/server'
import { beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('@/lib/auth/middleware', () => ({
  verifyAccessTokenFromRequest: vi.fn(),
  isFloorRole: vi.fn()
}))

vi.mock('@/lib/orders/purchase', () => ({
  getWarehousePurchaseOrders: vi.fn()
}))

vi.mock('@/lib/prisma', () => ({
  default: {}
}))

import { GET } from '@/app/api/warehouse/orders/[orderType]/route'
import { verifyAccessTokenFromRequest, isFloorRole } from '@/lib/auth/middleware'
import { getWarehousePurchaseOrders } from '@/lib/orders/purchase'

const mockAuth = verifyAccessTokenFromRequest as ReturnType<typeof vi.fn>
const mockFloor = isFloorRole as ReturnType<typeof vi.fn>
const mockList = getWarehousePurchaseOrders as ReturnType<typeof vi.fn>

describe('GET /api/warehouse/orders/[orderType]', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns 401 when not authenticated', async () => {
    mockAuth.mockReturnValue(null)
    const req = new NextRequest('http://localhost/api/warehouse/orders/purchase')
    const res = await GET(req, { params: Promise.resolve({ orderType: 'purchase' }) })
    expect(res.status).toBe(401)
    expect(mockList).not.toHaveBeenCalled()
  })

  it('returns 403 when not floor role', async () => {
    mockAuth.mockReturnValue({ userId: 'u1', role: 'OWNER' })
    mockFloor.mockReturnValue(false)
    const req = new NextRequest('http://localhost/api/warehouse/orders/purchase')
    const res = await GET(req, { params: Promise.resolve({ orderType: 'purchase' }) })
    expect(res.status).toBe(403)
    expect(mockList).not.toHaveBeenCalled()
  })

  it('returns 400 when warehouseId missing on token', async () => {
    mockAuth.mockReturnValue({ userId: 'u1', role: 'WAREHOUSE_WORKER' })
    mockFloor.mockReturnValue(true)
    const req = new NextRequest('http://localhost/api/warehouse/orders/purchase')
    const res = await GET(req, { params: Promise.resolve({ orderType: 'purchase' }) })
    expect(res.status).toBe(400)
    expect(mockList).not.toHaveBeenCalled()
  })

  it('returns 400 for unsupported orderType', async () => {
    mockAuth.mockReturnValue({
      userId: 'u1',
      role: 'WAREHOUSE_WORKER',
      warehouseId: 'wh-1'
    })
    mockFloor.mockReturnValue(true)
    const req = new NextRequest('http://localhost/api/warehouse/orders/sales')
    const res = await GET(req, { params: Promise.resolve({ orderType: 'sales' }) })
    expect(res.status).toBe(400)
    expect(mockList).not.toHaveBeenCalled()
  })

  it('returns 200 and passes warehouseId to domain', async () => {
    mockAuth.mockReturnValue({
      userId: 'u1',
      role: 'WAREHOUSE_WORKER',
      warehouseId: 'wh-1'
    })
    mockFloor.mockReturnValue(true)
    mockList.mockResolvedValue([])
    const req = new NextRequest('http://localhost/api/warehouse/orders/purchase')
    const res = await GET(req, { params: Promise.resolve({ orderType: 'purchase' }) })
    expect(res.status).toBe(200)
    expect(mockList).toHaveBeenCalledWith(expect.anything(), 'wh-1')
  })
})
