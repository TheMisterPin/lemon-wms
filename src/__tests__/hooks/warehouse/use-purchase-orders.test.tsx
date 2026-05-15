// @vitest-environment jsdom

import { act, renderHook, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { usePurchaseOrders } from '@/components/warehouse/orders/use-purchase-orders'
import { OrderStatus } from '@/generated/prisma'

vi.mock('@/lib/axios', () => ({
  warehouseApiClient: {
    get: vi.fn(),
    post: vi.fn()
  }
}))

const { dialogMocks } = vi.hoisted(() => ({
  dialogMocks: {
    reportError: vi.fn(),
    reportNotice: vi.fn(),
    requestConfirm: vi.fn(),
    clearError: vi.fn(),
    currentDialog: null,
    isOpen: false,
    history: [] as never[]
  }
}))

vi.mock('@/components/shared/use-error-dialog', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/components/shared/use-error-dialog')>()

  return {
    ...actual,
    useErrorDialog: () => dialogMocks
  }
})

import { warehouseApiClient } from '@/lib/axios'

const mockGet = vi.mocked(warehouseApiClient.get)
const mockPost = vi.mocked(warehouseApiClient.post)

describe('usePurchaseOrders', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('loads and respects status chip filters', async () => {
    mockGet.mockResolvedValue({
      success: true,
      message: 'ok',
      data: [
        {
          id: 'po-1',
          reference: 'PO-001',
          status: OrderStatus.RELEASED,
          supplier: 'Acme',
          warehouseId: 'WH-1',
          createdAt: '2026-01-01T00:00:00.000Z',
          businessPartyId: null,
          assignedUserId: null,
          activeOrderAssignmentId: null,
          lastActiveAt: null,
          pausedAt: null
        },
        {
          id: 'po-2',
          reference: 'PO-002',
          status: OrderStatus.PAUSED,
          supplier: 'Acme',
          warehouseId: 'WH-1',
          createdAt: '2026-01-01T00:00:00.000Z',
          businessPartyId: null,
          assignedUserId: null,
          activeOrderAssignmentId: null,
          lastActiveAt: null,
          pausedAt: null
        }
      ]
    })

    const { result } = renderHook(() => usePurchaseOrders('purchase'))

    await act(async () => {
      await result.current.loadOrders()
    })

    expect(result.current.rows).toHaveLength(2)

    act(() => {
      result.current.toggleStatusInFilter(OrderStatus.RELEASED)
    })

    expect(result.current.paginatedRows).toHaveLength(1)
    expect(result.current.paginatedRows[0].status).toBe(OrderStatus.PAUSED)
  })

  it('runs adaptive row action for RELEASED -> start endpoint', async () => {
    mockGet
      .mockResolvedValueOnce({
        success: true,
        message: 'ok',
        data: [{
          id: 'po-1',
          reference: 'PO-001',
          status: OrderStatus.RELEASED,
          supplier: 'Acme',
          warehouseId: 'WH-1',
          createdAt: '2026-01-01T00:00:00.000Z',
          businessPartyId: null,
          assignedUserId: null,
          activeOrderAssignmentId: null,
          lastActiveAt: null,
          pausedAt: null
        }]
      })
      .mockResolvedValueOnce({
        success: true,
        message: 'ok',
        data: []
      })
    mockPost.mockResolvedValue({ success: true, message: 'ok', data: null })

    const { result } = renderHook(() => usePurchaseOrders('purchase'))

    await act(async () => {
      await result.current.loadOrders()
    })

    await act(async () => {
      await result.current.runAction(result.current.rows[0])
    })

    expect(mockPost).toHaveBeenCalledWith('/warehouse/orders/purchase/po-1/start', {})
    await waitFor(() => {
      expect(mockGet).toHaveBeenCalledTimes(2)
    })
  })

  it('surfaces list errors from failed fetch', async () => {
    mockGet.mockRejectedValue(new Error('network down'))

    const { result } = renderHook(() => usePurchaseOrders('purchase'))

    await act(async () => {
      await result.current.loadOrders()
    })

    expect(result.current.loadOutcome).toBe('failed')
    expect(dialogMocks.reportNotice).toHaveBeenCalledWith(
      expect.objectContaining({
        title: 'Unable to load orders',
        message: 'Unable to load orders.'
      })
    )
    expect(result.current.rows).toEqual([])
  })

  it('does not call warehouse API when order type segment is invalid', async () => {
    const { result } = renderHook(() => usePurchaseOrders('returns'))

    await act(async () => {
      await result.current.loadOrders()
    })

    expect(mockGet).not.toHaveBeenCalled()
    expect(result.current.segment).toBe(null)
    expect(result.current.rows).toEqual([])
  })

  it('loads sales orders from sales segment path', async () => {
    mockGet.mockResolvedValue({
      success: true,
      message: 'ok',
      data: [{
        id: 'so-1',
        reference: 'SO-001',
        status: OrderStatus.RELEASED,
        supplier: 'Retail Co',
        warehouseId: 'WH-1',
        createdAt: '2026-01-01T00:00:00.000Z',
        businessPartyId: null,
        assignedUserId: null,
        activeOrderAssignmentId: null,
        lastActiveAt: null,
        pausedAt: null
      }]
    })

    const { result } = renderHook(() => usePurchaseOrders('sales'))

    await act(async () => {
      await result.current.loadOrders()
    })

    expect(mockGet).toHaveBeenCalledWith('/warehouse/orders/sales')
    expect(result.current.segment).toBe('sales')
    expect(result.current.rows).toHaveLength(1)
  })

  it('opens confirm when start returns ACTIVE_ORDER_CONFLICT then retries with forcePauseOthers', async () => {
    mockGet
      .mockResolvedValueOnce({
        success: true,
        message: 'ok',
        data: [{
          id: 'po-1',
          reference: 'PO-001',
          status: OrderStatus.RELEASED,
          supplier: 'Acme',
          warehouseId: 'WH-1',
          createdAt: '2026-01-01T00:00:00.000Z',
          businessPartyId: null,
          assignedUserId: null,
          activeOrderAssignmentId: null,
          lastActiveAt: null,
          pausedAt: null
        }]
      })
      .mockResolvedValue({
        success: true,
        message: 'ok',
        data: [{
          id: 'po-1',
          reference: 'PO-001',
          status: OrderStatus.EXECUTING,
          supplier: 'Acme',
          warehouseId: 'WH-1',
          createdAt: '2026-01-01T00:00:00.000Z',
          businessPartyId: null,
          assignedUserId: null,
          activeOrderAssignmentId: null,
          lastActiveAt: null,
          pausedAt: null
        }]
      })

    mockPost
      .mockResolvedValueOnce({
        success: false,
        message: 'Another order is executing.',
        data: null,
        error: { code: 'ACTIVE_ORDER_CONFLICT' }
      })
      .mockResolvedValueOnce({ success: true, message: 'ok', data: null })

    const { result } = renderHook(() => usePurchaseOrders('purchase'))

    await act(async () => {
      await result.current.loadOrders()
    })

    await act(async () => {
      await result.current.runAction(result.current.rows[0])
    })

    expect(dialogMocks.requestConfirm).toHaveBeenCalledTimes(1)
    const confirmArg = dialogMocks.requestConfirm.mock.calls[0][0]

    await act(async () => {
      await confirmArg.onConfirm()
    })

    expect(mockPost).toHaveBeenNthCalledWith(1, '/warehouse/orders/purchase/po-1/start', {})
    expect(mockPost).toHaveBeenNthCalledWith(2, '/warehouse/orders/purchase/po-1/start', {
      forcePauseOthers: true
    })
  })
})
