import { NextRequest } from 'next/server'
import { beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('@/lib/auth/middleware', () => ({
  verifyAccessTokenFromRequest: vi.fn(),
  isOfficeRole: vi.fn()
}))

vi.mock('@/lib/pages/dashboard/get-orders-dashboard-data', () => ({
  getOrdersDashboardData: vi.fn()
}))

vi.mock('@/lib/prisma', () => ({
  default: {}
}))

vi.mock('@/lib/logs/app-logger', () => ({
  logAppError: vi.fn()
}))

import { GET } from '@/app/api/dashboard/orders/overview/route'
import { verifyAccessTokenFromRequest, isOfficeRole } from '@/lib/auth/middleware'
import { DomainError } from '@/lib/errors'
import { logAppError } from '@/lib/logs/app-logger'
import { getOrdersDashboardData } from '@/lib/pages/dashboard/get-orders-dashboard-data'

const mockAuth = verifyAccessTokenFromRequest as ReturnType<typeof vi.fn>
const mockIsOfficeRole = isOfficeRole as ReturnType<typeof vi.fn>
const mockGetOrdersDashboardData = getOrdersDashboardData as ReturnType<typeof vi.fn>
const mockLogAppError = logAppError as ReturnType<typeof vi.fn>

describe('GET /api/dashboard/orders/overview', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns 401 when not authenticated', async () => {
    mockAuth.mockReturnValue(null)
    const req = new NextRequest('http://localhost/api/dashboard/orders/overview')
    const res = await GET(req)

    expect(res.status).toBe(401)
    expect(mockGetOrdersDashboardData).not.toHaveBeenCalled()
  })

  it('returns 401 when role is not office', async () => {
    mockAuth.mockReturnValue({ userId: 'u1', role: 'WAREHOUSE_WORKER' })
    mockIsOfficeRole.mockReturnValue(false)
    const req = new NextRequest('http://localhost/api/dashboard/orders/overview')
    const res = await GET(req)

    expect(res.status).toBe(401)
    expect(mockGetOrdersDashboardData).not.toHaveBeenCalled()
  })

  it('returns 200 with dashboard data on success', async () => {
    mockAuth.mockReturnValue({ userId: 'u1', role: 'OWNER' })
    mockIsOfficeRole.mockReturnValue(true)
    mockGetOrdersDashboardData.mockResolvedValue({
      summaryCards: [{ id: 'purchase', label: 'Purchase', value: 3 }],
      latestActivities: []
    })

    const req = new NextRequest('http://localhost/api/dashboard/orders/overview')
    const res = await GET(req)
    const body = await res.json()

    expect(res.status).toBe(200)
    expect(body.success).toBe(true)
    expect(body.message).toBe('Orders dashboard retrieved successfully.')
    expect(body.data.summaryCards).toHaveLength(1)
    expect(mockGetOrdersDashboardData).toHaveBeenCalledWith(expect.anything())
  })

  it('maps DomainError status and code', async () => {
    mockAuth.mockReturnValue({ userId: 'u1', role: 'OWNER' })
    mockIsOfficeRole.mockReturnValue(true)
    mockGetOrdersDashboardData.mockRejectedValue(
      new DomainError('Dashboard unavailable.', 'VALIDATION_ERROR', 422)
    )

    const req = new NextRequest('http://localhost/api/dashboard/orders/overview')
    const res = await GET(req)
    const body = await res.json()

    expect(res.status).toBe(422)
    expect(body.success).toBe(false)
    expect(body.error.code).toBe('VALIDATION_ERROR')
    expect(body.message).toBe('Dashboard unavailable.')
  })

  it('returns 500 and logs unknown errors', async () => {
    mockAuth.mockReturnValue({ userId: 'u1', role: 'OWNER' })
    mockIsOfficeRole.mockReturnValue(true)
    mockGetOrdersDashboardData.mockRejectedValue(new Error('boom'))

    const req = new NextRequest('http://localhost/api/dashboard/orders/overview')
    const res = await GET(req)
    const body = await res.json()

    expect(res.status).toBe(500)
    expect(body.success).toBe(false)
    expect(body.message).toBe('Failed to load orders dashboard.')
    expect(mockLogAppError).toHaveBeenCalledWith(
      '[GET /api/dashboard/orders/overview]',
      expect.any(Error)
    )
  })
})
