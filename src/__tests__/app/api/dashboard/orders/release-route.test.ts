import { NextRequest } from 'next/server'
import { beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('@/lib/auth/middleware', () => ({
  verifyAccessTokenFromRequest: vi.fn(),
  isOfficeRole: vi.fn()
}))

vi.mock('@/lib/orders/purchase', () => ({
  releasePurchaseOrder: vi.fn()
}))

vi.mock('@/lib/prisma', () => ({
  default: {}
}))

import { POST } from '@/app/api/dashboard/orders/[orderType]/[id]/release/route'
import { OrderStatus } from '@/generated/prisma'
import { verifyAccessTokenFromRequest, isOfficeRole } from '@/lib/auth/middleware'
import { releasePurchaseOrder } from '@/lib/orders/purchase'

const mockAuth = verifyAccessTokenFromRequest as ReturnType<typeof vi.fn>
const mockOffice = isOfficeRole as ReturnType<typeof vi.fn>
const mockRelease = releasePurchaseOrder as ReturnType<typeof vi.fn>

describe('POST /api/dashboard/orders/[orderType]/[id]/release', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns 401 when not authenticated', async () => {
    mockAuth.mockReturnValue(null)
    const req = new NextRequest('http://localhost/api/dashboard/orders/purchase/x/release')
    const res = await POST(req, {
      params: Promise.resolve({ orderType: 'purchase', id: 'x' })
    })
    expect(res.status).toBe(401)
    expect(mockRelease).not.toHaveBeenCalled()
  })

  it('returns 403 when not office role', async () => {
    mockAuth.mockReturnValue({ userId: 'u1', role: 'WAREHOUSE_WORKER' })
    mockOffice.mockReturnValue(false)
    const req = new NextRequest('http://localhost/api/dashboard/orders/purchase/x/release')
    const res = await POST(req, {
      params: Promise.resolve({ orderType: 'purchase', id: 'x' })
    })
    expect(res.status).toBe(403)
    expect(mockRelease).not.toHaveBeenCalled()
  })

  it('returns 400 for unsupported orderType', async () => {
    mockAuth.mockReturnValue({ userId: 'u1', role: 'OWNER' })
    mockOffice.mockReturnValue(true)
    const req = new NextRequest('http://localhost/api/dashboard/orders/sales/x/release')
    const res = await POST(req, {
      params: Promise.resolve({ orderType: 'sales', id: 'x' })
    })
    expect(res.status).toBe(400)
    expect(mockRelease).not.toHaveBeenCalled()
  })

  it('returns 400 when id empty after trim', async () => {
    mockAuth.mockReturnValue({ userId: 'u1', role: 'OWNER' })
    mockOffice.mockReturnValue(true)
    const req = new NextRequest('http://localhost/api/dashboard/orders/purchase/  /release')
    const res = await POST(req, {
      params: Promise.resolve({ orderType: 'purchase', id: '  ' })
    })
    expect(res.status).toBe(400)
    expect(mockRelease).not.toHaveBeenCalled()
  })

  it('returns 200 on success', async () => {
    mockAuth.mockReturnValue({ userId: 'u1', role: 'OWNER' })
    mockOffice.mockReturnValue(true)
    mockRelease.mockResolvedValue({ id: 'po-1', status: OrderStatus.RELEASED })
    const req = new NextRequest('http://localhost/api/dashboard/orders/purchase/po-1/release')
    const res = await POST(req, {
      params: Promise.resolve({ orderType: 'purchase', id: 'po-1' })
    })
    const body = await res.json()
    expect(res.status).toBe(200)
    expect(body.success).toBe(true)
    expect(body.data.status).toBe(OrderStatus.RELEASED)
    expect(mockRelease).toHaveBeenCalled()
  })
})
