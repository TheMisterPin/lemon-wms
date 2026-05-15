// @vitest-environment jsdom

import '@testing-library/jest-dom/vitest'

import { fireEvent, render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { usePurchaseOrders } from '@/components/warehouse/orders/use-purchase-orders'
import { WarehouseOrdersPageView } from '@/components/warehouse/orders/warehouse-order-type-page-view'
import { OrderStatus } from '@/generated/prisma'

const mockLoadOrders = vi.fn()
const mockToggleStatusInFilter = vi.fn()
const mockRunAction = vi.fn()

vi.mock('@/components/warehouse/orders/use-purchase-orders', () => ({
  usePurchaseOrders: vi.fn()
}))

const mockUsePurchaseOrders = vi.mocked(usePurchaseOrders)

const baseHook = {
  rows: [],
  cards: [],
  totalOperational: 0,
  isLoading: false,
  loadOutcome: 'ok' as const,
  actingId: null,
  loadOrders: mockLoadOrders,
  runAction: mockRunAction,
  paginatedRows: [],
  filteredCount: 0,
  ordersPage: 0,
  ordersTotalPages: 1,
  ordersPrev: vi.fn(),
  ordersNext: vi.fn(),
  searchText: '',
  setSearchText: vi.fn(),
  sortBaseline: 'last-active' as const,
  setSortBaseline: vi.fn(),
  selectedStatuses: [OrderStatus.RELEASED, OrderStatus.EXECUTING, OrderStatus.PAUSED],
  toggleStatusInFilter: mockToggleStatusInFilter
}

describe('WarehouseOrdersPageView', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('shows unsupported segment placeholder', () => {
    mockUsePurchaseOrders.mockReturnValue({
      ...baseHook,
      segment: null,
      loadOutcome: 'idle'
    })

    render(<WarehouseOrdersPageView orderType="unknown" />)

    expect(screen.getByText(/not supported on the floor/i)).toBeInTheDocument()
  })

  it('renders summary chips and toggles status filter click', () => {
    mockUsePurchaseOrders.mockReturnValue({
      ...baseHook,
      segment: 'purchase',
      cards: [
        { status: OrderStatus.RELEASED, label: 'Released', count: 1 },
        { status: OrderStatus.EXECUTING, label: 'Executing', count: 0 },
        { status: OrderStatus.PAUSED, label: 'Paused', count: 0 }
      ],
      totalOperational: 1,
      paginatedRows: [{
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
      }],
      filteredCount: 1
    })

    render(<WarehouseOrdersPageView orderType="purchase" />)

    fireEvent.click(screen.getByRole('button', { name: /released/i }))
    expect(mockToggleStatusInFilter).toHaveBeenCalledWith(OrderStatus.RELEASED)
  })
})
