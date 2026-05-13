// @vitest-environment jsdom

import '@testing-library/jest-dom/vitest'

import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'

import { DashboardOrdersPageView } from '@/components/features/orders/components/dashboard-orders-page-view'
import { OrderTypeOverview } from '@/components/features/orders/components/order-type-overview'
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
    activities: []
  }
}

function purchaseOverviewWithManyOrders() {
  const base = purchaseDashboardPayload()
  const more = Array.from({ length: 5 }, (_, index) => ({
    orderId: `po-bulk-${index}`,
    orderLabel: `PO-BULK-${index}`,
    status: OrderStatus.RELEASED,
    warehouseId: 'wh-1',
    warehouseName: 'Warehouse 1',
    progressPercent: index * 5,
    href: `/dashboard/orders/purchase/po-bulk-${index}`,
    createdAt: '2026-01-03T00:00:00.000Z'
  }))

  return {
    ...base,
    orders: [...base.orders, ...more],
    kpis: { ...base.kpis, totalOrders: base.orders.length + more.length }
  }
}

describe('DashboardOrdersPageView', () => {
  beforeAll(() => {
    Element.prototype.hasPointerCapture = (): boolean => false
    Element.prototype.releasePointerCapture = (): void => undefined
    Element.prototype.setPointerCapture = (): void => undefined
    HTMLElement.prototype.scrollIntoView = (): void => undefined
  })

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

  it('loads purchase orders and shows create modal action', async () => {
    mockGet.mockResolvedValue({
      success: true,
      message: 'ok',
      data: purchaseDashboardPayload()
    })

    render(<DashboardOrdersPageView orderType="purchase" />)

    expect((await screen.findAllByText('PO-001')).length).toBeGreaterThanOrEqual(1)
    expect(screen.getAllByText('PO-002').length).toBeGreaterThanOrEqual(1)
    expect(mockGet).toHaveBeenCalledWith('/dashboard/orders/purchase')

    expect(screen.getByTestId('create-po-modal')).toBeInTheDocument()
  })

  it('filters purchase orders by status on the overview', async () => {
    const user = userEvent.setup()
    render(<OrderTypeOverview data={purchaseDashboardPayload()} />)

    await screen.findByText('PO-001')

    await user.click(screen.getByRole('combobox', { name: /order status filter \(overview\)/i }))
    await user.click(await screen.findByRole('option', { name: /^released$/i }))

    expect(screen.queryByText('PO-001')).not.toBeInTheDocument()
    expect(screen.getAllByText('PO-002').length).toBeGreaterThanOrEqual(1)
  })

  it('reorders overview cards by completion when sort is enabled', async () => {
    const user = userEvent.setup()
    render(<OrderTypeOverview data={purchaseDashboardPayload()} />)

    const po1Heading = await screen.findByText('PO-001')
    const po2Heading = screen.getByText('PO-002')

    expect(po1Heading.compareDocumentPosition(po2Heading) & Node.DOCUMENT_POSITION_FOLLOWING).not.toBe(0)

    await user.click(screen.getByRole('checkbox', { name: /sort by completion %/i }))

    expect(po2Heading.compareDocumentPosition(po1Heading) & Node.DOCUMENT_POSITION_FOLLOWING).not.toBe(0)
  })

  it('shows matching filter controls inside the orders sheet', async () => {
    const user = userEvent.setup()
    render(<OrderTypeOverview data={purchaseOverviewWithManyOrders()} />)

    await screen.findByText('PO-001')
    await user.click(screen.getByRole('button', { name: /show all/i }))

    await screen.findByRole('combobox', { name: /order status filter \(all orders\)/i })

    expect(
      screen.getAllByRole('checkbox', {
        hidden: true,
        name: /sort by completion %/i
      })
    ).toHaveLength(2)
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
