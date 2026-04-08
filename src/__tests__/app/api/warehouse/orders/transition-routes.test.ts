import { NextRequest } from 'next/server'
import { beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('@/lib/auth/middleware', () => ({
  verifyAccessTokenFromRequest: vi.fn(),
  isFloorRole: vi.fn()
}))

vi.mock('@/lib/orders/purchase', () => ({
  startPurchaseOrder: vi.fn(),
  pausePurchaseOrder: vi.fn(),
  resumePurchaseOrder: vi.fn()
}))

vi.mock('@/lib/prisma', () => ({
  default: {}
}))

import { POST as POST_PAUSE } from '@/app/api/warehouse/orders/[orderType]/[id]/pause/route'
import { POST as POST_RESUME } from '@/app/api/warehouse/orders/[orderType]/[id]/resume/route'
import { POST as POST_START } from '@/app/api/warehouse/orders/[orderType]/[id]/start/route'
import { OrderStatus } from '@/generated/prisma'
import { verifyAccessTokenFromRequest, isFloorRole } from '@/lib/auth/middleware'
import {
  startPurchaseOrder,
  pausePurchaseOrder,
  resumePurchaseOrder
} from '@/lib/orders/purchase'

const mockAuth = verifyAccessTokenFromRequest as ReturnType<typeof vi.fn>
const mockFloor = isFloorRole as ReturnType<typeof vi.fn>
const mockStart = startPurchaseOrder as ReturnType<typeof vi.fn>
const mockPause = pausePurchaseOrder as ReturnType<typeof vi.fn>
const mockResume = resumePurchaseOrder as ReturnType<typeof vi.fn>

const floorUser = { userId: 'u1', role: 'WAREHOUSE_MANAGER', warehouseId: 'wh-1' }

describe('warehouse PO transition routes', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('POST .../start', () => {
    it('returns 400 when warehouseId missing on token', async () => {
      mockAuth.mockReturnValue({ userId: 'u1', role: 'WAREHOUSE_MANAGER' })
      mockFloor.mockReturnValue(true)
      const req = new NextRequest('http://localhost/api/warehouse/orders/purchase/po-1/start')
      const res = await POST_START(req, {
        params: Promise.resolve({ orderType: 'purchase', id: 'po-1' })
      })
      expect(res.status).toBe(400)
      expect(mockStart).not.toHaveBeenCalled()
    })

    it('returns 200 when start succeeds', async () => {
      mockAuth.mockReturnValue(floorUser)
      mockFloor.mockReturnValue(true)
      mockStart.mockResolvedValue({ id: 'po-1', status: OrderStatus.EXECUTING })
      const req = new NextRequest('http://localhost/api/warehouse/orders/purchase/po-1/start')
      const res = await POST_START(req, {
        params: Promise.resolve({ orderType: 'purchase', id: 'po-1' })
      })
      const body = await res.json()
      expect(res.status).toBe(200)
      expect(body.data.status).toBe(OrderStatus.EXECUTING)
      expect(mockStart).toHaveBeenCalledWith(expect.anything(), 'po-1', 'wh-1')
    })
  })

  describe('POST .../pause', () => {
    it('returns 200 when pause succeeds', async () => {
      mockAuth.mockReturnValue(floorUser)
      mockFloor.mockReturnValue(true)
      mockPause.mockResolvedValue({ id: 'po-1', status: OrderStatus.PAUSED })
      const req = new NextRequest('http://localhost/api/warehouse/orders/purchase/po-1/pause')
      const res = await POST_PAUSE(req, {
        params: Promise.resolve({ orderType: 'purchase', id: 'po-1' })
      })
      const body = await res.json()
      expect(res.status).toBe(200)
      expect(body.data.status).toBe(OrderStatus.PAUSED)
      expect(mockPause).toHaveBeenCalledWith(expect.anything(), 'po-1', 'wh-1')
    })
  })

  describe('POST .../resume', () => {
    it('returns 200 when resume succeeds', async () => {
      mockAuth.mockReturnValue(floorUser)
      mockFloor.mockReturnValue(true)
      mockResume.mockResolvedValue({ id: 'po-1', status: OrderStatus.EXECUTING })
      const req = new NextRequest('http://localhost/api/warehouse/orders/purchase/po-1/resume')
      const res = await POST_RESUME(req, {
        params: Promise.resolve({ orderType: 'purchase', id: 'po-1' })
      })
      const body = await res.json()
      expect(res.status).toBe(200)
      expect(body.data.status).toBe(OrderStatus.EXECUTING)
      expect(mockResume).toHaveBeenCalledWith(expect.anything(), 'po-1', 'wh-1')
    })
  })
})
