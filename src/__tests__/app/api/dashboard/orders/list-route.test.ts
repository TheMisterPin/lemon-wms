import { NextRequest } from 'next/server'
import { beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('@/lib/auth/middleware', () => ({
  verifyAccessTokenFromRequest: vi.fn(),
  isOfficeRole: vi.fn()
}))

vi.mock('@/lib/pages/dashboard/get-order-type-dashboard-data', () => ({
  getOrderTypeDashboardData: vi.fn()
}))

vi.mock('@/lib/prisma', () => ({
  default: {}
}))

import { GET } from '@/app/api/dashboard/orders/[orderType]/route'
import { verifyAccessTokenFromRequest, isOfficeRole } from '@/lib/auth/middleware'
import { DomainError } from '@/lib/errors'
import { getOrderTypeDashboardData } from '@/lib/pages/dashboard/get-order-type-dashboard-data'

const mockAuth = verifyAccessTokenFromRequest as ReturnType<typeof vi.fn>
const mockOffice = isOfficeRole as ReturnType<typeof vi.fn>
const mockGetData = getOrderTypeDashboardData as ReturnType<typeof vi.fn>

const emptyByStatus = {
  DRAFT: 0,
  CONFIRMED: 0,
  RELEASED: 0,
  EXECUTING: 0,
  PAUSED: 0,
  EXECUTED: 0,
  EXECUTED_WITH_PROBLEMS: 0,
  SIGNED_OFF: 0,
  CANCELLED: 0
}

describe('GET /api/dashboard/orders/[orderType]', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns 401 when not authenticated', async () => {
    mockAuth.mockReturnValue(null)
    const req = new NextRequest('http://localhost/api/dashboard/orders/purchase')
    const res = await GET(req, { params: Promise.resolve({ orderType: 'purchase' }) })
    expect(res.status).toBe(401)
    expect(mockGetData).not.toHaveBeenCalled()
  })

  it('returns 403 when not office role', async () => {
    mockAuth.mockReturnValue({ userId: 'u1', role: 'WAREHOUSE_WORKER' })
    mockOffice.mockReturnValue(false)
    const req = new NextRequest('http://localhost/api/dashboard/orders/purchase')
    const res = await GET(req, { params: Promise.resolve({ orderType: 'purchase' }) })
    expect(res.status).toBe(403)
    expect(mockGetData).not.toHaveBeenCalled()
  })

  it('returns 400 for unsupported orderType', async () => {
    mockAuth.mockReturnValue({ userId: 'u1', role: 'OWNER' })
    mockOffice.mockReturnValue(true)
    mockGetData.mockRejectedValue(new DomainError('Unsupported order type.', 'VALIDATION_ERROR', 400))
    const req = new NextRequest('http://localhost/api/dashboard/orders/return')
    const res = await GET(req, { params: Promise.resolve({ orderType: 'return' }) })
    expect(res.status).toBe(400)
    expect(mockGetData).toHaveBeenCalled()
  })

  it('returns 200 with order-type dashboard payload for purchase', async () => {
    mockAuth.mockReturnValue({ userId: 'u1', role: 'OWNER' })
    mockOffice.mockReturnValue(true)
    mockGetData.mockResolvedValue({
      title: 'Purchase orders',
      orderTypeRouteKey: 'purchase',
      kpis: {
        totalOrders: 1,
        warehousesWithOrders: 1,
        aggregateProgressPercent: 0
      },
      statusDonut: [{ status: 'DRAFT', count: 1 }],
      warehouseBars: [
        {
          warehouseId: 'wh-1',
          warehouseName: 'Main',
          href: '/dashboard/locations/warehouses/wh-1',
          byStatus: { ...emptyByStatus, DRAFT: 1 }
        }
      ],
      orders: [
        {
          orderId: 'po-1',
          orderLabel: 'R1',
          status: 'DRAFT',
          warehouseId: 'wh-1',
          warehouseName: 'Main',
          progressPercent: 0,
          href: '/dashboard/orders/purchase/po-1',
          createdAt: '2026-01-01T00:00:00.000Z'
        }
      ],
      activities: [],
      purchaseOrdersForTable: [
        {
          id: 'po-1',
          reference: 'R1',
          status: 'DRAFT',
          supplier: 'Acme',
          warehouseId: 'wh-1',
          createdAt: new Date('2026-01-01T00:00:00.000Z'),
          businessPartyId: 'bp-1',
          lineCount: 0,
          lines: []
        }
      ]
    })
    const req = new NextRequest('http://localhost/api/dashboard/orders/purchase')
    const res = await GET(req, { params: Promise.resolve({ orderType: 'purchase' }) })
    const body = await res.json()
    expect(res.status).toBe(200)
    expect(body.success).toBe(true)
    expect(body.data.title).toBe('Purchase orders')
    expect(body.data.purchaseOrdersForTable).toHaveLength(1)
    expect(mockGetData).toHaveBeenCalled()
  })
})
