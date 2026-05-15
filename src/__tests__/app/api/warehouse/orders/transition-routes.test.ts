import { NextRequest } from 'next/server'
import { beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('@/lib/auth/middleware', () => ({
  verifyAccessTokenFromRequest: vi.fn(),
  isFloorRole: vi.fn()
}))

vi.mock('@/lib/orders/purchase', () => ({
  pausePurchaseOrder: vi.fn(),
  resumePurchaseOrder: vi.fn()
}))

vi.mock('@/lib/orders/shared/start-operational-order-for-floor-user', () => ({
  startOperationalOrderForFloorUser: vi.fn()
}))

vi.mock('@/lib/orders/shared/transition-sales-order', () => ({
  pauseSalesOrder: vi.fn(),
  resumeSalesOrder: vi.fn()
}))

vi.mock('@/lib/orders/shared/transition-transfer-order', () => ({
  pauseTransferOrder: vi.fn(),
  resumeTransferOrder: vi.fn()
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
  pausePurchaseOrder,
  resumePurchaseOrder
} from '@/lib/orders/purchase'
import { startOperationalOrderForFloorUser } from '@/lib/orders/shared/start-operational-order-for-floor-user'
import {
  pauseSalesOrder,
  resumeSalesOrder
} from '@/lib/orders/shared/transition-sales-order'
import {
  pauseTransferOrder,
  resumeTransferOrder
} from '@/lib/orders/shared/transition-transfer-order'

const mockAuth = verifyAccessTokenFromRequest as ReturnType<typeof vi.fn>
const mockFloor = isFloorRole as ReturnType<typeof vi.fn>
const mockStartOperational = startOperationalOrderForFloorUser as ReturnType<typeof vi.fn>
const mockPausePurchase = pausePurchaseOrder as ReturnType<typeof vi.fn>
const mockResumePurchase = resumePurchaseOrder as ReturnType<typeof vi.fn>
const mockPauseSales = pauseSalesOrder as ReturnType<typeof vi.fn>
const mockResumeSales = resumeSalesOrder as ReturnType<typeof vi.fn>
const mockPauseTransfer = pauseTransferOrder as ReturnType<typeof vi.fn>
const mockResumeTransfer = resumeTransferOrder as ReturnType<typeof vi.fn>

const floorUser = { userId: 'u1', role: 'WAREHOUSE_MANAGER', warehouseId: 'wh-1' }

describe('warehouse operational order transition routes', () => {
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
      expect(mockStartOperational).not.toHaveBeenCalled()
    })

    it('returns 400 when order type is unsupported', async () => {
      mockAuth.mockReturnValue(floorUser)
      mockFloor.mockReturnValue(true)
      const req = new NextRequest('http://localhost/api/warehouse/orders/unknown/po-1/start')
      const res = await POST_START(req, {
        params: Promise.resolve({ orderType: 'unknown', id: 'po-1' })
      })
      expect(res.status).toBe(400)
      expect(mockStartOperational).not.toHaveBeenCalled()
    })

    it('returns 200 when purchase start succeeds', async () => {
      mockAuth.mockReturnValue(floorUser)
      mockFloor.mockReturnValue(true)
      mockStartOperational.mockResolvedValue({ id: 'po-1', status: OrderStatus.EXECUTING, orderAssignmentId: 'asg-1' })
      const req = new NextRequest('http://localhost/api/warehouse/orders/purchase/po-1/start')
      const res = await POST_START(req, {
        params: Promise.resolve({ orderType: 'purchase', id: 'po-1' })
      })
      const body = await res.json()
      expect(res.status).toBe(200)
      expect(body.data.status).toBe(OrderStatus.EXECUTING)
      expect(mockStartOperational).toHaveBeenCalledWith(expect.anything(), {
        kind: 'purchase',
        orderId: 'po-1',
        warehouseId: 'wh-1',
        userId: 'u1',
        zoneId: null,
        forcePauseOthers: false
      })
    })

    it('passes forcePauseOthers when body requests it', async () => {
      mockAuth.mockReturnValue(floorUser)
      mockFloor.mockReturnValue(true)
      mockStartOperational.mockResolvedValue({ id: 'po-2', status: OrderStatus.EXECUTING, orderAssignmentId: 'asg-x' })
      const req = new NextRequest('http://localhost/api/warehouse/orders/purchase/po-2/start', {
        method: 'POST',
        body: JSON.stringify({ forcePauseOthers: true }),
        headers: { 'content-type': 'application/json' }
      })
      const res = await POST_START(req, {
        params: Promise.resolve({ orderType: 'purchase', id: 'po-2' })
      })
      expect(res.status).toBe(200)
      expect(mockStartOperational).toHaveBeenCalledWith(expect.anything(), {
        kind: 'purchase',
        orderId: 'po-2',
        warehouseId: 'wh-1',
        userId: 'u1',
        zoneId: null,
        forcePauseOthers: true
      })
    })

    it('returns 200 when sales start succeeds', async () => {
      mockAuth.mockReturnValue(floorUser)
      mockFloor.mockReturnValue(true)
      mockStartOperational.mockResolvedValue({ id: 'so-1', status: OrderStatus.EXECUTING, orderAssignmentId: 'asg-2' })
      const req = new NextRequest('http://localhost/api/warehouse/orders/sales/so-1/start')
      const res = await POST_START(req, {
        params: Promise.resolve({ orderType: 'sales', id: 'so-1' })
      })
      const body = await res.json()
      expect(res.status).toBe(200)
      expect(body.data.status).toBe(OrderStatus.EXECUTING)
      expect(mockStartOperational).toHaveBeenCalledWith(expect.anything(), {
        kind: 'sales',
        orderId: 'so-1',
        warehouseId: 'wh-1',
        userId: 'u1',
        zoneId: null,
        forcePauseOthers: false
      })
    })

    it('returns 200 when transfer start succeeds', async () => {
      mockAuth.mockReturnValue(floorUser)
      mockFloor.mockReturnValue(true)
      mockStartOperational.mockResolvedValue({ id: 'to-1', status: OrderStatus.EXECUTING, orderAssignmentId: 'asg-3' })
      const req = new NextRequest('http://localhost/api/warehouse/orders/transfer/to-1/start')
      const res = await POST_START(req, {
        params: Promise.resolve({ orderType: 'transfer', id: 'to-1' })
      })
      const body = await res.json()
      expect(res.status).toBe(200)
      expect(body.data.status).toBe(OrderStatus.EXECUTING)
      expect(mockStartOperational).toHaveBeenCalledWith(expect.anything(), {
        kind: 'transfer',
        orderId: 'to-1',
        warehouseId: 'wh-1',
        userId: 'u1',
        zoneId: null,
        forcePauseOthers: false
      })
    })
  })

  describe('POST .../pause', () => {
    it('returns 200 when purchase pause succeeds', async () => {
      mockAuth.mockReturnValue(floorUser)
      mockFloor.mockReturnValue(true)
      mockPausePurchase.mockResolvedValue({ id: 'po-1', status: OrderStatus.PAUSED })
      const req = new NextRequest('http://localhost/api/warehouse/orders/purchase/po-1/pause')
      const res = await POST_PAUSE(req, {
        params: Promise.resolve({ orderType: 'purchase', id: 'po-1' })
      })
      const body = await res.json()
      expect(res.status).toBe(200)
      expect(body.data.status).toBe(OrderStatus.PAUSED)
      expect(mockPausePurchase).toHaveBeenCalledWith(expect.anything(), 'po-1', 'wh-1', 'u1')
    })

    it('returns 200 when sales pause succeeds', async () => {
      mockAuth.mockReturnValue(floorUser)
      mockFloor.mockReturnValue(true)
      mockPauseSales.mockResolvedValue({ id: 'so-1', status: OrderStatus.PAUSED })
      const req = new NextRequest('http://localhost/api/warehouse/orders/sales/so-1/pause')
      const res = await POST_PAUSE(req, {
        params: Promise.resolve({ orderType: 'sales', id: 'so-1' })
      })
      const body = await res.json()
      expect(res.status).toBe(200)
      expect(body.data.status).toBe(OrderStatus.PAUSED)
      expect(mockPauseSales).toHaveBeenCalledWith(expect.anything(), 'so-1', 'wh-1', 'u1')
    })

    it('returns 200 when transfer pause succeeds', async () => {
      mockAuth.mockReturnValue(floorUser)
      mockFloor.mockReturnValue(true)
      mockPauseTransfer.mockResolvedValue({ id: 'to-1', status: OrderStatus.PAUSED })
      const req = new NextRequest('http://localhost/api/warehouse/orders/transfer/to-1/pause')
      const res = await POST_PAUSE(req, {
        params: Promise.resolve({ orderType: 'transfer', id: 'to-1' })
      })
      const body = await res.json()
      expect(res.status).toBe(200)
      expect(body.data.status).toBe(OrderStatus.PAUSED)
      expect(mockPauseTransfer).toHaveBeenCalledWith(expect.anything(), 'to-1', 'wh-1', 'u1')
    })
  })

  describe('POST .../resume', () => {
    it('returns 200 when purchase resume succeeds', async () => {
      mockAuth.mockReturnValue(floorUser)
      mockFloor.mockReturnValue(true)
      mockResumePurchase.mockResolvedValue({ id: 'po-1', status: OrderStatus.EXECUTING, orderAssignmentId: 'asg-resume-po' })
      const req = new NextRequest('http://localhost/api/warehouse/orders/purchase/po-1/resume')
      const res = await POST_RESUME(req, {
        params: Promise.resolve({ orderType: 'purchase', id: 'po-1' })
      })
      const body = await res.json()
      expect(res.status).toBe(200)
      expect(body.data.status).toBe(OrderStatus.EXECUTING)
      expect(mockResumePurchase).toHaveBeenCalledWith(expect.anything(), 'po-1', 'wh-1', 'u1', null)
    })

    it('returns 200 when transfer resume succeeds', async () => {
      mockAuth.mockReturnValue(floorUser)
      mockFloor.mockReturnValue(true)
      mockResumeTransfer.mockResolvedValue({ id: 'to-1', status: OrderStatus.EXECUTING, orderAssignmentId: 'asg-resume-to' })
      const req = new NextRequest('http://localhost/api/warehouse/orders/transfer/to-1/resume')
      const res = await POST_RESUME(req, {
        params: Promise.resolve({ orderType: 'transfer', id: 'to-1' })
      })
      const body = await res.json()
      expect(res.status).toBe(200)
      expect(body.data.status).toBe(OrderStatus.EXECUTING)
      expect(mockResumeTransfer).toHaveBeenCalledWith(expect.anything(), 'to-1', 'wh-1', 'u1', null)
    })

    it('returns 200 when sales resume succeeds', async () => {
      mockAuth.mockReturnValue(floorUser)
      mockFloor.mockReturnValue(true)
      mockResumeSales.mockResolvedValue({ id: 'so-1', status: OrderStatus.EXECUTING, orderAssignmentId: 'asg-resume-so' })
      const req = new NextRequest('http://localhost/api/warehouse/orders/sales/so-1/resume')
      const res = await POST_RESUME(req, {
        params: Promise.resolve({ orderType: 'sales', id: 'so-1' })
      })
      const body = await res.json()
      expect(res.status).toBe(200)
      expect(body.data.status).toBe(OrderStatus.EXECUTING)
      expect(mockResumeSales).toHaveBeenCalledWith(expect.anything(), 'so-1', 'wh-1', 'u1', null)
    })
  })
})
