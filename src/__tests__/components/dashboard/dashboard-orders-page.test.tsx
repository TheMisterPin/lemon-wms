// @vitest-environment jsdom

import '@testing-library/jest-dom/vitest'

import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { DashboardOrdersPageView } from '@/components/dashboard/orders/dashboard-orders-page-view'
import { OrderStatus } from '@/generated/prisma'
import { dashboardApiClient } from '@/lib/axios'

vi.mock('@/lib/axios', () => ({
  dashboardApiClient: {
    get: vi.fn(),
    post: vi.fn()
  }
}))

vi.mock('@/components/dashboard/orders/create-purchase-order-modal', () => ({
  CreatePurchaseOrderModal: () => <div data-testid="create-po-modal" />
}))

const mockGet = vi.mocked(dashboardApiClient.get)

describe('DashboardOrdersPageView', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('shows not-available copy for non-purchase orderType', () => {
    render(<DashboardOrdersPageView orderType="sales" />)

    expect(
      screen.getByText(/This order type is not available in the dashboard yet/i)
    ).toBeInTheDocument()
    expect(mockGet).not.toHaveBeenCalled()
  })

  it('loads purchase orders and shows release for DRAFT rows', async () => {
    mockGet.mockResolvedValue({
      success: true,
      message: 'ok',
      data: [
        {
          id: 'po-1',
          reference: 'PO-001',
          status: OrderStatus.DRAFT,
          supplier: 'Acme',
          warehouseId: 'wh-1',
          createdAt: '2026-01-01T00:00:00.000Z',
          businessPartyId: 'bp-1'
        },
        {
          id: 'po-2',
          reference: 'PO-002',
          status: OrderStatus.RELEASED,
          supplier: 'Beta',
          warehouseId: 'wh-1',
          createdAt: '2026-01-02T00:00:00.000Z',
          businessPartyId: null
        }
      ]
    })

    render(<DashboardOrdersPageView orderType="purchase" />)

    expect(await screen.findByText('PO-001')).toBeInTheDocument()
    expect(screen.getByText('PO-002')).toBeInTheDocument()
    expect(mockGet).toHaveBeenCalledWith('/dashboard/orders/purchase')

    expect(screen.getAllByRole('button', { name: /release to warehouse/i })).toHaveLength(1)
  })

  it('shows list error and retry refetches', async () => {
    mockGet
      .mockResolvedValueOnce({
        success: false,
        message: 'Server error',
        data: null
      })
      .mockResolvedValueOnce({
        success: true,
        message: 'ok',
        data: []
      })

    render(<DashboardOrdersPageView orderType="purchase" />)

    expect(await screen.findByText('Server error')).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: /retry/i }))

    await waitFor(() => {
      expect(mockGet).toHaveBeenCalledTimes(2)
    })
  })
})
