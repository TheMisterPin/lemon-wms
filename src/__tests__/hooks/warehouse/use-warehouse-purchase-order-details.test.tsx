// @vitest-environment jsdom

import { act, renderHook, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { OrderStatus, ReceiptOutcome, ReceiptStatus } from '@/generated/prisma'
import { useWarehousePurchaseOrderDetails } from '@/components/warehouse/orders/use-warehouse-purchase-order-details'

vi.mock('@/lib/axios', () => ({
  warehouseApiClient: {
    get: vi.fn(),
    post: vi.fn()
  }
}))

const dialogMocks = vi.hoisted(() => ({
  reportError: vi.fn(),
  reportNotice: vi.fn(),
  requestConfirm: vi.fn(),
  clearError: vi.fn(),
  currentDialog: null,
  isOpen: false,
  history: [] as never[]
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

describe('useWarehousePurchaseOrderDetails', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('loads list row and receipt for the target id', async () => {
    mockGet
      .mockResolvedValueOnce({
        success: true,
        message: 'ok',
        data: [
          {
            id: 'po-99',
            reference: 'PO-99',
            status: OrderStatus.EXECUTING,
            supplier: 'Acme',
            warehouseId: 'WH-1',
            createdAt: '2026-01-01T00:00:00.000Z',
            businessPartyId: null,
            assignedUserId: 'u-1',
            activeOrderAssignmentId: 'asg-1',
            lastActiveAt: '2026-01-01T00:00:00.000Z',
            pausedAt: null
          }
        ]
      })
      .mockResolvedValueOnce({
        success: true,
        message: 'ok',
        data: {
          id: 'rec-1',
          reference: 'RCT-1',
          status: ReceiptStatus.OPEN,
          purchaseOrderId: 'po-99',
          totalProcessedQuantity: '0',
          totalAcceptedQuantity: '0',
          totalRejectedQuantity: '0',
          totalQuarantinedQty: '0',
          lines: [
            {
              id: 'rl-1',
              purchaseOrderLineId: 'pol-1',
              itemId: 'it-1',
              itemNameSnapshot: 'Widget',
              uom: 'EA',
              quantity: '0',
              orderedQuantity: '10',
              disposition: ReceiptOutcome.ACCEPTED,
              notes: null
            }
          ]
        }
      })

    const { result } = renderHook(() => useWarehousePurchaseOrderDetails('po-99'))

    await waitFor(() => {
      expect(result.current.orderLoadOutcome).toBe('ok')
    })

    expect(result.current.orderRow?.id).toBe('po-99')
    expect(result.current.resolvedAssignmentId).toBe('asg-1')
    await waitFor(() => {
      expect(result.current.receipt?.id).toBe('rec-1')
    })
    expect(mockGet).toHaveBeenCalledWith('/warehouse/orders/purchase')
    expect(mockGet).toHaveBeenCalledWith('/warehouse/orders/purchase/po-99/receipt')
  })

  it('POST handle then reloads receipt', async () => {
    mockGet
      .mockResolvedValueOnce({
        success: true,
        message: 'ok',
        data: [{
          id: 'po-99',
          reference: 'PO-99',
          status: OrderStatus.EXECUTING,
          supplier: 'Acme',
          warehouseId: 'WH-1',
          createdAt: '2026-01-01T00:00:00.000Z',
          businessPartyId: null,
          assignedUserId: 'u-1',
          activeOrderAssignmentId: 'asg-1',
          lastActiveAt: '2026-01-01T00:00:00.000Z',
          pausedAt: null
        }]
      })
      .mockResolvedValue({
        success: true,
        message: 'ok',
        data: {
          id: 'rec-1',
          reference: 'RCT-1',
          status: ReceiptStatus.IN_PROGRESS,
          purchaseOrderId: 'po-99',
          totalProcessedQuantity: '0',
          totalAcceptedQuantity: '0',
          totalRejectedQuantity: '0',
          totalQuarantinedQty: '0',
          lines: [
            {
              id: 'rl-1',
              purchaseOrderLineId: 'pol-1',
              itemId: 'it-1',
              itemNameSnapshot: 'Widget',
              uom: 'EA',
              quantity: '10',
              orderedQuantity: '10',
              disposition: ReceiptOutcome.ACCEPTED,
              notes: null
            }
          ]
        }
      })

    mockPost.mockResolvedValue({
      success: true,
      message: 'ok',
      data: {}
    })

    const { result } = renderHook(() => useWarehousePurchaseOrderDetails('po-99'))

    await waitFor(() => {
      expect(result.current.receipt?.lines[0].id).toBe('rl-1')
    })

    await act(async () => {
      await result.current.declareLineHandled('rl-1', {
        quantity: 10,
        disposition: ReceiptOutcome.ACCEPTED,
        notes: 'ok'
      })
    })

    expect(mockPost).toHaveBeenCalledWith(
      '/warehouse/orders/purchase/po-99/receipt/rec-1/lines/rl-1/handle',
      expect.objectContaining({
        quantity: 10,
        disposition: ReceiptOutcome.ACCEPTED,
        orderAssignmentId: 'asg-1',
        notes: 'ok'
      })
    )
    expect(mockGet.mock.calls.length).toBeGreaterThanOrEqual(3)
  })

  it('finalizes receipt when lines are fully declared', async () => {
    const row = {
      id: 'po-99',
      reference: 'PO-99',
      status: OrderStatus.EXECUTING,
      supplier: 'Acme',
      warehouseId: 'WH-1',
      createdAt: '2026-01-01T00:00:00.000Z',
      businessPartyId: null,
      assignedUserId: 'u-1',
      activeOrderAssignmentId: 'asg-1',
      lastActiveAt: '2026-01-01T00:00:00.000Z',
      pausedAt: null
    }

    const receiptBody = {
      id: 'rec-1',
      reference: 'RCT-1',
      status: ReceiptStatus.IN_PROGRESS,
      purchaseOrderId: 'po-99',
      totalProcessedQuantity: '10',
      totalAcceptedQuantity: '10',
      totalRejectedQuantity: '0',
      totalQuarantinedQty: '0',
      lines: [
        {
          id: 'rl-1',
          purchaseOrderLineId: 'pol-1',
          itemId: 'it-1',
          itemNameSnapshot: 'Widget',
          uom: 'EA',
          quantity: '10',
          orderedQuantity: '10',
          disposition: ReceiptOutcome.ACCEPTED,
          notes: null
        }
      ]
    }

    mockGet.mockImplementation(async (url: string) => {
      if (!url.includes('/receipt')) {
        return {
          success: true,
          message: 'ok',
          data: [row]
        }
      }

      return {
        success: true,
        message: 'ok',
        data: receiptBody
      }
    })

    mockPost.mockResolvedValue({
      success: true,
      message: 'ok',
      data: {}
    })

    const { result } = renderHook(() => useWarehousePurchaseOrderDetails('po-99'))

    await waitFor(() => {
      expect(result.current.canFinalizeReceipt).toBe(true)
    })

    await act(async () => {
      const out = await result.current.finalizeReceipt('done')

      expect(out.success).toBe(true)
    })

    expect(mockPost).toHaveBeenCalledWith(
      '/warehouse/orders/purchase/po-99/receipt/rec-1/complete',
      { orderAssignmentId: 'asg-1', notes: 'done' }
    )
  })
})
