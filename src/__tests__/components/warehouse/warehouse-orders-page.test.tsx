// @vitest-environment jsdom

import '@testing-library/jest-dom/vitest'

import { fireEvent, render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { usePurchaseOrders } from '@/components/warehouse/orders/use-purchase-orders'
import { WarehouseOrdersPageView } from '@/components/warehouse/orders/WarehouseOrdersPageView'
import { OrderStatus } from '@/generated/prisma'

const mockLoadOrders = vi.fn()
const mockToggleStatusFilter = vi.fn()
const mockRunAction = vi.fn()

vi.mock('@/components/warehouse/orders/use-purchase-orders', () => ({
  usePurchaseOrders: vi.fn()
}))

const mockUsePurchaseOrders = vi.mocked(usePurchaseOrders)

describe('WarehouseOrdersPageView', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('shows non-purchase placeholder', () => {
    mockUsePurchaseOrders.mockReturnValue({
      isPurchase: false,
      rows: [],
      filteredRows: [],
      cards: [],
      isLoading: false,
      listError: null,
      actionError: null,
      statusFilter: null,
      actingId: null,
      loadOrders: mockLoadOrders,
      toggleStatusFilter: mockToggleStatusFilter,
      runAction: mockRunAction
    })

    render(<WarehouseOrdersPageView orderType="sales" />)

    expect(screen.getByText(/not available on the floor yet/i)).toBeInTheDocument()
  })

  it('renders cards and toggles filter click', () => {
    mockUsePurchaseOrders.mockReturnValue({
      isPurchase: true,
      rows: [],
      filteredRows: [{
        id: 'po-1',
        reference: 'PO-001',
        status: OrderStatus.RELEASED,
        supplier: 'Acme',
        warehouseId: 'WH-1',
        createdAt: '2026-01-01T00:00:00.000Z',
        businessPartyId: null
      }],
      cards: [
        { status: OrderStatus.RELEASED, label: 'RELEASED', count: 1 },
        { status: OrderStatus.EXECUTING, label: 'EXECUTING', count: 0 },
        { status: OrderStatus.PAUSED, label: 'PAUSED', count: 0 }
      ],
      isLoading: false,
      listError: null,
      actionError: null,
      statusFilter: null,
      actingId: null,
      loadOrders: mockLoadOrders,
      toggleStatusFilter: mockToggleStatusFilter,
      runAction: mockRunAction
    })

    render(<WarehouseOrdersPageView orderType="purchase" />)

    fireEvent.click(screen.getByRole('button', { name: /released/i }))
    expect(mockToggleStatusFilter).toHaveBeenCalledWith(OrderStatus.RELEASED)
  })
})
