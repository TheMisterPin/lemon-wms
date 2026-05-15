import { NextRequest } from 'next/server'
import { beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('@/lib/auth/middleware', () => ({
  verifyAccessTokenFromRequest: vi.fn(),
  isFloorRole: vi.fn()
}))

vi.mock('@/lib/orders/purchase', () => ({
  getWarehousePurchaseOrders: vi.fn()
}))

vi.mock('@/lib/orders/sales/get-warehouse-sales-orders', () => ({
  getWarehouseSalesOrders: vi.fn()
}))

vi.mock('@/lib/orders/transfer/get-warehouse-transfer-orders', () => ({
  getWarehouseTransferOrders: vi.fn()
}))

vi.mock('@/lib/prisma', () => ({
  default: {}
}))

import { GET } from '@/app/api/warehouse/orders/[orderType]/route'
import { verifyAccessTokenFromRequest, isFloorRole } from '@/lib/auth/middleware'
import { getWarehousePurchaseOrders } from '@/lib/orders/purchase'
import { getWarehouseSalesOrders } from '@/lib/orders/sales/get-warehouse-sales-orders'
import { getWarehouseTransferOrders } from '@/lib/orders/transfer/get-warehouse-transfer-orders'

const mockAuth = verifyAccessTokenFromRequest as ReturnType<typeof vi.fn>
const mockFloor = isFloorRole as ReturnType<typeof vi.fn>
const mockPurchaseList = getWarehousePurchaseOrders as ReturnType<typeof vi.fn>
const mockSalesList = getWarehouseSalesOrders as ReturnType<typeof vi.fn>
const mockTransferList = getWarehouseTransferOrders as ReturnType<typeof vi.fn>

describe('GET /api/warehouse/orders/[orderType]', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns 401 when not authenticated', async () => {
    mockAuth.mockReturnValue(null)
    const req = new NextRequest('http://localhost/api/warehouse/orders/purchase')
    const res = await GET(req, { params: Promise.resolve({ orderType: 'purchase' }) })
    expect(res.status).toBe(401)
    expect(mockPurchaseList).not.toHaveBeenCalled()
  })

  it('returns 403 when not floor role', async () => {
    mockAuth.mockReturnValue({ userId: 'u1', role: 'OWNER' })
    mockFloor.mockReturnValue(false)
    const req = new NextRequest('http://localhost/api/warehouse/orders/purchase')
    const res = await GET(req, { params: Promise.resolve({ orderType: 'purchase' }) })
    expect(res.status).toBe(403)
    expect(mockPurchaseList).not.toHaveBeenCalled()
  })

  it('returns 400 when warehouseId missing on token', async () => {
    mockAuth.mockReturnValue({ userId: 'u1', role: 'WAREHOUSE_WORKER' })
    mockFloor.mockReturnValue(true)
    const req = new NextRequest('http://localhost/api/warehouse/orders/purchase')
    const res = await GET(req, { params: Promise.resolve({ orderType: 'purchase' }) })
    expect(res.status).toBe(400)
    expect(mockPurchaseList).not.toHaveBeenCalled()
  })

  it('returns 400 for unsupported orderType', async () => {
    mockAuth.mockReturnValue({
      userId: 'u1',
      role: 'WAREHOUSE_WORKER',
      warehouseId: 'wh-1'
    })
    mockFloor.mockReturnValue(true)
    const req = new NextRequest('http://localhost/api/warehouse/orders/foo')
    const res = await GET(req, { params: Promise.resolve({ orderType: 'foo' }) })
    expect(res.status).toBe(400)
    expect(mockPurchaseList).not.toHaveBeenCalled()
    expect(mockSalesList).not.toHaveBeenCalled()
    expect(mockTransferList).not.toHaveBeenCalled()
  })

  it('returns 200 for purchase and passes warehouseId to domain', async () => {
    mockAuth.mockReturnValue({
      userId: 'u1',
      role: 'WAREHOUSE_WORKER',
      warehouseId: 'wh-1'
    })
    mockFloor.mockReturnValue(true)
    mockPurchaseList.mockResolvedValue([])
    const req = new NextRequest('http://localhost/api/warehouse/orders/purchase')
    const res = await GET(req, { params: Promise.resolve({ orderType: 'purchase' }) })
    expect(res.status).toBe(200)
    expect(mockPurchaseList).toHaveBeenCalledWith(expect.anything(), 'wh-1')
    expect(mockSalesList).not.toHaveBeenCalled()
    expect(mockTransferList).not.toHaveBeenCalled()
  })

  it('returns 200 for sales and passes warehouseId to domain', async () => {
    mockAuth.mockReturnValue({
      userId: 'u1',
      role: 'WAREHOUSE_WORKER',
      warehouseId: 'wh-1'
    })
    mockFloor.mockReturnValue(true)
    mockSalesList.mockResolvedValue([])
    const req = new NextRequest('http://localhost/api/warehouse/orders/sales')
    const res = await GET(req, { params: Promise.resolve({ orderType: 'sales' }) })
    expect(res.status).toBe(200)
    expect(mockSalesList).toHaveBeenCalledWith(expect.anything(), 'wh-1')
    expect(mockPurchaseList).not.toHaveBeenCalled()
    expect(mockTransferList).not.toHaveBeenCalled()
  })

  it('returns 200 for transfer and passes warehouseId to domain', async () => {
    mockAuth.mockReturnValue({
      userId: 'u1',
      role: 'WAREHOUSE_WORKER',
      warehouseId: 'wh-1'
    })
    mockFloor.mockReturnValue(true)
    mockTransferList.mockResolvedValue([])
    const req = new NextRequest('http://localhost/api/warehouse/orders/transfer')
    const res = await GET(req, { params: Promise.resolve({ orderType: 'transfer' }) })
    expect(res.status).toBe(200)
    expect(mockTransferList).toHaveBeenCalledWith(expect.anything(), 'wh-1')
    expect(mockPurchaseList).not.toHaveBeenCalled()
    expect(mockSalesList).not.toHaveBeenCalled()
  })
})
