// @vitest-environment jsdom

import '@testing-library/jest-dom/vitest'

import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { DashboardOrdersPageView } from '@/components/features/orders/components/dashboard-orders-page-view'
import { OrderStatus } from '@/generated/prisma'
import { dashboardApiClient } from '@/lib/axios'

vi.mock('@/lib/axios', () => ({
  dashboardApiClient: {
    get: vi.fn(),
    post: vi.fn()
  }
}))

vi.mock('@/components/features/orders/components/create-purchase-order-modal', () => ({
  CreatePurchaseOrderModal: () => <div data-testid="create-po-modal" />
}))

const mockGet = vi.mocked(dashboardApiClient.get)

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

function purchaseDashboardPayload() {
  return {
    title: 'Purchase orders',
    orderTypeRouteKey: 'purchase' as const,
    kpis: {
      totalOrders: 2,
      warehousesWithOrders: 1,
      aggregateProgressPercent: 10
    },
    statusDonut: [
      { status: 'DRAFT', count: 1 },
      { status: 'RELEASED', count: 1 }
    ],
    warehouseBars: [
      {
        warehouseId: 'wh-1',
        warehouseName: 'Warehouse 1',
        href: '/dashboard/locations/warehouses/wh-1',
        byStatus: { ...emptyByStatus, DRAFT: 1, RELEASED: 1 }
      }
    ],
    orders: [
      {
        orderId: 'po-1',
        orderLabel: 'PO-001',
        status: OrderStatus.DRAFT,
        warehouseId: 'wh-1',
        warehouseName: 'Warehouse 1',
        progressPercent: 0,
        href: '/dashboard/orders/purchase/po-1',
        createdAt: '2026-01-01T00:00:00.000Z'
      },
      {
        orderId: 'po-2',
        orderLabel: 'PO-002',
        status: OrderStatus.RELEASED,
        warehouseId: 'wh-1',
        warehouseName: 'Warehouse 1',
        progressPercent: 20,
        href: '/dashboard/orders/purchase/po-2',
        createdAt: '2026-01-02T00:00:00.000Z'
      }
    ],
    activities: [],
    purchaseOrdersForTable: [
      {
        id: 'po-1',
        reference: 'PO-001',
        status: OrderStatus.DRAFT,
        supplier: 'Acme',
        warehouseId: 'wh-1',
        createdAt: '2026-01-01T00:00:00.000Z',
        businessPartyId: 'bp-1',
        lineCount: 0,
        lines: []
      },
      {
        id: 'po-2',
        reference: 'PO-002',
        status: OrderStatus.RELEASED,
        supplier: 'Beta',
        warehouseId: 'wh-1',
        createdAt: '2026-01-02T00:00:00.000Z',
        businessPartyId: null,
        lineCount: 0,
        lines: []
      }
    ]
  }
}

describe('DashboardOrdersPageView', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('shows not-available copy for unsupported orderType', () => {
    render(<DashboardOrdersPageView orderType="return" />)

    expect(
      screen.getByText(/This order type is not available in the dashboard yet/i)
    ).toBeInTheDocument()
    expect(mockGet).not.toHaveBeenCalled()
  })

  it('loads sales dashboard when orderType is sales', async () => {
    mockGet.mockResolvedValue({
      success: true,
      message: 'ok',
      data: {
        title: 'Sales orders',
        orderTypeRouteKey: 'sales',
        kpis: { totalOrders: 0, warehousesWithOrders: 0, aggregateProgressPercent: 0 },
        statusDonut: [],
        warehouseBars: [],
        orders: [],
        activities: []
      }
    })

    render(<DashboardOrdersPageView orderType="sales" />)

    expect(await screen.findByText('Sales orders')).toBeInTheDocument()
    expect(mockGet).toHaveBeenCalledWith('/dashboard/orders/sales')
  })

  it('loads purchase orders and shows release for DRAFT rows', async () => {
    mockGet.mockResolvedValue({
      success: true,
      message: 'ok',
      data: purchaseDashboardPayload()
    })

    render(<DashboardOrdersPageView orderType="purchase" />)

    expect((await screen.findAllByText('PO-001')).length).toBeGreaterThanOrEqual(1)
    expect(screen.getAllByText('PO-002').length).toBeGreaterThanOrEqual(1)
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
        data: purchaseDashboardPayload()
      })

    render(<DashboardOrdersPageView orderType="purchase" />)

    expect(await screen.findByText('Server error')).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: /retry/i }))

    await waitFor(() => {
      expect(mockGet).toHaveBeenCalledTimes(2)
    })
  })
})
