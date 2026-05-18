import { NextRequest } from 'next/server'
import { beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('@/lib/auth/middleware', () => ({
  verifyAccessTokenFromRequest: vi.fn()
}))

vi.mock('@/lib/pages/dashboard/get-order-detail-dashboard-data', () => ({
  getOrderDetailDashboardData: vi.fn()
}))

vi.mock('@/lib/prisma', () => ({
  default: {}
}))

vi.mock('@/lib/logs/app-logger', () => ({
  logAppError: vi.fn()
}))

import { GET } from '@/app/api/dashboard/orders/[orderType]/[id]/detail/route'
import { verifyAccessTokenFromRequest } from '@/lib/auth/middleware'
import { DomainError } from '@/lib/errors'
import { logAppError } from '@/lib/logs/app-logger'
import { getOrderDetailDashboardData } from '@/lib/pages/dashboard/get-order-detail-dashboard-data'

const mockAuth = verifyAccessTokenFromRequest as ReturnType<typeof vi.fn>
const mockGetOrderDetailDashboardData = getOrderDetailDashboardData as ReturnType<typeof vi.fn>
const mockLogAppError = logAppError as ReturnType<typeof vi.fn>

describe('GET /api/dashboard/orders/[orderType]/[id]/detail', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns 401 when not authenticated', async () => {
    mockAuth.mockReturnValue(null)

    const req = new NextRequest('http://localhost/api/dashboard/orders/purchase/po-1/detail')
    const res = await GET(req, { params: Promise.resolve({ orderType: 'purchase', id: 'po-1' }) })

    expect(res.status).toBe(401)
    expect(mockGetOrderDetailDashboardData).not.toHaveBeenCalled()
  })

  it('returns 200 with order detail payload', async () => {
    mockAuth.mockReturnValue({ userId: 'u1', role: 'OWNER' })
    mockGetOrderDetailDashboardData.mockResolvedValue({
      id: 'po-1',
      reference: 'PO-001',
      status: 'DRAFT',
      lines: [{ id: 'line-1', itemName: 'Bolt' }]
    })

    const req = new NextRequest('http://localhost/api/dashboard/orders/purchase/po-1/detail')
    const res = await GET(req, { params: Promise.resolve({ orderType: 'purchase', id: 'po-1' }) })
    const body = await res.json()

    expect(res.status).toBe(200)
    expect(body.success).toBe(true)
    expect(body.message).toBe('Order detail retrieved successfully.')
    expect(body.data.id).toBe('po-1')
    expect(mockGetOrderDetailDashboardData).toHaveBeenCalledWith(expect.anything(), 'purchase', 'po-1')
  })

  it('returns 404 when order detail service throws NOT_FOUND DomainError', async () => {
    mockAuth.mockReturnValue({ userId: 'u1', role: 'OWNER' })
    mockGetOrderDetailDashboardData.mockRejectedValue(
      new DomainError('purchase order not found', 'NOT_FOUND', 404)
    )

    const req = new NextRequest('http://localhost/api/dashboard/orders/purchase/po-missing/detail')
    const res = await GET(req, {
      params: Promise.resolve({ orderType: 'purchase', id: 'po-missing' })
    })
    const body = await res.json()

    expect(res.status).toBe(404)
    expect(body.success).toBe(false)
    expect(body.message).toBe('Order not found.')
    expect(body.error.code).toBe('NOT_FOUND')
  })

  it('maps non-NOT_FOUND DomainError responses', async () => {
    mockAuth.mockReturnValue({ userId: 'u1', role: 'OWNER' })
    mockGetOrderDetailDashboardData.mockRejectedValue(
      new DomainError('Unsupported order type.', 'VALIDATION_ERROR', 400)
    )

    const req = new NextRequest('http://localhost/api/dashboard/orders/invalid/po-1/detail')
    const res = await GET(req, { params: Promise.resolve({ orderType: 'invalid', id: 'po-1' }) })
    const body = await res.json()

    expect(res.status).toBe(400)
    expect(body.success).toBe(false)
    expect(body.error.code).toBe('VALIDATION_ERROR')
    expect(body.message).toBe('Unsupported order type.')
  })

  it('returns 500 and logs unknown errors', async () => {
    mockAuth.mockReturnValue({ userId: 'u1', role: 'OWNER' })
    mockGetOrderDetailDashboardData.mockRejectedValue(new Error('boom'))

    const req = new NextRequest('http://localhost/api/dashboard/orders/purchase/po-1/detail')
    const res = await GET(req, { params: Promise.resolve({ orderType: 'purchase', id: 'po-1' }) })
    const body = await res.json()

    expect(res.status).toBe(500)
    expect(body.success).toBe(false)
    expect(body.message).toBe('Failed to load order detail dashboard.')
    expect(mockLogAppError).toHaveBeenCalledWith(
      '[GET /api/dashboard/orders/[orderType]/[id]/detail]',
      expect.any(Error)
    )
  })
})
