// @vitest-environment jsdom

import { act, renderHook, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { OrderStatus } from '@/generated/prisma'
import { usePurchaseOrders } from '@/components/warehouse/orders/use-purchase-orders'

vi.mock('@/lib/axios', () => ({
  warehouseApiClient: {
    get: vi.fn(),
    post: vi.fn()
  }
}))

import { warehouseApiClient } from '@/lib/axios'

const mockGet = vi.mocked(warehouseApiClient.get)
const mockPost = vi.mocked(warehouseApiClient.post)

describe('usePurchaseOrders', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('loads and filters by status', async () => {
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
          businessPartyId: null
        },
        {
          id: 'po-2',
          reference: 'PO-002',
          status: OrderStatus.PAUSED,
          supplier: 'Acme',
          warehouseId: 'WH-1',
          createdAt: '2026-01-01T00:00:00.000Z',
          businessPartyId: null
        }
      ]
    })

    const { result } = renderHook(() => usePurchaseOrders('purchase'))

    await act(async () => {
      await result.current.loadOrders()
    })

    expect(result.current.rows).toHaveLength(2)

    act(() => {
      result.current.toggleStatusFilter(OrderStatus.PAUSED)
    })

    expect(result.current.filteredRows).toHaveLength(1)
    expect(result.current.filteredRows[0].status).toBe(OrderStatus.PAUSED)
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
          businessPartyId: null
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

    expect(result.current.listError).toBe('Unable to load purchase orders.')
    expect(result.current.rows).toEqual([])
  })

  it('does not call warehouse API when order type is not purchase', async () => {
    const { result } = renderHook(() => usePurchaseOrders('transfer'))

    await act(async () => {
      await result.current.loadOrders()
    })

    expect(mockGet).not.toHaveBeenCalled()
    expect(result.current.isPurchase).toBe(false)
    expect(result.current.rows).toEqual([])
  })
})
